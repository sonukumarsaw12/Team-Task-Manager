"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { default: api } = await import('../lib/api');
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join_room', `user_${user._id}`);
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast(notification.message);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNotifications([]);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const { default: api } = await import('../lib/api');
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { default: api } = await import('../lib/api');
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
