import React, { memo, useEffect, useRef } from "react";

interface VideoCardProps {
  id: string;
  socketId: string;
  stream: MediaStream | null | undefined;
  userName?: string;
}

const VideoCard: React.FC<VideoCardProps> = memo(
  ({ socketId, stream, userName }) => {
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
          className="h-[200px] rounded-md bg-black object-cover"
        />

        <div className="absolute bottom-2 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {userName || "Guest"}
        </div>
      </div>
    );
  }
);

// Prevent re-render unless props change
export default VideoCard;
