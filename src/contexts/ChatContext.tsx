"use client"
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react'
import { useWebSocket,ChatMessage } from '@/hooks/useWebSocket'

interface ChatState{
  username: string,
  roomId: string,
  isInRoom: boolean,
  currentView: 'landing' | 'chat'
}

interface ChatContextType extends ChatState {
  setUsername: (username: string) => void;
  setRoomId: (roomId: string) => void;
  setCurrentView: (view: 'landing' | 'chat') => void;
  createRoom: (username: string) => void;
  joinRoom: (username: string, roomId: string) => void;
  leaveRoom: () => void;
  sendChatMessage: (message: string) => void;
  messages: ChatMessage[];
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);


export const useChatContext = ()=>{
  const context = useContext(ChatContext);
  if(!context){
    throw new Error("useChatContext must be used within a ChatProvider.")
  }

  return context;
}

interface ChatProviderProps{
  children: ReactNode
}


export const ChatProvider : React.FC<ChatProviderProps> = ({children}) => {
  const [chatState, setChatState] = useState<ChatState>({
    username: '',
    roomId: '',
    isInRoom: false,
    currentView: 'landing',
  })

  const { isConnected, connect, disconnect, sendMessage, lastMessage, messages } = useWebSocket();

   // Auto-connect when provider mounts
  useEffect(() => {
    connect();
    return () => disconnect();
},[connect, disconnect]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'room-created':
        setChatState(prev => ({
          ...prev,
          roomId: lastMessage.roomId,
          isInRoom: true,
          currentView: 'chat',
        }));
        break;

      case 'room-joined':
        setChatState(prev => ({
          ...prev,
          roomId: lastMessage.roomId,
          isInRoom: true,
          currentView: 'chat',
        }));
        break;

      case 'error':
        // Handle errors (room not found, etc.)
        break;
    }
  }, [lastMessage]);


   const setUsername = (username: string) => {
    setChatState(prev => ({ ...prev, username }));
  };

  const setRoomId = (roomId: string) => {
    setChatState(prev => ({ ...prev, roomId }));
  };

  const setCurrentView = (view: 'landing' | 'chat') => {
    setChatState(prev => ({ ...prev, currentView: view }));
  };

   const createRoom = (username: string) => {
    if (!isConnected) {
      connect();
      return;
    }
    
    setUsername(username);
    sendMessage({
      actionType: 'create-room',
      name: username,
    });
  };

  const joinRoom = (username: string, roomId: string) => {
    if (!isConnected) {
      connect();
      return;
    }

    setUsername(username);
    sendMessage({
      actionType: 'join-room',
      name: username,
      roomId: roomId,
    });
  };

  const leaveRoom = () => {
    setChatState({
      username: '',
      roomId: '',
      isInRoom: false,
      currentView: 'landing',
    });
    disconnect();
  };

  const sendChatMessage = (message: string) => {
    if (!isConnected || !chatState.isInRoom) return;

    sendMessage({
      actionType: 'chat',
      message: message,
    });
  };

  const contextValue: ChatContextType = {
    ...chatState,
    setUsername,
    setRoomId,
    setCurrentView,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    messages,
    isConnected,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );

}
