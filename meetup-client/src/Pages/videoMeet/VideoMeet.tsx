
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

declare global {
  interface Window {
    localStream?: MediaStream;
    getTrack?: MediaStreamTrack;
  }
}

const server_url = import.meta.env.VITE_BACKEND_URL;
var connections: { [key: string]: RTCPeerConnection } = {};
const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ]
}

export interface VideoMeetProps {



}
interface VideoItem {
  socketId: string;
  stream?: MediaStream;
  autoplay?: boolean;
  playsinline?: boolean;
}

const VideoMeet = () => {
  const socketRef = useRef<Socket | null>(null);
  let socketIdRef = useRef<string | undefined>(undefined);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [video, setVideo] = useState<boolean>(true);
  const [audio, setAudio] = useState<boolean>(true);
  let [screenShare, setScreenShare] = useState();


  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");

  let [newMessage, setNewMessage] = useState("");
  let [userName, setUserName] = useState("");


  const videoRef = useRef<VideoItem[]>([]);
  let [videos, setVideos] = useState<VideoItem[]>([]);

  const [videoStream, setVideoStream] = useState<boolean>(true);
  const [audioStream, setAudioStream] = useState<boolean>(true);
  const [screenAvailable, setScreenAvailable] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [askForUserName, setAskForUserName] = useState<boolean>(true);



  //  if(isChrome()===false)


  const getPromission = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) {
        setVideoStream(true);
      } else {
        setVideoStream(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (audioPermission) {
        setAudioStream(true);
      } else {
        setAudioStream(false);
      }
      const videoSharePermission = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      if (videoSharePermission) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoStream || audioStream) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoStream,
          audio: audioStream
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }

        }
      }


    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }

  useEffect(() => {
    getPromission();
  }, []);

  // close tracks when videoStream or audioStream changes
  let getUserMediaSuccess = (stream: MediaStream) => {
    try {
      const local = window.localStream;
      if (local) {
        local.getTracks().forEach(track => {
          track.stop();
        });
      } else if (stream) {
        // fallback to the stream passed into the handler
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          connections[id].addTrack(track, window.localStream!);
        });
      }
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current?.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
      }).catch(e => console.log(e));
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);
      try {
        const srcObject = localVideoRef.current?.srcObject;
        if (srcObject instanceof MediaStream) {
          const tracks = srcObject.getTracks();
          tracks.forEach((t) => t.stop());
        }
      } catch (e) { console.log(e) }
      // todo blacksilence

      for (let id in connections) {
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => {
            connections[id].addTrack(track, window.localStream!);
          });
        }
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current?.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
        }).catch(e => console.log(e));

      }
    })

  }

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    // let dst = oscillator.connect(ctx.createMediaStreamDestination);

  }

  let getUserMedia = () => {
    if (videoStream || audioStream) {
      navigator.mediaDevices.getUserMedia({
        video: video,
        audio: audio
      })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((error) => {
          console.error("Error accessing media devices.", error);
        });
    } else {
      try {
        const srcObject = localVideoRef.current?.srcObject;
        if (srcObject instanceof MediaStream) {
          const tracks = srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
      } catch (error) {
        console.error("Error stopping media tracks.", error);
      }
    }
  }
  let gotMessageFromServer = (fromId: any, message: string) => {
    var signal = JSON.parse(message)
    if (fromId === socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {


            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current?.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
              }).catch(e => console.log(e))
            }).catch(e => console.log(e))
          }
        }).catch(e => console.log(e))
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
      }
    }
  }
  let addMessage = (data: any) => {
  }

  let connectToSocketServer = () => {
    socketRef.current = io(server_url, { secure: true });
    socketRef.current.on('signal', gotMessageFromServer);
    socketRef.current.on('connect', () => {

      socketRef.current?.emit("join-room", window.location.href);
      socketIdRef.current = socketRef.current?.id;
      socketRef.current?.on("chat-message", addMessage);
      socketRef.current?.on("user-left", (id) => {
        setVideos((prevVideos) => prevVideos.filter((video) => video.socketId !== id));
      });
      socketRef.current?.on("user-joined", (id, clients) => {
        if (Array.isArray(clients)) {
          clients.forEach((clientId: string) => {
            connections[clientId] = new RTCPeerConnection(peerConfigConnections);

            // send any ice candidates to the other peer
            connections[clientId].onicecandidate = (event) => {
              if (event.candidate !== null) {
                socketRef.current?.emit("signal", clientId, JSON.stringify({ 'ice': event.candidate }));
              }
            }


            //add stream to the peer connection
            connections[clientId].ontrack = (event: any) => {
              const stream = event.streams[0];
              let videoExists = videoRef.current.find(video => video.socketId === clientId);

              if (videoExists) {
                setVideos((videos) => {
                  const updatedVideos = videos.map(v =>
                    v.socketId === clientId ? { ...v, stream } : v
                  );
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              }
              else {
                let newVideo = {
                  socketId: clientId,
                  stream: event.stream,
                  autoplay: true,
                  playsinline: true
                }
                setVideos(videos => {
                  const updatedVideos = [...videos, newVideo];
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                })
              }
            }

            if (window.localStream) {
              window.localStream.getTracks().forEach((track) => {
                connections[clientId].addTrack(track, window.localStream!);
              });
            } else {
              // blackSilence


            }

            if (id === socketIdRef.current) {
              for (const id2 in connections) {
                if (id2 === socketIdRef.current) continue;

                try {
                  if (window.localStream) {
                    window.localStream.getTracks().forEach((track) => {
                      connections[id2].addTrack(track, window.localStream!);
                    });
                  }
                } catch (e) {
                  console.error("Error adding local tracks", e);
                }

                connections[id2]
                  .createOffer()
                  .then((description) => {
                    return connections[id2].setLocalDescription(description);
                  })
                  .then(() => {
                    socketRef.current?.emit(
                      "signal",
                      id2,
                      JSON.stringify({ sdp: connections[id2].localDescription })
                    );
                  })
                  .catch((e) => console.error("Offer error", e));
              }
            }



          });
        }
      });
    });

  }

  let getMedia = () => {
    setVideo(videoStream);
    setAudio(audioStream);
    connectToSocketServer();
  }

  const connect = () => {
    setAskForUserName(false);
    getMedia();
  }

  return (
    <div>
      {askForUserName === true ?

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
            <button onClick={connect} className="bg-amber-400 py-2 px-4 rounded-xl text-white font-itim font-bold cursor-pointer hover:bg-amber-500 transition">
              connect
            </button>
          </div>
          <div className="">
            <video ref={localVideoRef} autoPlay muted></video>
          </div>

        </div> :
        <></>
      }
    </div>
  )
}

export default VideoMeet