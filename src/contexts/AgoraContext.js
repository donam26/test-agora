'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AgoraContext = createContext();

export function AgoraProvider({ children }) {
  const [AgoraRTC, setAgoraRTC] = useState(null);
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joinState, setJoinState] = useState(false);
  const [error, setError] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load AgoraRTC
  useEffect(() => {
    const loadAgoraRTC = async () => {
      try {
        if (typeof window !== 'undefined') {
          const AgoraRTCModule = await import('agora-rtc-sdk-ng');
          setAgoraRTC(AgoraRTCModule.default);
        }
      } catch (error) {
        console.error('Lỗi khi load AgoraRTC:', error);
        setError('Không thể tải Agora SDK');
      }
    };

    loadAgoraRTC();
  }, []);

  // Khởi tạo client khi AgoraRTC đã load
  useEffect(() => {
    if (!AgoraRTC) return;

    try {
      const agoraClient = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8'
      });
      setClient(agoraClient);
    } catch (error) {
      console.error('Lỗi khi tạo client:', error);
      setError('Không thể khởi tạo kết nối video');
    }
  }, [AgoraRTC]);

  const value = {
    AgoraRTC,
    client,
    localVideoTrack,
    setLocalVideoTrack,
    localAudioTrack,
    setLocalAudioTrack,
    remoteUsers,
    setRemoteUsers,
    joinState,
    setJoinState,
    error,
    setError,
    isVideoEnabled,
    setIsVideoEnabled,
    isAudioEnabled,
    setIsAudioEnabled,
    isLoading,
    setIsLoading
  };

  return (
    <AgoraContext.Provider value={value}>
      {children}
    </AgoraContext.Provider>
  );
}

export const useAgoraContext = () => useContext(AgoraContext); 