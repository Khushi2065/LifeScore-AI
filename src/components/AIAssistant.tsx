import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function AIAssistant({ context }: { context: any }) {
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'Hi! I am your LifeScore Assistant powered by Watsonx. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    try {
      const token = localStorage.getItem('lifescore_token');
      const res = await fetch('/api/watson/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
      }
    } catch (err) {
      console.error("Failed to create Watson session:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      // If no session, try to create one first. This is a bit complex in a functional component state.
      // Usually the initial useEffect handles it, but if it fails, we retry here.
      try {
        const token = localStorage.getItem('lifescore_token');
        const res = await fetch('/api/watson/session', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.session_id) {
          currentSessionId = data.session_id;
          setSessionId(currentSessionId);
        }
      } catch (err) {
        console.error("Manual session creation failed:", err);
      }
    }

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('lifescore_token');
      const res = await fetch('/api/watson/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: currentInput,
          sessionId: currentSessionId,
          context: context
        })
      });
      
      const data = await res.json();
      
      if (data.output && data.output.generic && data.output.generic.length > 0) {
        data.output.generic.forEach((g: any) => {
          if (g.response_type === 'text') {
            setMessages(prev => [...prev, { role: 'ai', text: g.text }]);
          }
        });
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Watson returned an empty response. Please check your Assistant configuration." }]);
      }
    } catch (err) {
      console.error("Watson Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to Watsonx Assistant. Please ensure your credentials are correct." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-indigo-50/50 dark:bg-indigo-900/10">
        <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex items-center justify-center text-brand shadow-sm">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="font-black text-xl tracking-tight">Life Advisor</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-widest">AI Intelligence / Watsonx Assistant</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                m.role === 'ai' ? 'bg-brand/10 text-brand' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {m.role === 'ai' ? <Bot size={16} /> : <UserIcon size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-brand text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none text-slate-700 dark:text-slate-200'
              }`}>
                {m.text}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-brand transition-all"
            placeholder="Ask anything about your life goals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 p-2 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
