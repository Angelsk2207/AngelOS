
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { GroundingSource } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Neural link established. I am the Gemini OS Assistant. How can I assist your operations today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const result = await geminiService.assistantChat(userMsg, history);
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: result.text,
      sources: result.sources 
    }]);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/40">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 text-slate-200 border border-white/5'
            }`}>
              {m.text}
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-2">Grounding Sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] bg-slate-700 hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded border border-white/5 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        {s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-2xl text-[11px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Synchronizing with Search Grid...
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="p-4 bg-slate-900/50 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-full py-2 px-4 text-sm outline-none focus:border-emerald-500/50 transition-colors"
            placeholder="Query the OS Intelligence..."
            disabled={loading}
          />
          <button 
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-4 bg-emerald-600 rounded-full text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50"
            disabled={!input.trim() || loading}
          >
            SEND
          </button>
        </div>
      </form>
    </div>
  );
};
