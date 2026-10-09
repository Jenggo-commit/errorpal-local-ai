'use client';

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  title: string;
  analysis: string;
  mode: string;
  date: string;
}

const LANGUAGES = ['JavaScript', 'Python', 'React', 'TypeScript', 'Node.js', 'C++'];
const MODES = [
  { id: 'debug', label: '#Debug&Fix' },
  { id: 'refactor', label: '#CleanRefactor' },
  { id: 'explain', label: '#LineExplainer' },
  { id: 'test', label: '#TestGenerator' },
  { id: 'regex', label: '#RegexParser' },
  { id: 'quiz', label: '#DailyChallenge' },
];

const BADGES = [
  { id: 'bug_squasher', name: '#BugSquasher', desc: 'Solved 1+ bugs' },
  { id: 'null_survivor', name: '#NullSurvivor', desc: 'Defeated TypeError' },
  { id: 'clean_code', name: '#CleanArchitect', desc: 'Ran Refactor mode' },
];

const INTERMISSION_QUOTES = [
  "#SystemStatus: Converting code logic into local tensor calculations...",
  "#SystemStatus: Analyzing stack trace for missing semicolons...",
  "#SystemStatus: Awakening Qwen 2.5 on local edge silicon...",
  "#SystemStatus: Consulting local debugging heuristics...",
  "#SystemStatus: Refactoring spaghetti variables...",
  "#SystemStatus: Keeping your codebase 100% offline and private..."
];

export default function Home() {
  const [activeMode, setActiveMode] = useState('debug');
  const [inputData, setInputData] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [selectedLang, setSelectedLang] = useState('JavaScript');
  const [isSocratic, setIsSocratic] = useState(false);
  const [isRoast, setIsRoast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [analysis, setAnalysis] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  // Gamification state
  const [streak, setStreak] = useState(1);
  const [bugsSquashed, setBugsSquashed] = useState(0);

  // Speed Debug Game State
  const [gameActive, setGameActive] = useState(false);
  const [gameTimer, setGameTimer] = useState(15);

  useEffect(() => {
    const saved = localStorage.getItem('errorpal_apple_history');
    const savedStreak = localStorage.getItem('errorpal_streak');
    const savedBugs = localStorage.getItem('errorpal_bugs');
    if (saved) setHistory(JSON.parse(saved));
    if (savedStreak) setStreak(Number(savedStreak));
    if (savedBugs) setBugsSquashed(Number(savedBugs));

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setQuoteIndex(prev => (prev + 1) % INTERMISSION_QUOTES.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    let interval: any;
    if (gameActive && gameTimer > 0) {
      interval = setInterval(() => setGameTimer(t => t - 1), 1000);
    } else if (gameTimer === 0) {
      setGameActive(false);
    }
    return () => clearInterval(interval);
  }, [gameActive, gameTimer]);

  const saveToHistory = (title: string, resultText: string, mode: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title: title.slice(0, 35) + (title.length > 35 ? '...' : ''),
      analysis: resultText,
      mode: mode,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newItem, ...history.slice(0, 5)];
    setHistory(updated);
    localStorage.setItem('errorpal_apple_history', JSON.stringify(updated));

    const newBugs = bugsSquashed + 1;
    setBugsSquashed(newBugs);
    localStorage.setItem('errorpal_bugs', newBugs.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode !== 'quiz' && !inputData.trim()) return;

    setLoading(true);
    setAnalysis('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputData: activeMode === 'quiz' ? 'Generate challenge' : inputData, 
          codeSnippet, 
          language: selectedLang, 
          mode: activeMode,
          isSocratic,
          isRoast
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setAnalysis(data.result);
        saveToHistory(activeMode === 'quiz' ? 'Coding Challenge' : inputData, data.result, activeMode);
      }
    } catch (err) {
      alert('Error connecting to backend API.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-neutral-200 selection:text-neutral-900 flex items-center justify-center p-2 md:p-6 relative">
      
      {/* Native Apple Application Window Container */}
      <div className="w-full max-w-7xl h-auto md:h-[92vh] bg-black/90 backdrop-blur-2xl border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* macOS Window Title Bar */}
        <div className="h-11 bg-neutral-950 border-b border-neutral-800/80 px-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-700 hover:bg-red-500 transition cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-neutral-700 hover:bg-yellow-500 transition cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-neutral-700 hover:bg-green-500 transition cursor-pointer"></div>
          </div>
          <div className="text-xs font-mono text-neutral-400 tracking-wider flex items-center gap-2">
            <span>#ErrorPal-Pro.app</span>
            <button 
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:inline-flex text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300"
            >
              Cmd+K
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[10px] font-mono bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-neutral-300"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
              <span>#Qwen2.5-3B</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          </div>
        </div>

        {/* Inner Window Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Apple Source List Sidebar */}
          <aside className={`w-full md:w-72 bg-neutral-950/90 md:bg-neutral-950/70 border-r border-neutral-900 p-4 flex flex-col justify-between shrink-0 overflow-y-auto absolute md:relative z-20 inset-0 transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center md:hidden pb-2 border-b border-neutral-900">
                <span className="text-xs font-mono text-neutral-400">#Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-xs font-mono text-white bg-neutral-900 px-2.5 py-1 rounded">✕</button>
              </div>

              {/* Streak Widget with Lightning beside Days */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">#Streak</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-amber-400 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    {streak} Days
                  </span>
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
                    onClick={() => { setActiveMode(m.id); setAnalysis(''); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition duration-150 ${
                      activeMode === m.id
                        ? 'bg-neutral-200 text-neutral-900 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2">#Badges</p>
                <div className="space-y-1">
                  {BADGES.map((badge, idx) => (
                    <div 
                      key={badge.id}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between ${
                        bugsSquashed > idx ? 'bg-neutral-900/80 border-neutral-700 text-neutral-200' : 'bg-neutral-950 border-neutral-900/50 text-neutral-600'
                      }`}
                    >
                      <span>{badge.name}</span>
                      <span>{bugsSquashed > idx ? '[Unlocked]' : '[Locked]'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-4 mt-4 border-t border-neutral-900/80 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2">#History</p>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-[11px] text-neutral-600 px-2 font-mono italic">No cached sessions.</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setAnalysis(item.analysis); setMobileMenuOpen(false); }}
                      className="bg-neutral-900/30 border border-neutral-900 hover:border-neutral-700 p-2 rounded-lg cursor-pointer transition truncate"
                    >
                      <p className="text-[10px] font-mono text-neutral-300 truncate">{item.title}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Workspace Split View */}
          <main className="flex-1 flex flex-col md:flex-row overflow-y-auto bg-neutral-950/30">
            
            {/* Left Form Pane */}
            <div className="flex-1 p-5 md:p-8 space-y-6 overflow-y-auto border-r border-neutral-900">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    #TargetEnvironment
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setSelectedLang(lang)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-lg transition border ${
                          selectedLang === lang
                            ? 'bg-neutral-200 border-neutral-200 text-neutral-900 font-semibold shadow-sm'
                            : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {activeMode === 'debug' && (
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/80 p-3.5 rounded-xl">
                      <div>
                        <span className="text-xs font-medium text-neutral-200 block">#SocraticTutorMode</span>
                        <span className="text-[10px] text-neutral-500">Guiding questions over direct solutions.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSocratic(!isSocratic)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${isSocratic ? 'bg-neutral-200' : 'bg-neutral-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${isSocratic ? 'translate-x-4 bg-neutral-900' : 'translate-x-0 bg-neutral-400'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/80 p-3.5 rounded-xl">
                      <div>
                        <span className="text-xs font-medium text-neutral-200 block">#RoastMode</span>
                        <span className="text-[10px] text-neutral-500">Sarcastic senior tech lead code critiques.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRoast(!isRoast)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${isRoast ? 'bg-neutral-200' : 'bg-neutral-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${isRoast ? 'translate-x-4 bg-neutral-900' : 'translate-x-0 bg-neutral-400'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {activeMode !== 'quiz' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      {activeMode === 'debug' && '#ErrorStackTrace *'}
                      {activeMode === 'refactor' && '#SourceCode *'}
                      {activeMode === 'explain' && '#SnippetToExplain *'}
                      {activeMode === 'test' && '#FunctionContext *'}
                      {activeMode === 'regex' && '#RegexPattern *'}
                    </label>
                    <textarea
                      rows={5}
                      value={inputData}
                      onChange={(e) => setInputData(e.target.value)}
                      placeholder="Paste code or logs here..."
                      className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 font-mono transition resize-none placeholder:text-neutral-600"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (activeMode !== 'quiz' && !inputData.trim())}
                  className="w-full bg-neutral-200 hover:bg-white text-neutral-900 font-semibold py-3.5 rounded-xl transition duration-150 disabled:opacity-40 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs font-mono tracking-wide"
                >
                  {loading ? '#ProcessingLocally...' : activeMode === 'quiz' ? '#GenerateNewChallenge' : `#Run${activeMode.charAt(0).toUpperCase() + activeMode.slice(1)}`}
                </button>
              </form>

              <div className="bg-neutral-900/30 border border-neutral-800/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">#SpeedDebugArcade</span>
                  <button 
                    onClick={() => { setGameActive(true); setGameTimer(15); }}
                    className="text-[11px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1 rounded-lg"
                  >
                    {gameActive ? `[${gameTimer}s]` : '[Start]'}
                  </button>
                </div>
                <p className="text-xs font-mono text-neutral-300">
                  {gameActive ? 'Find the bug: `const user = data.map(u => u.name);` (Hint: Check nullability!)' : 'Test your speed against the clock.'}
                </p>
              </div>
            </div>

            {/* Right Output Terminal Pane with Intermission Loading */}
            <div className="flex-1 p-5 md:p-8 flex flex-col bg-neutral-950/50">
              <div className="flex-1 bg-black/60 border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-inner min-h-[400px]">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                    <span className="text-xs font-mono font-medium text-neutral-300 uppercase tracking-wider">
                      #TerminalOutput {isRoast ? '(#RoastActive)' : ''}
                    </span>
                    {analysis && !loading && (
                      <button
                        onClick={copyToClipboard}
                        className="text-[11px] font-mono bg-neutral-900 hover:bg-neutral-800 text-neutral-200 px-3 py-1 rounded-lg transition border border-neutral-800"
                      >
                        {copied ? '#Copied' : '#CopyResult'}
                      </button>
                    )}
                  </div>

                  {/* Intermission Loading Screen vs Actual Output */}
                  {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 font-mono animate-fade-in">
                      <div className="w-6 h-6 border-2 border-neutral-500 border-t-white rounded-full animate-spin"></div>
                      <div className="space-y-1">
                        <p className="text-xs text-neutral-300 font-semibold">#LocalInferenceActive</p>
                        <p className="text-[11px] text-emerald-400 transition-all duration-300">
                          {INTERMISSION_QUOTES[quoteIndex]}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-[460px] overflow-y-auto pr-2 space-y-2">
                      {!analysis ? (
                        <div className="h-64 flex items-center justify-center text-neutral-600 font-mono text-xs">
                          <p>#AwaitingInput... Run analysis to view local response.</p>
                        </div>
                      ) : (
                        <div className="text-neutral-200 whitespace-pre-wrap font-sans text-sm leading-relaxed pt-2">
                          {analysis}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-900 pt-3 mt-6 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>#Engine: Qwen 2.5 (3B)</span>
                  <span>#OfflineSecure</span>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* #CommandPalette Modal */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <span className="text-xs font-mono text-neutral-400">#CommandPalette (Cmd+K)</span>
              <button onClick={() => setCommandPaletteOpen(false)} className="text-xs font-mono text-neutral-400 hover:text-white">✕</button>
            </div>
            <input
              type="text"
              autoFocus
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Type a command or mode (e.g., debug, refactor)..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-neutral-600"
            />
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {MODES.filter(m => m.label.toLowerCase().includes(cmdQuery.toLowerCase())).map(m => (
                <div
                  key={m.id}
                  onClick={() => { setActiveMode(m.id); setCommandPaletteOpen(false); setAnalysis(''); }}
                  className="px-3 py-2 rounded-xl text-xs font-mono bg-neutral-950/60 hover:bg-neutral-800 text-neutral-200 cursor-pointer flex justify-between items-center"
                >
                  <span>Switch to {m.label}</span>
                  <span className="text-[10px] text-neutral-500">Enter</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}