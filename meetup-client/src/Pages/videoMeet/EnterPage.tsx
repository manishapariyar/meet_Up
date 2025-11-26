import React from 'react'


interface EnterPageProps {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  roomName: string;
  setRoomName: React.Dispatch<React.SetStateAction<string>>;
  setShareLink: React.Dispatch<React.SetStateAction<string>>;
  setAskForUserName: React.Dispatch<React.SetStateAction<boolean>>;
  getPermission: () => Promise<void>;
  getMedia: (room: string, userName: string) => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;


}

const EnterPage: React.FC<EnterPageProps> = ({
  userName,
  setUserName,
  roomName,
  setRoomName,
  setShareLink,
  setAskForUserName,
  getPermission,
  getMedia
  ,
  localVideoRef

}) => {

  const connect = async () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    const room = roomName.trim() || `room-${Math.random().toString(36).substring(7)}`;
    setRoomName(room);

    const fullLink = `${window.location.origin}${window.location.pathname}?room=${room}`;
    setShareLink(fullLink);

    setAskForUserName(false);
    await getPermission();
    getMedia(room, userName);
  };


  return (
    <div className="flex flex-col items-center justify-center p-10 bg-neutral-200 w-full h-full gap-6">
      <h1 className="text-2xl font-bold text-blue-600">Join or Create a Meeting</h1>

      <div className=" bg-[#08081] w-full  flex flex-row justify-center items-center">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "400px", height: "300px", background: "black", borderRadius: "10px" }} />
        <div className="m-4 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Your Name"
            className="px-4 py-2 border border-gray-500  rounded-lg"
            value={userName}
            onChange={(e) => setUserName(e.target.value)} />
          <input
            type="text"
            placeholder="Room Name (optional)"
            className="px-4 py-2 border  border-gray-500 rounded-lg"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)} />
          <button
            onClick={connect}
            className="bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnterPage