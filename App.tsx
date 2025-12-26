
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WindowType, WindowState, LogEntry, SystemMetrics } from './types';
import { Terminal } from './components/Terminal';
import { Dashboard } from './components/Dashboard';
import { FileExplorer } from './components/FileExplorer';
import { Assistant } from './components/Assistant';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ text: string, sources: any[] } | null>(null);

  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'term-1', type: WindowType.TERMINAL, title: 'Kernel Terminal', isOpen: true, isMinimized: false, zIndex: 10 },
    { id: 'dash-1', type: WindowType.DASHBOARD, title: 'System Analytics', isOpen: true, isMinimized: false, zIndex: 5 },
    { id: 'explorer-1', type: WindowType.EXPLORER, title: 'File Explorer', isOpen: false, isMinimized: false, zIndex: 1 },
    { id: 'assistant-1', type: WindowType.AI_CHAT, title: 'Neural Assistant', isOpen: false, isMinimized: false, zIndex: 1 },
  ]);
  
  const [activeWindow, setActiveWindow] = useState<string>('term-1');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 12, memory: 45, disk: 30, network: 2 });
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([]);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    }, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setBooting(false), 800);
          addLog("System boot sequence complete.", "system");
          addLog("All subsystems initialized.", "system");
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [addLog]);

  useEffect(() => {
    if (booting) return;
    const interval = setInterval(() => {
      setMetrics(prev => {
        const next = {
          cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
          memory: Math.max(40, Math.min(85, prev.memory + (Math.random() * 4 - 2))),
          disk: prev.disk,
          network: Math.max(0, Math.min(100, prev.network + (Math.random() * 20 - 10))),
        };
        setMetricsHistory(h => [...h, next].slice(-30));
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [booting]);

  const openWindow = (type: WindowType) => {
    setWindows(prev => prev.map(w => {
      if (w.type === type) {
        return { ...w, isOpen: true, isMinimized: false, zIndex: Math.max(...prev.map(x => x.zIndex)) + 1 };
      }
      return w;
    }));
    const found = windows.find(w => w.type === type);
    if (found) setActiveWindow(found.id);
  };

  const toggleWindow = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        const isFocusing = w.isMinimized || activeWindow !== id;
        return { 
          ...w, 
          isMinimized: isFocusing ? false : true,
          zIndex: isFocusing ? Math.max(...prev.map(x => x.zIndex)) + 1 : w.zIndex
        };
      }
      return w;
    }));
    setActiveWindow(id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    addLog(`Initiating Grid Search: ${searchQuery}`, 'info');
    const result = await geminiService.searchTheGrid(searchQuery);
    setSearchResult(result);
    setIsSearching(false);
  };

  if (booting) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] text-emerald-500 font-mono p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-between text-xs mb-2 text-emerald-400">
            <span className="animate-pulse">[ INITIALIZING GEMINI OS ]</span>
            <span>{Math.round(bootProgress)}%</span>
          </div>
          <div className="w-full h-1 bg-slate-900 overflow-hidden rounded-full border border-emerald-900/30">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-300"
              style={{ width: `${bootProgress}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-600 uppercase tracking-[0.2em] text-center mt-6">
            Establishing Quantum Link • Securing File Systems • Loading AI Kernels
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-emerald-500/30">
      <div className="scanline"></div>
      
      {/* Top Bar */}
      <header className="h-10 bg-slate-900/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-5 h-5 bg-emerald-600 rounded-sm flex items-center justify-center group-hover:bg-emerald-500 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <span className="text-[10px] font-bold">G</span>
            </div>
            <span className="text-sm font-bold tracking-tight">Gemini OS <span className="text-emerald-500 font-mono text-xs opacity-80">2.5</span></span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          <nav className="flex gap-4 text-xs font-medium text-slate-400">
            <button onClick={() => openWindow(WindowType.EXPLORER)} className="hover:text-white transition-colors">Files</button>
            <button onClick={() => openWindow(WindowType.DASHBOARD)} className="hover:text-white transition-colors">Monitor</button>
            <button onClick={() => openWindow(WindowType.TERMINAL)} className="hover:text-white transition-colors">Terminal</button>
            <button onClick={() => openWindow(WindowType.AI_CHAT)} className="hover:text-white transition-colors text-emerald-400">Assistant</button>
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-8 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the Grid..." 
            className="w-full bg-slate-950/80 border border-white/10 rounded-full px-4 py-1 text-xs outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
            </div>
          )}
        </form>

        <div className="flex items-center gap-6 text-[10px] text-slate-400 font-mono">
          <div className="hidden sm:flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${metrics.cpu > 80 ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></span>
            CPU: {metrics.cpu.toFixed(0)}%
          </div>
          <div className="hidden sm:block">MEM: {metrics.memory.toFixed(0)}%</div>
          <div className="text-slate-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </header>

      {/* Main Desktop Area */}
      <main className="flex-1 relative p-4 lg:p-6 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
        
        {/* Search Result Overlay */}
        {searchResult && (
          <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="glass w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">
              <button onClick={() => setSearchResult(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-400">Grid Search Results</h2>
              <div className="text-slate-300 text-sm leading-relaxed mb-6 max-h-96 overflow-y-auto pr-2">
                {searchResult.text}
              </div>
              {searchResult.sources.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Grounding Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-white/5 transition-colors text-blue-300">
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Windows Rendering */}
        <div className="w-full h-full relative">
          {windows.filter(w => w.isOpen && !w.isMinimized).map((win) => (
            <div 
              key={win.id}
              onClick={() => setActiveWindow(win.id)}
              className={`absolute rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-all duration-300 ${activeWindow === win.id ? 'z-40 scale-[1.002] ring-1 ring-white/10' : 'z-10 scale-[0.98] opacity-60'}`}
              style={{
                width: win.type === WindowType.TERMINAL ? '60%' : win.type === WindowType.DASHBOARD ? '35%' : win.type === WindowType.EXPLORER ? '50%' : '30%',
                height: win.type === WindowType.TERMINAL ? '70%' : win.type === WindowType.DASHBOARD ? '50%' : win.type === WindowType.EXPLORER ? '60%' : '80%',
                top: win.type === WindowType.TERMINAL ? '5%' : win.type === WindowType.DASHBOARD ? '45%' : win.type === WindowType.EXPLORER ? '20%' : '10%',
                left: win.type === WindowType.TERMINAL ? '5%' : win.type === WindowType.DASHBOARD ? '60%' : win.type === WindowType.EXPLORER ? '25%' : '65%',
              }}
            >
              <div className="h-9 bg-slate-800/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${win.type === WindowType.TERMINAL ? 'bg-emerald-500' : win.type === WindowType.AI_CHAT ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                  <span className="text-[11px] font-mono text-slate-300 tracking-tight">{win.title}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleWindow(win.id); }} className="w-3 h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors"></button>
                  <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-3 h-3 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors"></button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden glass">
                {win.type === WindowType.TERMINAL && <Terminal onAddLog={addLog} />}
                {win.type === WindowType.DASHBOARD && <Dashboard metrics={metrics} history={metricsHistory} />}
                {win.type === WindowType.EXPLORER && <FileExplorer />}
                {win.type === WindowType.AI_CHAT && <Assistant />}
              </div>
            </div>
          ))}
        </div>

        {/* Mini Logs overlay (bottom left) */}
        <div className="absolute bottom-6 left-6 w-64 glass rounded-xl border border-white/5 p-3 hidden xl:block shadow-lg">
          <div className="flex items-center justify-between mb-2">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live Kernel Logs</span>
             <span className="text-[8px] text-slate-600">v2.5-Stable</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-hidden font-mono text-[9px]">
             {logs.slice(0, 5).map((l, i) => (
               <div key={i} className="flex gap-2 truncate">
                  <span className="text-slate-600 shrink-0">{l.timestamp}</span>
                  <span className={l.level === 'error' ? 'text-red-400' : 'text-slate-400'}>{l.message}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* Futuristic Taskbar */}
      <footer className="h-14 bg-slate-900/40 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center gap-2 px-6 z-50">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => win.isOpen ? toggleWindow(win.id) : setWindows(prev => prev.map(w => w.id === win.id ? {...w, isOpen: true} : w))}
              className={`h-10 px-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative group ${win.id === activeWindow && win.isOpen && !win.isMinimized ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className={`w-1 h-1 rounded-full absolute top-1 ${win.isOpen ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-transparent'}`}></div>
              <span className="text-[10px] font-semibold mt-1">{win.title.split(' ')[0]}</span>
              {win.id === activeWindow && !win.isMinimized && <div className="absolute -bottom-1 w-6 h-[2px] bg-emerald-500 rounded-full"></div>}
            </button>
          ))}
        </div>
        
        <div className="absolute right-6 flex items-center gap-3">
           <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg" title="Power Options">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
           </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
