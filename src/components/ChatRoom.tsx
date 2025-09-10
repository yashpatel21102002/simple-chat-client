"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, LogOut, MessageCircle, Copy } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import {toast} from 'sonner'

interface MessageBubbleProps {
  message: string;
  sender: string;
  timestamp: number;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  sender, 
  timestamp, 
  isOwnMessage 
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className={`flex gap-3 mb-4 ${
        isOwnMessage 
          ? 'justify-end message-slide-in-right' 
          : 'justify-start message-slide-in-left'
      }`}
    >
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chat-primary to-chat-primary-light flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
          {getInitials(sender)}
        </div>
      )}
      
      <div className={`max-w-[75%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
        {!isOwnMessage && (
          <div className="text-xs text-text-muted mb-1 font-medium">
            {sender}
          </div>
        )}
        
        <div 
          className={`px-4 py-2 rounded-2xl break-words ${
            isOwnMessage
              ? 'bg-gradient-to-r from-chat-primary to-chat-primary-light text-primary-foreground rounded-br-sm'
              : 'glass-light rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message}</p>
          <div className={`text-xs mt-1 ${
            isOwnMessage 
              ? 'text-primary-foreground/70' 
              : 'text-text-muted'
          }`}>
            {formatTime(timestamp)}
          </div>
        </div>
      </div>

      {isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chat-primary to-chat-primary-light flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
          {getInitials(sender)}
        </div>
      )}
    </div>
  );
};

export const ChatRoom: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const { username, roomId, leaveRoom, sendChatMessage, messages } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    sendChatMessage(messageInput.trim());
    setMessageInput('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    toast("Room code copied!",{
     
      description: `${roomId} has been copied to your clipboard`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col fade-in">
      {/* Header */}
      <Card className="glass border-0 border-b border-glass-border rounded-none">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-text-primary">Room {roomId}</h1>
              <p className="text-sm text-text-muted">Connected as {username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={copyRoomCode}
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-chat-primary hover:bg-glass-light"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={leaveRoom}
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-destructive hover:bg-glass-light"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-glass-light flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Welcome to Room {roomId}
              </h3>
              <p className="text-text-muted max-w-sm">
                Start the conversation! Send your first message to get things rolling.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, index) => (
                <MessageBubble
                  key={`${msg.timestamp}-${index}`}
                  message={msg.message}
                  sender={msg.name}
                  timestamp={msg.timestamp || Date.now()}
                  isOwnMessage={msg.name === username}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <Card className="glass border-0 border-t border-glass-border rounded-none">
          <div className="p-4">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-12 glass-light border-glass-border focus:border-chat-primary focus:ring-chat-primary"
                maxLength={500}
              />
              
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="h-12 w-12 gradient-primary hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};