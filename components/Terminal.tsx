
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

interface TerminalProps {
  onAddLog: (msg: string, level?: 'info' | 'warn' | 'error' | 'system') => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onAddLog }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ type: 'input' | 'output'; text: string; sources?: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'input', text: `root@gemini-os:~$ ${cmd}` }]);
    setInput('');
    setLoading(true);

    try {
      const result = await geminiService.executeTerminalCommand(cmd, "Current user is root. OS Version 2.5.0-Gemini. This terminal supports Google Search Grounding for real-time queries.");
      
      const sourcesText = result.sources.length > 0 
        ? `\n\n[ SOURCES: ${result.sources.map(s => new URL(s.uri).hostname).filter((v, i, a) => a.indexOf(v) === i).join(', ')} ]`
        : '';

      setHistory(prev => [...prev, { 
        type: 'output', 
        text: result.text + sourcesText
      }]);
      onAddLog(`Executed command: ${cmd}`, 'info');
    } catch (err) {
      setHistory(prev => [...prev, { type: 'output', text: "Critical system error in terminal execution." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 font-mono text-sm p-4 overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
        <div className="text-emerald-500 mb-4 border-b border-emerald-900/30 pb-2">
          Gemini-OS [Version 2.5.0-Preview-Release]<br />
          Grounding-Engine: Online | Neural-Link: Active<br />
          Type 'help' or ask a real-world question.
        </div>
        {history.map((entry, i) => (
          <div key={i} className={entry.type === 'input' ? 'text-blue-400' : 'text-slate-300 whitespace-pre-wrap'}>
            {entry.text}
          </div>
        ))}
        {loading && (
          <div className="text-emerald-500 animate-pulse flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
             Querying AI Core & Global Search Grid...
          </div>
        )}
      </div>
      <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-white/10 pt-4">
        <span className="text-emerald-500 shrink-0">root@gemini-os:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-100 flex-1 focus:ring-0"
          autoFocus
          placeholder="Command..."
          disabled={loading}
        />
      </form>
    </div>
  );
};
