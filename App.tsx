
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
// generateCrossword import removed
import type { CrosswordData } from './types';
import Crossword from './components/Crossword';
import LoadingSpinner from './components/LoadingSpinner';
import HomePage from './components/HomePage';
import ConfirmationModal from './components/ConfirmationModal';
import HelpModal from './components/HelpModal';
import SoundToggle from './components/SoundToggle';
import { useSound } from './components/SoundContext';

const ThemeToggle: React.FC<{ theme: 'light' | 'dark', onToggle: () => void }> = ({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-yellow-400 hover:ring-2 hover:ring-blue-400 transition-all shadow-sm"
    aria-label="Changer le thème"
  >
    {theme === 'light' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7V3m0 14v4m-5-9H3m14 0h4M7.05 7.05L4.93 4.93m12.12 12.12l2.12 2.12M16.95 7.05l2.12-2.12M7.05 16.95l-2.12 2.12M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )}
  </button>
);

interface HeaderProps {
  onRestart: () => void;
  onGoHome: () => void;
  onHelp: () => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  hasData: boolean;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onRestart, onGoHome, onHelp, isLoading, theme, onToggleTheme, hasData, title }) => (
  <header className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md shadow-sm py-2 px-4 flex justify-between items-center sticky top-0 z-50 transition-all">
    <div className="flex items-center gap-3">
      <button
        onClick={onGoHome}
        className="px-3 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-brand-blue-hover focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className="hidden sm:inline">Accueil</span>
      </button>
    </div>

    <div className="flex-1 flex justify-center items-center gap-2 md:gap-4 mx-4 overflow-hidden">
      <h1 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 truncate">
        {title || 'Motissimo'}
      </h1>
      <button
        onClick={onHelp}
        disabled={isLoading || !hasData}
        className="px-2 py-1 md:px-3 md:py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-brand-blue-hover focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shrink-0"
        title="Aide"
      >
        💡
      </button>
    </div>

    <div className="flex items-center gap-2 md:gap-4">
      <button
        onClick={onRestart}
        disabled={isLoading}
        className="px-3 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-brand-blue-hover focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>
      <SoundToggle className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-yellow-400 hover:ring-2 hover:ring-blue-400 transition-all shadow-sm" />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </div>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'game'>('home');
  const [themeState, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('motissimo-theme');
      if (saved) return saved as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const { playSound } = useSound();

  const toggleTheme = () => {
    const nextTheme = themeState === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    localStorage.setItem('motissimo-theme', nextTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (themeState === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeState]);

  const [themeStr, setThemeStr] = useState<string>('');
  const [crosswordData, setCrosswordData] = useState<CrosswordData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [completedGrids, setCompletedGrids] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('motissimo-completed');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const homeScrollY = useRef(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [revealRequest, setRevealRequest] = useState<{ char: string; timestamp: number } | null>(null);
  const [inProgressGrids, setInProgressGrids] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const prog: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('motissimo-progress-')) {
          prog.push(key.replace('motissimo-progress-', ''));
        }
      }
      return prog;
    }
    return [];
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Restore scroll position when returning to Home
  useEffect(() => {
    if (view === 'home') {
      window.scrollTo(0, homeScrollY.current);
    }
  }, [view]);

  const handleSelectGrid = useCallback((data: CrosswordData) => {
    setShowConfetti(false);
    homeScrollY.current = window.scrollY; // Save scroll position
    setThemeStr(data.theme || 'Grille');
    setCrosswordData(data);
    setView('game');
    setGameId(id => id + 1);
    setIsLoading(false);
    setError(null);
    setRevealRequest(null);
    window.scrollTo(0, 0);
  }, []);



  const handleGameComplete = () => {
    setShowConfetti(true);
    playSound('confetti');
    if (crosswordData && crosswordData.id) {
      setCompletedGrids(prev => {
        if (!prev.includes(crosswordData.id!)) {
          const newCompleted = [...prev, crosswordData.id!];
          localStorage.setItem('motissimo-completed', JSON.stringify(newCompleted));

          // Remove from inProgress state to update UI immediately
          // We keep the localStorage progress so the grid stays filled when re-opened
          setInProgressGrids(curr => curr.filter(id => id !== crosswordData.id));

          return newCompleted;
        }
        return prev;
      });
    }
  };

  const handleClearProgress = () => {
    setCompletedGrids([]);
    localStorage.removeItem('motissimo-completed');

    // Clear individual grid progress
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('motissimo-progress-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      setInProgressGrids([]);
    }
  };

  const handleRestart = () => {
    setIsRestartModalOpen(true);
  };

  const confirmRestart = () => {
    if (crosswordData) {
      if (crosswordData.id) {
        localStorage.removeItem(`motissimo-progress-${crosswordData.id}`);

        // Also remove from completed grids if it was completed
        setCompletedGrids(prev => {
          const newCompleted = prev.filter(id => id !== crosswordData.id);
          localStorage.setItem('motissimo-completed', JSON.stringify(newCompleted));
          return newCompleted;
        });
      }
      handleSelectGrid(crosswordData);
    }
  };

  const handleGoHome = () => {
    setShowConfetti(false);
    setView('home');
    setThemeStr('');
    setCrosswordData(null);
    setError(null);
    // Refresh in-progress list when returning home
    if (typeof window !== 'undefined') {
      const prog: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('motissimo-progress-')) {
          prog.push(key.replace('motissimo-progress-', ''));
        }
      }
      setInProgressGrids(prog);
    }
  };

  const handleHelp = () => {
    setIsHelpModalOpen(true);
  };

  const handleRevealConfirm = (char: string) => {
    setRevealRequest({ char, timestamp: Date.now() });
    setIsHelpModalOpen(false);
  };

  const validChars = React.useMemo(() => {
    if (!crosswordData) return new Set<string>();
    const chars = new Set<string>();
    crosswordData.words.forEach(word => {
      for (const char of word.answer) {
        chars.add(char);
      }
    });
    return chars;
  }, [crosswordData]);

  if (view === 'home') {
    return (
      <HomePage
        onSelectGrid={handleSelectGrid}
        theme={themeState}
        onToggleTheme={toggleTheme}
        completedGrids={completedGrids}
        inProgressGrids={inProgressGrids}
        onClearProgress={handleClearProgress}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 overflow-x-hidden relative">
      {showConfetti && dimensions.width > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        </div>
      )}
      {crosswordData?.categoryImage && (
        <div
          className="fixed inset-0 z-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${crosswordData.categoryImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      <div className="relative z-10 flex flex-col min-h-full">
        <Header
          onRestart={handleRestart}
          onGoHome={handleGoHome}
          onHelp={handleHelp}
          isLoading={isLoading}
          theme={themeState}
          onToggleTheme={toggleTheme}
          hasData={!!crosswordData}
          title={themeStr}
        />
        <main className="container mx-auto flex-grow">
          {isLoading && <LoadingSpinner />}
          {error && (
            <div className="text-center p-12 animate-fade-in">
              <div className="mx-auto w-20 h-20 text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-red-600 dark:text-red-400">Erreur de Génération</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-md mx-auto">{error}</p>
              <button
                onClick={handleGoHome}
                className="mt-8 px-6 py-2 bg-brand-blue text-white font-bold rounded-lg shadow-lg hover:bg-brand-blue-hover transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          )}
          {!isLoading && !error && crosswordData && <Crossword key={gameId} data={crosswordData} onComplete={handleGameComplete} onGoHome={handleGoHome} revealRequest={revealRequest} />}
        </main>
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onConfirm={handleRevealConfirm}
        validChars={validChars}
      />

      <ConfirmationModal
        isOpen={isRestartModalOpen}
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={confirmRestart}
        title="Recommencer la grille"
        message="Voulez-vous vraiment recommencer cette grille ? Toute votre progression actuelle sera perdue."
        confirmLabel="Recommencer"
        isDestructive={true}
      />
    </div >
  );
};

export default App;
