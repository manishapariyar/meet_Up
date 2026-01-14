import React, { memo, useEffect, useRef } from "react";
import { TiPinOutline } from "react-icons/ti";


interface VideoCardProps {
  socketId: string;
  stream: MediaStream | null | undefined;
  userName?: string;
  onPin?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = memo(
  ({ socketId, stream, userName, onPin }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);


    return (
      <div className="relative">
        <video
          autoPlay
          playsInline
          ref={videoRef}
          data-socketid={socketId}
          className="h-[200px] rounded-md bg-[#020215] object-cover"
        />

        <div className="absolute bottom-2 left-3 bg-[#020215] text-white text-xs px-2 py-1 rounded flex items-center gap-2">
          {userName || "Guest"}

          {onPin && (
            <TiPinOutline
              className="text-amber-400 cursor-pointer text-base hover:scale-110 transition"
              onClick={onPin}
              title="Pin video"
            />
          )}
        </div>

      </div>
    );
  }
);

// Prevent re-render unless props change
export default VideoCard;
