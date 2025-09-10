"use client"
import {  useChatContext } from '@/contexts/ChatContext';
import { ChatRoom } from '@/components/ChatRoom';
import { LandingPage } from '@/components/LandingPage';


export default function Home() {
    const { currentView } = useChatContext();


  return (
   
          <div className="min-h-screen">
            {currentView === 'landing' ? <LandingPage /> : <ChatRoom />}
          </div>
   
  );
}
