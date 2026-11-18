"use client"
import React, { useState } from 'react'
import ChatWelcomeTabs from './chat-welcome-tabs';
import ChatMessageForm from './chat-message-form';

interface ChatMessageViewProps {
  user: any;
}

const ChatMessageView = ({ user }: ChatMessageViewProps) => {
  const [selectedMessage, setSelectedMessage] = useState("");

  const handleMessageSelect = (message: string) => {
    setSelectedMessage(message);
  };

  const handleMessageChange = () => {
    setSelectedMessage("");
  };


  return (
    <div className="flex flex-col justify-between h-full max-w-4xl mx-auto w-full px-2 py-4 sm:py-6 overflow-y-auto">
      <div className="my-auto py-4">
        <ChatWelcomeTabs
          userName={user?.name}
          onMessageSelect={handleMessageSelect}
        />
      </div>

      <div className="w-full shrink-0 pt-2">
        <ChatMessageForm
          initialMessage={selectedMessage}
          onMessageChange={handleMessageChange}
        />
      </div>
    </div>
  );
}

export default ChatMessageView