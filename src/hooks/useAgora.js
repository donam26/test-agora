import { useEffect } from 'react';
import { useAgoraContext } from '../contexts/AgoraContext';

export function useAgora(localVideoRef) {
  const {
    AgoraRTC,
    client,
    setLocalVideoTrack,
    setLocalAudioTrack,
    setRemoteUsers,
    setJoinState,
    setError,
    setIsLoading,
    localAudioTrack,
    localVideoTrack,
  } = useAgoraContext();

  const channelName = 'test';
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const token = process.env.NEXT_PUBLIC_AGORA_TEMP_TOKEN;

  // Thêm kiểm tra appId và token
  useEffect(() => {
    if (!appId || !token) {
      console.error('Thiếu thông tin cấu hình Agora:', { appId, token });
      setError('Thiếu thông tin cấu hình Agora. Vui lòng kiểm tra file .env.local');
      return;
    }
  }, [appId, token]);

  // 1. Kiểm tra và xin quyền truy cập media
  const checkMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Lỗi quyền truy cập media:', error);
      if (error.name === 'NotAllowedError') {
        setError('Vui lòng cho phép truy cập camera và microphone');
      } else if (error.name === 'NotFoundError') {
        setError('Không tìm thấy camera hoặc microphone');
      } else {
        setError(`Lỗi: ${error.message}`);
      }
      return false;
    }
  };

  // 2. Kiểm tra thiết bị
  const checkDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');

      if (cameras.length === 0) throw new Error('Không tìm thấy camera');
      if (microphones.length === 0) throw new Error('Không tìm thấy microphone');

      return true;
    } catch (error) {
      console.error('Lỗi kiểm tra thiết bị:', error);
      setError(error.message);
      return false;
    }
  };

  // 3. Khởi tạo và play video local
  const initializeLocalVideo = async () => {
    if (!AgoraRTC) {
      throw new Error('AgoraRTC chưa được khởi tạo');
    }

    try {
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {
          encoderConfig: 'high_quality'
        },
        {
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000
          }
        }
      );
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // Play local video
      if (localVideoRef.current) {
        try {
          localVideoRef.current.innerHTML = '';
          await videoTrack.play(localVideoRef.current, {
            fit: 'contain',
            mirror: true
          });

          const videoElement = localVideoRef.current.querySelector('video');
          if (!videoElement) {
            throw new Error('Không tìm thấy video element sau khi play');
          }
        } catch (error) {
          console.error('Lỗi khi play local video:', error);
          throw error;
        }
      } else {
        throw new Error('Không tìm thấy container cho local video');
      }
      return [audioTrack, videoTrack];
    } catch (error) {
      console.error('Lỗi khởi tạo local video:', error);
      throw error;
    }
  };

  // 4. Tham gia kênh và publish tracks
  const joinChannelAndPublish = async (tracks) => {
    if (!client) return;
    if (!appId || !token) {
      throw new Error('Thiếu thông tin cấu hình Agora');
    }

    try {
      console.log('Joining channel with:', { appId, channelName, token });
      const uid = await client.join(appId, channelName, token, null);
      console.log('Joined channel successfully with UID:', uid);
      await client.publish(tracks);
      setJoinState(true);
    } catch (error) {
      console.error('Lỗi khi tham gia kênh:', error);
      throw error;
    }
  };

  // Xử lý khởi tạo
  useEffect(() => {
    if (!client) return;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError('');

        const hasPermissions = await checkMediaPermissions();
        if (!hasPermissions) return;

        const hasDevices = await checkDevices();
        if (!hasDevices) return;

        const tracks = await initializeLocalVideo();
        await joinChannelAndPublish(tracks);

        setIsLoading(false);
      } catch (error) {
        console.error('Lỗi khởi tạo:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      client.removeAllListeners();
      client.leave();
    };
  }, [client]);

  // Xử lý remote users
  useEffect(() => {
    if (!client) return;

    const handleUserPublished = async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        console.log('Đã subscribe user:', user.uid, mediaType, user);

        if (mediaType === 'video') {
          // Chỉ cần cập nhật state, VideoPlayer component sẽ tự xử lý việc play video
          setRemoteUsers(prev => {
            const existingUser = prev.find(u => u.uid === user.uid);
            if (existingUser) {
              return prev.map(u => u.uid === user.uid ? user : u);
            }
            return [...prev, user];
          });
        }
        
        if (mediaType === 'audio') {
          console.log('Playing remote audio for user:', user.uid);
          await user.audioTrack?.play();
        }
      } catch (error) {
        console.error('Lỗi khi xử lý remote user:', error);
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType);
      // Không cần stop video track ở đây vì VideoPlayer sẽ tự cleanup
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
      // Chỉ xóa user khỏi state khi cả audio và video đều unpublished
      if (mediaType === 'video') {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      }
    };

    const handleUserLeft = (user) => {
      console.log('User left:', user.uid);
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);
} 