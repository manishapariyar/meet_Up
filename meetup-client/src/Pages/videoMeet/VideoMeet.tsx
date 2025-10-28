import { useEffect, useRef, useState } from "react";


declare global {
  interface Window {
    localStream?: MediaStream;
    getTrack?: MediaStreamTrack;
  }
}

const server_url = import.meta.env.VITE_BACKEND_URL;
var connections = {};
const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ]
}

export interface VideoMeetProps {


}

const VideoMeet = () => {
  var socketRef = useRef(null);
  let socketIdRef = useRef("");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [video, setVideo] = useState<boolean>(true);
  const [audio, setAudio] = useState<boolean>(true);
  let [screenShare, setScreenShare] = useState();


  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");

  let [newMessage, setNewMessage] = useState("");
  let [userName, setUserName] = useState("");

  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

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
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
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



  let getMedia = () => {
    setVideo(videoStream);
    setAudio(audioStream);
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