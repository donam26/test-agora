'use client';
import { useRef } from 'react';
import { AgoraProvider, useAgoraContext } from '../contexts/AgoraContext';
import { useAgora } from '../hooks/useAgora';
import VideoControls from './VideoControls';
import VideoPlayer from './VideoPlayer';
import { ErrorMessage, LoadingMessage } from './Messages';

function VideoCall() {
  const localVideoRef = useRef(null);
  const {
    error,
    isLoading,
    isVideoEnabled,
    isAudioEnabled,
    setIsVideoEnabled,
    setIsAudioEnabled,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    joinState
  } = useAgoraContext();

  useAgora(localVideoRef);

  const toggleVideo = async () => {
    if (localVideoTrack) {
      try {
        await localVideoTrack.setEnabled(!isVideoEnabled);
        
        if (isVideoEnabled && localVideoRef.current) {
          localVideoRef.current.innerHTML = '';
        } 
        else if (!isVideoEnabled && localVideoRef.current) {
          await localVideoTrack.play(localVideoRef.current, {
            fit: 'contain',
            mirror: true
          });
        }

        setIsVideoEnabled(!isVideoEnabled);
      } catch (err) {
        console.error('Lỗi khi toggle video:', err);
        setError('Không thể bật/tắt camera');
      }
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      try {
        await localAudioTrack.setEnabled(!isAudioEnabled);
        setIsAudioEnabled(!isAudioEnabled);
      } catch (err) {
        console.error('Lỗi khi toggle audio:', err);
        setError('Không thể bật/tắt microphone');
      }
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Agora Video Call</h1>
      
      <ErrorMessage message={error} />
      <LoadingMessage isLoading={isLoading} />

      <VideoControls
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
      />

      <div className="grid grid-cols-2 gap-4">
        <VideoPlayer
          videoRef={localVideoRef}
          isLocal={true}
          joinState={joinState}
        />

        {remoteUsers.map(user => (
          <VideoPlayer
            key={user.uid}
            uid={user.uid}
            isLocal={false}
            user={user}
          />
        ))}
      </div>
    </main>
  );
}

export default function VideoCallComponent() {
  return (
    <AgoraProvider>
      <VideoCall />
    </AgoraProvider>
  );
} 