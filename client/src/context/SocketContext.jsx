/**
 * SocketContext.jsx
 *
 * Connects to the real backend Socket.io server.
 * On mount, joins the correct room based on the logged-in user's role.
 * Falls back gracefully when the server is unreachable.
 */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Connect to the backend
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
      // Join the correct room
      socket.emit('join', { role: user.role, userId: user._id || user.id });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  // Expose the socket instance and connection status
  const value = {
    socket: socketRef.current,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
