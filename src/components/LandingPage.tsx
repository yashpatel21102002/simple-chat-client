"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Plus } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

export const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { createRoom, joinRoom, isConnected } = useChatContext();

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    createRoom(name.trim());
  };

  const handleJoinRoom = () => {
    if (!name.trim() || !roomCode.trim()) return;
    joinRoom(name.trim(), roomCode.trim().toUpperCase());
  };

  const resetForm = () => {
    setMode('idle');
    setName('');
    setRoomCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-md">
        <Card className="glass scale-in shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-gradient">
              ChatRoom
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Connect instantly with friends through secure chat rooms
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {mode === 'idle' && (
              <div className="space-y-4">
                <Button
                  onClick={() => setMode('create')}
                  className="w-full h-14 text-lg font-semibold gradient-primary hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Room
                </Button>
                
                <Button
                  onClick={() => setMode('join')}
                  variant="secondary"
                  className="w-full h-14 text-lg font-semibold glass-light hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Room
                </Button>
              </div>
            )}

            {mode !== 'idle' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Your Name
                  </label>
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 glass-light border-glass-border focus:border-chat-primary focus:ring-chat-primary"
                    maxLength={20}
                  />
                </div>

                {mode === 'join' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">
                      Room Code
                    </label>
                    <Input
                      placeholder="Enter 6-digit room code"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="h-12 glass-light border-glass-border focus:border-chat-primary focus:ring-chat-primary font-mono text-center text-lg"
                      maxLength={6}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 h-12 glass-light border-glass-border hover:bg-glass-light/80"
                  >
                    Back
                  </Button>
                  
                  <Button
                    onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                    disabled={!name.trim() || (mode === 'join' && !roomCode.trim()) || !isConnected}
                    className="flex-1 h-12 gradient-primary hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {mode === 'create' ? 'Create' : 'Join'}
                  </Button>
                </div>
              </div>
            )}

            {!isConnected && (
              <div className="text-center text-text-muted text-sm">
                Connecting to server...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};