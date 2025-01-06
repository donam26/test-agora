import React, { useEffect, useRef } from 'react';

export default function VideoPlayer({ 
  videoRef, 
  isLocal = false, 
  uid, 
  joinState,
  user
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isLocal && user && user.videoTrack && containerRef.current) {
      const playVideo = async () => {
        try {
          containerRef.current.innerHTML = '';
          await user.videoTrack.play(containerRef.current);
          console.log('Played remote video for user:', uid);
        } catch (error) {
          console.error('Lỗi khi play remote video:', error);
        }
      };
      playVideo();

      return () => {
        try {
          user.videoTrack.stop();
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        } catch (error) {
          console.error('Lỗi khi cleanup video:', error);
        }
      };
    }
  }, [isLocal, user, uid]);

  return (
    <div className="video-container rounded relative">
      <div 
        ref={isLocal ? videoRef : containerRef} 
        className="w-full h-full"
      >
        {isLocal && !user?.videoTrack?.enabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <span className="text-white">Camera đã tắt</span>
          </div>
        )}
      </div>
      <p className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded z-10">
        {isLocal 
          ? `Bạn ${joinState ? '(Đã kết nối)' : '(Đang kết nối...)'}`
          : `Người dùng ${uid}`
        }
      </p>
    </div>
  );
} 