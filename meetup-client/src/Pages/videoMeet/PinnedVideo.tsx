import React, { useEffect, useRef } from "react";
import type { VideoItem } from "./VideoMeet";

interface PinnedVideoProps {
  videos: VideoItem[];
  pinnedVideo: string | null;
  setPinnedVideo: React.Dispatch<React.SetStateAction<string | null>>;
}

const PinnedVideo: React.FC<PinnedVideoProps> = ({
  videos,
  pinnedVideo,
  setPinnedVideo,
}) => {
  // ref for the large pinned video
  const pinnedRef = useRef<HTMLVideoElement | null>(null);

  // find the selected video item
  const selected = videos.find((v) => v.id === pinnedVideo);

  // attach stream to the pinnedRef when pinned changes
  useEffect(() => {
    if (!pinnedRef.current) return;
    if (selected?.stream) {
      pinnedRef.current.srcObject = selected.stream;
      // ensure autoplay / playsinline
      pinnedRef.current.play().catch(() => { });
    } else {
      // clear if nothing selected
      pinnedRef.current.srcObject = null;
    }
    // cleanup when unmount or change
    return () => {
      if (pinnedRef.current) pinnedRef.current.srcObject = null;
    };
  }, [selected]);

  return (
    <div className="flex flex-col items-center gap-4">
      {selected && (
        <div className="w-[100vw] h-[70vh] rounded-2xl overflow-hidden shadow-lg">
          <video
            ref={pinnedRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            muted={selected.isLocal} // optional
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className={`w-[18vw] h-[18vh] rounded-xl overflow-hidden cursor-pointer transition-all ${pinnedVideo === vid.id ? "ring-4 ring-blue-500" : ""
              }`}
            onClick={() => setPinnedVideo(pinnedVideo === vid.id ? null : vid.id)}
          >
            <VideoThumb video={vid} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedVideo;

/* small helper component for thumbnails */
const VideoThumb: React.FC<{ video: VideoItem }> = ({ video }) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current && video.stream) {
      ref.current.srcObject = video.stream;
      ref.current.play().catch(() => { });
    }
    return () => {
      if (ref.current) ref.current.srcObject = null;
    };
  }, [video.stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={video.isLocal}
      className="w-full h-full object-cover"
    />
  );
};
