import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import LiveChat from './LiveChat';

const FloatingButtons: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <a
        href="https://t.me/originalwatchesshop"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 group"
      >
        <div className="w-12 h-12 rounded-full bg-[#27a7e7] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Send className="w-5 h-5 -rotate-12" />
        </div>
        <span className="bg-white text-sm font-medium px-4 py-2 rounded-full shadow-md border border-gray-100">
          Contact us
        </span>
      </a>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group"
      >
        <span className="bg-[#2563eb] text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg hover:bg-[#1d4ed8] transition-colors flex items-center gap-2">
          Chat
          <MessageCircle className="w-4 h-4" />
          <span className="w-2 h-2 bg-green-400 rounded-full absolute -bottom-1 right-3" />
        </span>
      </button>

      <AnimatePresence>
        {chatOpen && <LiveChat onClose={() => setChatOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default FloatingButtons;
