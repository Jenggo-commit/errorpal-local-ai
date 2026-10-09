'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: string;
  time?: number;
}

const LANGUAGES = ['JavaScript', 'Python', 'React', 'TypeScript', 'Node.js', 'C++'];
const MODES = [
  { id: 'debug', label: '#Debug&Fix' },
  { id: 'refactor', label: '#CleanRefactor' },
  { id: 'explain', label: '#LineExplainer' },
  { id: 'test', label: '#TestGenerator' },
  { id: 'quiz', label: '#DailyChallenge' },
];

const INTERMISSION_QUOTES = [
  "#SystemStatus: Processing code locally on CPU silicon...",
  "#SystemStatus: Analyzing stack trace for syntax issues...",
  "#SystemStatus: Consulting local debugging heuristics...",
  "#SystemStatus: Keeping your codebase 100% offline and private..."
];

export default function Home() {
  const [activeMode, setActiveMode] = useState('debug');
  const [inputData, setInputData] = useState('');
  const [selectedLang, setSelectedLang] = useState('JavaScript');
  const [isSocratic, setIsSocratic] = useState(false);
  const [isRoast, setIsRoast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [streak, setStreak] = useState(1);
  const [bugsSquashed, setBugsSquashed] = useState(42);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('errorpal_gemini_chat');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setQuoteIndex(prev => (prev + 1) % INTERMISSION_QUOTES.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode !== 'quiz' && !inputData.trim()) return;

    const userText = inputData.trim() || `Generate a daily coding challenge for ${selectedLang}.`;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      mode: activeMode,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputData('');
    setLoading(true);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputData: userText, 
          language: selectedLang, 
          mode: activeMode,
          isSocratic,
          isRoast
        }),
      });

      const data = await res.json();
      const endTime = performance.now();
      const durationSeconds = Number(((endTime - startTime) / 1000).toFixed(2));

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.error || data.result || 'No response generated.',
        mode: activeMode,
        time: durationSeconds,
      };

      setMessages(prev => {
        const updated = [...prev, aiMsg];
        localStorage.setItem('errorpal_gemini_chat', JSON.stringify(updated));
        return updated;
      });

      setBugsSquashed(prev => prev + 1);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error connecting to local Ollama inference backend.',
        mode: activeMode,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased flex items-center justify-center p-1 md:p-3 relative">
      <div className="w-full max-w-[98vw] h-auto md:h-[96vh] bg-black/90 backdrop-blur-2xl border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Title Bar */}
        <div className="h-11 bg-neutral-950 border-b border-neutral-800/80 px-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
            <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
            <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
          </div>
          <div className="text-xs font-mono text-neutral-400 tracking-wider">
            <span>#ErrorPal-Pro.app // Wide Gemini Layout</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[10px] font-mono bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-neutral-300">
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
              <span>#Qwen2.5-Coder:0.5B</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          </div>
        </div>

        {/* Workspace Container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Sidebar Controls */}
          <aside className={`w-full md:w-80 bg-neutral-950 border-r border-neutral-900 p-4 flex flex-col justify-between shrink-0 overflow-y-auto absolute md:relative z-20 inset-0 transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="space-y-6">
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">#Streak</span>
                  <span className="text-white font-medium flex items-center gap-1">⚡ {streak} Days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">#Resolved</span>
                  <span className="text-neutral-200 font-medium">{bugsSquashed} Bugs</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 mb-1.5">#WorkspaceModes</p>
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setActiveMode(m.id); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition duration-150 ${activeMode === m.id ? 'bg-neutral-200 text-neutral-900 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 mb-1.5">#TargetEnvironment</p>
                <div className="flex flex-wrap gap-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded transition border ${selectedLang === lang ? 'bg-neutral-200 border-neutral-200 text-neutral-900 font-semibold' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 font-mono pt-2">
                <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800 p-2.5 rounded-xl">
                  <span className="text-[11px] text-neutral-300">#SocraticTutor</span>
                  <button type="button" onClick={() => setIsSocratic(!isSocratic)} className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${isSocratic ? 'bg-neutral-200' : 'bg-neutral-800'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full transition-transform ${isSocratic ? 'translate-x-4 bg-neutral-900' : 'translate-x-0 bg-neutral-400'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800 p-2.5 rounded-xl">
                  <span className="text-[11px] text-neutral-300">#RoastMode</span>
                  <button type="button" onClick={() => setIsRoast(!isRoast)} className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${isRoast ? 'bg-neutral-200' : 'bg-neutral-800'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full transition-transform ${isRoast ? 'translate-x-4 bg-neutral-900' : 'translate-x-0 bg-neutral-400'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-900/80">
              <button onClick={() => { setMessages([]); localStorage.removeItem('errorpal_gemini_chat'); }} className="w-full text-center text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-neutral-400 py-2 rounded-lg border border-neutral-800">
                #ClearChatHistory
              </button>
            </div>
          </aside>

          {/* Main Chat Feed Area */}
          <main className="flex-1 flex flex-col bg-neutral-950/40 overflow-hidden">
            
            {/* Scrollable Message History with Centered Empty State */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-center">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3 font-mono my-auto">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl">⚡</div>
                  <h3 className="text-sm font-medium text-neutral-200">#ErrorPalPro Wide Workspace</h3>
                  <p className="text-xs text-neutral-500 max-w-md">Select your workspace mode on the left, choose your target language, and send your code prompt or generate challenges below.</p>
                </div>
              ) : (
                <div className="space-y-6 my-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-mono text-neutral-500">
                          {msg.role === 'user' ? '#User' : `#ErrorPal Pro [${msg.mode}]`}
                        </span>
                        {msg.time && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-1.5 py-0.2 rounded">
                            {msg.time}s
                          </span>
                        )}
                      </div>
                      <div className={`max-w-4xl rounded-2xl p-5 text-xs font-mono leading-relaxed border ${msg.role === 'user' ? 'bg-neutral-900 text-neutral-200 border-neutral-800' : 'bg-black/60 text-neutral-100 border-neutral-800/80 whitespace-pre-wrap'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex flex-col items-start space-y-2 font-mono">
                      <span className="text-[10px] text-neutral-500">#ErrorPal Pro [Processing]</span>
                      <div className="bg-black/60 border border-neutral-800 p-4 rounded-2xl text-xs text-emerald-400 flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin"></div>
                        <span>{INTERMISSION_QUOTES[quoteIndex]}</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Bottom Wide Chat Input Bar */}
            <div className="p-4 md:px-8 bg-neutral-950 border-t border-neutral-900 shrink-0">
              <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-2">
                <div className="bg-black/80 border border-neutral-800 rounded-2xl overflow-hidden focus-within:border-neutral-500 transition shadow-xl">
                  <div className="bg-neutral-900/60 px-4 py-1.5 border-b border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">●</span>
                      <span>Mode: <strong className="text-white">#{activeMode}</strong> | Lang: <strong className="text-white">{selectedLang}</strong></span>
                    </div>
                    <span>{activeMode === 'quiz' ? 'Challenge mode active' : 'Code input buffer'}</span>
                  </div>
                  <textarea
                    rows={4}
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder={activeMode === 'quiz' ? "Click generate challenge or type a custom topic..." : "Paste code snippet, stack trace, or ask a question..."}
                    className="w-full bg-transparent p-4 text-xs text-neutral-200 focus:outline-none font-mono resize-none leading-relaxed"
                    required={activeMode !== 'quiz'}
                  />
                  <div className="px-4 pb-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-neutral-500">Local CPU inference ready</span>
                    <button
                      type="submit"
                      disabled={loading || (activeMode !== 'quiz' && !inputData.trim())}
                      className="bg-neutral-200 hover:bg-white text-neutral-900 font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-40 text-xs font-mono tracking-wide cursor-pointer shadow"
                    >
                      {loading ? '#Running...' : activeMode === 'quiz' ? '#GenerateChallenge' : '#SendPrompt'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}