import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Msg {
  id: string;
  sender: string;
  message: string;
  created_at: string;
}

const getSessionId = () => {
  let id = localStorage.getItem('chat_session_id');
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('chat_session_id', id);
  }
  return id;
};

const LiveChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const sessionId = useRef(getSessionId());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId.current)
      .order('created_at')
      .then(({ data }) => setMessages(data || []));

    const channel = supabase
      .channel(`chat-${sessionId.current}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId.current}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === (payload.new as any).id)) return prev;
            return [...prev, payload.new as Msg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      sender: 'customer',
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId.current,
        sender: 'customer',
        message: text,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === optimisticMessage.id ? data as Msg : m)));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-sm h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
    >
      <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">How can we help?</p>
          <p className="text-xs opacity-80 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full" /> We reply immediately
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="hover:opacity-70"><Minus className="w-4 h-4" /></button>
          <button onClick={onClose} className="hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            <p className="font-medium mb-1">Welcome to Original Watches!</p>
            <p className="text-xs">Send us a message and our concierge will reply instantly.</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                m.sender === 'customer'
                  ? 'bg-[#2563eb] text-white rounded-br-sm'
                  : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
              }`}
            >
              {m.message}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t bg-white">
        <div className="flex items-center gap-2 border border-gray-200 rounded-full pl-4 pr-1 py-1 focus-within:border-[#2563eb] transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-sm py-1.5 focus:outline-none"
          />
          <button type="submit" className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center hover:bg-[#1d4ed8] transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default LiveChat;
