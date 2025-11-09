import type { VideoItem } from "./VideoMeet";


interface PinnedVideoProps {
  videos: VideoItem[];
  pinnedVideo: string | null;
  setPinnedVideo: React.Dispatch<React.SetStateAction<string | null>>;
  id: string; // ✅ new local unique id for UI
  socketId: string; // ✅ unique peer id
  userName: string;
  stream?: MediaStream;
  autoplay?: boolean;
  playsinline?: boolean;
  isLocal?: boolean;
  ref?: React.RefObject<HTMLVideoElement>;
}



const PinnedVideo: React.FC<PinnedVideoProps> = ({
  videos,
  pinnedVideo,
  setPinnedVideo,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {pinnedVideo && (
        <div className="w-[70vw] h-[70vh] rounded-2xl overflow-hidden shadow-lg">
          <video
            ref={videos.find((v) => v.id === pinnedVideo)?.ref}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className={`w-[18vw] h-[18vh] rounded-xl overflow-hidden cursor-pointer transition-all ${pinnedVideo === vid.id ? "ring-4 ring-blue-500" : ""
              }`}
            onClick={() =>
              setPinnedVideo(pinnedVideo === vid.id ? null : vid.id)
            }
          >
            <video
              ref={vid.ref}
              autoPlay
              playsInline
              muted={vid.isLocal}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedVideo;
