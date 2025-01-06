import React from 'react';

export default function VideoControls({ 
  isVideoEnabled, 
  isAudioEnabled, 
  onToggleVideo, 
  onToggleAudio 
}) {
  return (
    <div className="mb-4 flex gap-2">
      <button
        onClick={onToggleVideo}
        className={`px-4 py-2 rounded ${
          isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {isVideoEnabled ? 'Tắt Camera' : 'Bật Camera'}
      </button>
      <button
        onClick={onToggleAudio}
        className={`px-4 py-2 rounded ${
          isAudioEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {isAudioEnabled ? 'Tắt Mic' : 'Bật Mic'}
      </button>
    </div>
  );
} 