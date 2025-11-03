import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

declare global {
  interface Window {
    localStream?: MediaStream;
  }
}

const server_url = import.meta.env.VITE_BACKEND_URL;
var connections: { [key: string]: RTCPeerConnection } = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

interface VideoItem {
  socketId: string;
  stream?: MediaStream;
  autoplay?: boolean;
  playsinline?: boolean;
}

const VideoMeet = () => {
  const socketRef = useRef<Socket | null>(null);
  const socketIdRef = useRef<string | undefined>(undefined);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const videoRef = useRef<VideoItem[]>([]);

  const [userName, setUserName] = useState("");
  const [askForUserName, setAskForUserName] = useState(true);

  // ✅ Fixed permissions (audio/video)
  const getPermission = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("✅ Local media captured:", userMediaStream);
      window.localStream = userMediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMediaStream;
        console.log("🎥 Local video element set");
      }

      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      try {
        // optional screen share check
        const display = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        if (display) setScreenAvailable(true);
      } catch {
        setScreenAvailable(false);
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  useEffect(() => {
    getPermission();
  }, []);

  // silence + black screen
  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const blackScreen = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height });
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
    }

    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };


  // ✅ Fixed condition in signaling handler
  const gotMessageFromServer = (fromId: string, message: string) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return; // ignore self messages ✅

    const peer = connections[fromId];
    if (!peer) return;

    if (signal.sdp) {
      peer
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            peer
              .createAnswer()
              .then((description) => peer.setLocalDescription(description))
              .then(() => {
                socketRef.current?.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: peer.localDescription })
                );
              })
              .catch((e) => console.error("Answer error", e));
          }
        })
        .catch((e) => console.error("Remote description error", e));
    }

    if (signal.ice) {
      peer
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.error("ICE candidate error", e));
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io(server_url, { secure: true });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current?.id;

      socketRef.current?.on("user-left", (id) => {
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video.socketId !== id)
        );
      });

      // ✅ Fixed user-joined handling and symmetric signaling
      socketRef.current?.on("user-joined", (id, clients) => {
        if (Array.isArray(clients)) {
          clients.forEach((clientId: string) => {
            if (connections[clientId]) return;

            const peer = new RTCPeerConnection(peerConfigConnections);
            connections[clientId] = peer;

            peer.onicecandidate = (event) => {
              if (event.candidate) {
                socketRef.current?.emit(
                  "signal",
                  clientId,
                  JSON.stringify({ ice: event.candidate })
                );
              }
            };

            peer.ontrack = (event: RTCTrackEvent) => {
              const stream = event.streams[0];
              setVideos((prev) => {
                const exists = prev.find((v) => v.socketId === clientId);
                if (exists) {
                  const updated = prev.map((v) =>
                    v.socketId === clientId ? { ...v, stream } : v
                  );
                  videoRef.current = updated;
                  return updated;
                }
                const newVideo = {
                  socketId: clientId,
                  stream,
                  autoplay: true,
                  playsinline: true,
                };
                const updated = [...prev, newVideo];
                videoRef.current = updated;
                return updated;
              });
            };

            // ✅ Add local tracks
            if (window.localStream) {
              window.localStream.getTracks().forEach((track) => {
                peer.addTrack(track, window.localStream!);
              });
            } else {
              const blackSilenceStream = new MediaStream([
                blackScreen(),
                silence(),
              ]);
              window.localStream = blackSilenceStream;
              blackSilenceStream.getTracks().forEach((track) => {
                peer.addTrack(track, blackSilenceStream);
              });
            }

            // ✅ Offer/Answer exchange
            if (id === socketIdRef.current) {
              for (const id2 in connections) {
                if (id2 === socketIdRef.current) continue;
                const conn = connections[id2];
                conn
                  .createOffer()
                  .then((description) => conn.setLocalDescription(description))
                  .then(() => {
                    socketRef.current?.emit(
                      "signal",
                      id2,
                      JSON.stringify({ sdp: conn.localDescription })
                    );
                  })
                  .catch((e) => console.error("Offer error", e));
              }
            }
          });
        }
      });
    });

    // ✅ Cleanup on unmount
    window.addEventListener("beforeunload", () => {
      socketRef.current?.disconnect();
      Object.values(connections).forEach((conn) => conn.close());
    });
  };

  const getMedia = async () => {

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });
      window.localStream = stream; // store it globally or in ref
      connectToSocketServer();
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const connect = async () => {
    try {
      setAskForUserName(false);
      await getPermission(); // ✅ Camera starts only when user clicks Connect
      getMedia();            // ✅ Then connect to signaling server
    } catch (err) {
      console.error("Error starting connection:", err);
    }
  };



  return (
    <div>
      {askForUserName ? (
        <div>
          <h1>Please enter your name to join the meeting</h1>
          <div className="relative w-full m-4 gap-4 flex">
            <label
              htmlFor="username"
              className="absolute left-3 -top-2 px-1 text-sm text-gray-700 bg-white"
            >
              Full Name
            </label>

            <input
              type="text"
              id="username"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
            />
            <button
              onClick={connect}
              className="bg-amber-400 py-2 px-4 rounded-xl text-white font-itim font-bold cursor-pointer hover:bg-amber-500 transition"
            >
              Connect
            </button>
          </div>
          <div>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "400px",
                height: "300px",
                backgroundColor: "black",
                borderRadius: "10px",
                objectFit: "cover",
                marginTop: "10px",
              }}
            ></video>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "400px",
              height: "300px",
              backgroundColor: "black",
              borderRadius: "10px",
              objectFit: "cover",
              marginTop: "10px",
            }}
          ></video>


          {videos.map((video) => (
            <div key={video.socketId}>
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el && video.stream) el.srcObject = video.stream;
                }}
                style={{
                  width: "400px",
                  height: "300px",
                  backgroundColor: "black",
                  borderRadius: "10px",
                  objectFit: "cover",
                  marginTop: "10px",
                }}
              ></video>


            </div>
          ))}
        </>
      )}


    </div>

  );
};

export default VideoMeet;
