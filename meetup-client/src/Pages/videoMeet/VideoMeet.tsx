import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiFillAudio, AiOutlineAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { IoVideocamOff, IoVideocam } from "react-icons/io5";
import { MdCallEnd, MdOutlineScreenShare, MdOutlineStopScreenShare } from "react-icons/md";
import { RxButton } from "react-icons/rx";
import { io, Socket } from "socket.io-client";
import ChatBox from "./ChatBox";
import { IoMdChatbubbles } from "react-icons/io";
import { TiPinOutline } from "react-icons/ti";
import PinnedVideo from "./PinnedVideo";
import EnterPage from "./EnterPage";

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

export interface VideoItem {
  id: string;
  socketId: string;
  userName: string;
  stream?: MediaStream;
  autoplay?: boolean;
  playsinline?: boolean;
  isLocal?: boolean;
  ref?: React.RefObject<HTMLVideoElement>;
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
  const [roomName, setRoomName] = useState("");
  const [askForUserName, setAskForUserName] = useState(true);
  const [shareLink, setShareLink] = useState("");
  // Chat states
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; fromMe: boolean }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [pinnedVideo, setPinnedVideo] = useState<string | null>(null);
  const [showPinned, setShowPinned] = useState(false);

  // ✅ Extract room from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (roomFromUrl) {
      setRoomName(roomFromUrl);
      setAskForUserName(true); // still ask username
    }
  }, []);

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
      }
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      try {
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

  const gotMessageFromServer = (fromId: string, message: string) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

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
              });
          }
        });
    }

    if (signal.ice) {
      peer.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(console.error);
    }
  };

  const connectToSocketServer = (room: string, userName: string) => {
    socketRef.current = io(server_url, { secure: true });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current?.id;
      console.log("🟢 Connected with socket ID:", socketIdRef.current);
      socketRef.current?.emit("join-call", { room, userName });


      socketRef.current?.on("user-disconnected", (id) => {
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
      });

      socketRef.current?.on("user-joined", (id, data) => {
        // Case 1: When you join, you get a list of existing clients
        if (!id && Array.isArray(data)) {
          data.forEach(({ socketId, userName }) => {
            if (connections[socketId]) return;

            const peer = new RTCPeerConnection(peerConfigConnections);
            connections[socketId] = peer;

            peer.onicecandidate = (event) => {
              if (event.candidate) {
                socketRef.current?.emit(
                  "signal",
                  socketId,
                  JSON.stringify({ ice: event.candidate })
                );
              }
            };

            peer.ontrack = (event: RTCTrackEvent) => {
              const stream = event.streams[0];
              setVideos((prev) => {
                const exists = prev.some((v) => v.socketId === socketId);
                if (exists) return prev;
                return [
                  ...prev,
                  {
                    socketId,
                    userName,
                    stream,
                    autoplay: true,
                    playsinline: true,
                    id: `${socketId}-${Date.now()}`, // ✅ unique key
                  },
                ];
              });

            };

            if (window.localStream) {
              window.localStream.getTracks().forEach((track) => {
                peer.addTrack(track, window.localStream!);
              });
            }

            // Create offer to existing clients
            peer
              .createOffer()
              .then((description) => peer.setLocalDescription(description))
              .then(() => {
                socketRef.current?.emit(
                  "signal",
                  socketId,
                  JSON.stringify({ sdp: peer.localDescription })
                );
              });
          });
        }

        // Case 2: A new user joins after you
        else if (id && typeof data === "string") {
          console.log(`🟢 New user joined: ${data}`);
          const peer = new RTCPeerConnection(peerConfigConnections);
          connections[id] = peer;

          peer.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current?.emit(
                "signal",
                id,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          peer.ontrack = (event: RTCTrackEvent) => {
            const stream = event.streams[0];
            setVideos((prev) => {
              const exists = prev.some((v) => v.socketId === id);
              if (exists) return prev;
              return [
                ...prev,
                {
                  socketId: id,
                  userName: data,
                  stream,
                  autoplay: true,
                  playsinline: true,
                  id: `${id}-${Date.now()}`,
                },
              ];
            });

          };

          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => {
              peer.addTrack(track, window.localStream!);
            });
          }
        }
      });

    });

    window.addEventListener("beforeunload", () => {
      socketRef.current?.disconnect();
      Object.values(connections).forEach((conn) => conn.close());
    });
  };

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("chat-message", (msg) => {
      // msg = { sender, text, socketId }
      if (msg.socketId === socketIdRef.current) return;
      setChatMessages((prev) => [
        ...prev,
        { sender: msg.sender, text: msg.text, fromMe: false },
      ]);
    });

    return () => {
      socketRef.current?.off("chat-message");
    };
  }, [socketRef.current]);



  const getMedia = async (room: string, userName: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });
      window.localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      connectToSocketServer(room, userName);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };



  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast("✅ Meeting link copied to clipboard!");
  };
  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    socketRef.current?.emit("chat-message", {
      text: newMessage,
      sender: userName,
    });

    setChatMessages((prev) => [...prev, { sender: userName, text: newMessage, fromMe: true }]);
    setNewMessage("");
  };

  const handleVideo = () => {
    const videoTrack = window.localStream?.getVideoTracks()[0];
    if (!videoTrack) return;

    const enabled = !videoTrack.enabled;
    videoTrack.enabled = enabled;
    setIsVideoEnabled(enabled);

    // Update local preview
    if (localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = enabled ? window.localStream : null;
    }

    // Update remote peers
    Object.values(connections).forEach((peer) => {
      const sender = peer.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(enabled ? videoTrack : null);
    });
  };

  const handleAudio = () => {
    const audioTrack = window.localStream?.getAudioTracks()[0];
    if (!audioTrack) return;

    const enabled = !audioTrack.enabled;
    audioTrack.enabled = enabled;
    setIsAudioEnabled(enabled);

    // Update remote peers
    Object.values(connections).forEach((peer) => {
      const sender = peer.getSenders().find((s) => s.track?.kind === "audio");
      if (sender) sender.replaceTrack(enabled ? audioTrack : null);
    });
  };

  const handleScreenShare = async () => {
    if (!screenAvailable) {
      // Start screen share
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];

        // Replace the local camera track with screen track
        Object.values(connections).forEach((peer) => {
          const sender = peer.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        // Show shared screen in your own preview
        if (localVideoRef.current) localVideoRef.current.srcObject = displayStream;

        // When user stops screen share from browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };

        setScreenAvailable(true);
      } catch (err) {
        console.error("Screen share failed:", err);
        setScreenAvailable(false);
      }
    } else {
      stopScreenShare();
    }
  };
  const stopScreenShare = () => {
    const videoTrack = window.localStream?.getVideoTracks()[0];
    if (!videoTrack) return;

    // Replace screen with webcam stream
    Object.values(connections).forEach((peer) => {
      const sender = peer.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(videoTrack);
    });

    // Restore local preview
    if (localVideoRef.current && window.localStream) localVideoRef.current.srcObject = window.localStream;

    setScreenAvailable(false);
  };

  const handleEndCall = () => {
    // Stop all local tracks
    window.localStream?.getTracks().forEach((track) => track.stop());

    // Close all peer connections
    Object.values(connections).forEach((peer) => peer.close());
    connections = {};

    // Disconnect from socket
    socketRef.current?.disconnect();

    // Clear UI
    setVideos([]);
    setShowChat(false);
    setAskForUserName(true);
    setRoomName("");
    setShareLink("");
    setUserName("");

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    toast("Call ended.");
  };


  return (
    <div>
      {askForUserName ? (
        <>
          <EnterPage
            userName={userName}
            setUserName={setUserName}
            roomName={roomName}
            setRoomName={setRoomName}
            setShareLink={setShareLink}
            setAskForUserName={setAskForUserName}
            getPermission={getPermission}
            getMedia={getMedia}
            localVideoRef={localVideoRef}

          />

        </>
      ) : (
        <>

          <div className="relative h-screen bg-[#08081b]  w-full">
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center gap-2">
              <button
                onClick={handleVideo}
                className="p-1 rounded-xl bg-transparent hover:bg-gray-200 transition shadow-lg"
              >
                {isVideoEnabled ? (
                  <IoVideocam className="text-gray-800 text-3xl" />
                ) : (
                  <IoVideocamOff className="text-red-700 text-3xl" />
                )}

              </button>
              <button className="p-1 rounded-xl bg-transparent hover:bg-gray-200 transition shadow-lg"
                onClick={handleAudio}
              >
                {isAudioEnabled ? (
                  <AiOutlineAudio className="text-gray-800 text-3xl" />

                ) : (
                  <AiOutlineAudioMuted className="text-red-700 text-3xl" />
                )}
              </button>
              <button className="p-1 rounded-xl bg-transparent hover:bg-gray-200 transition shadow-lg" onClick={handleEndCall}>
                <MdCallEnd className="text-red-700 text-3xl" />
              </button>

              <button className="p-1 rounded-xl bg-transparent hover:bg-gray-200 transition shadow-lg"
                onClick={handleScreenShare}
              >
                {screenAvailable ? (
                  <MdOutlineScreenShare className="text-gray-800 text-3xl" />
                ) : (
                  <MdOutlineStopScreenShare className="text-red-700 text-3xl" />
                )}
              </button>
              <button
                onClick={() => setShowChat((prev) => !prev)}
                className="p-1 rounded-xl bg-transparent hover:bg-gray-200 transition shadow-lg"
              >
                <IoMdChatbubbles className="text-gray-800 text-3xl" />
              </button>
            </div>
            {/* 💬 Chat Toggle Button */}


            <ChatBox
              showChat={showChat}
              setShowChat={setShowChat}
              chatMessages={chatMessages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
            />



            <div className="absolute bottom-20 right-3">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "auto",
                  height: "200px",
                  backgroundColor: "black",
                  borderRadius: "10px",
                  marginTop: "10px",
                  marginLeft: "8px",
                  objectFit: "cover",
                  right: "2px"

                }}
              />
              <div className="absolute bottom-2 left-4 flex items-center gap-2">
                <h1 className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {userName || "Guest"}
                </h1>
                <TiPinOutline className="text-amber-500 text-2xl hover:cursor-pointer" onClick={() => setShowPinned(true)} />


              </div>
              {showPinned && (
                <div className="absolute inset-0 bg-black/80 flex justify-center items-center z-50">
                  <PinnedVideo
                    videos={videos}
                    pinnedVideo={pinnedVideo}
                    setPinnedVideo={setPinnedVideo}
                    socketId={""}
                    id=""
                    userName={userName}
                  />
                </div>
              )}
            </div>
            <div className="flex ">
              {videos.map((video) => (
                <div key={video.id} className="relative m-1">
                  <video
                    autoPlay
                    playsInline
                    data-socket={video.socketId}
                    ref={(el) => {
                      if (el && video.stream) el.srcObject = video.stream;
                    }}
                    style={{
                      width: "auto",
                      height: "200px",
                      backgroundColor: "black",
                      borderRadius: "2px",
                      objectFit: "cover",
                    }}
                  ></video>

                  <div className="absolute bottom-2 left-4 flex items-center gap-2">
                    <h1 className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      {video.userName || "Guest"}
                    </h1>
                    <TiPinOutline className=" text-2xl hover:cursor-pointer" onClick={() => setShowPinned(true)} />
                  </div>
                </div>
              ))}
            </div>
          </div>




        </>
      )}
    </div>
  );
};

export default VideoMeet;
