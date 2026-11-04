
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { CrosswordData, CellData, Word, ActiveCell } from '../types';
import { useSound } from './SoundContext';

interface CrosswordProps {
  data: CrosswordData;
  onComplete: () => void;
  onGoHome?: () => void;
  revealRequest: { char: string; timestamp: number } | null;
}

const Crossword: React.FC<CrosswordProps> = ({ data, onComplete, onGoHome, revealRequest }) => {
  const { words, size, id } = data;
  const { playSound } = useSound();
  const [userGrid, setUserGrid] = useState<string[][]>(() => {
    if (typeof window !== 'undefined' && id) {
      const saved = localStorage.getItem(`motissimo-progress-${id}`);
      if (saved) {
        try {
          // Verify size matches to avoid errors if grid structure changed
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === size && parsed[0].length === size) {
            return parsed;
          }
        } catch (e) {
          console.error("Failed to parse saved grid", e);
        }
      }
    }
    return new Array(size).fill(null).map(() => new Array(size).fill(''));
  });
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [isComplete, setIsComplete] = useState(false);
  const [showHomeButton, setShowHomeButton] = useState(false);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());

  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    new Array(size).fill(null).map(() => new Array(size).fill(null))
  );

  const gridLayout = useMemo<CellData[][]>(() => {
    const layout: CellData[][] = new Array(size).fill(null).map(() =>
      new Array(size).fill(null).map(() => ({ isBlack: true }))
    );
    words.forEach((word, index) => {
      for (let i = 0; i < word.answer.length; i++) {
        const r = word.direction === 'down' ? word.row + i : word.row;
        const c = word.direction === 'across' ? word.col + i : word.col;
        if (r < size && c < size) {
          layout[r][c].isBlack = false;
          layout[r][c].char = word.answer[i];
          if (i === 0) {
            layout[r][c].number = word.number;
          }
          if (word.direction === 'across') {
            layout[r][c].acrossWordIndex = index;
          } else {
            layout[r][c].downWordIndex = index;
          }
        }
      }
    });
    return layout;
  }, [words, size]);

  useEffect(() => {
    if (activeCell) {
      const input = inputRefs.current[activeCell.row][activeCell.col];
      if (input) {
        input.focus();
        // Select text to allow easy overwrite on mobile
        input.select();
      }
    }
  }, [activeCell]);

  // Handle Home Button visibility with delay
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowHomeButton(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowHomeButton(false);
    }
  }, [isComplete]);

  // Save progress to LocalStorage
  useEffect(() => {
    if (id) {
      const isEmpty = userGrid.every(row => row.every(cell => cell === ''));
      if (isEmpty) {
        localStorage.removeItem(`motissimo-progress-${id}`);
      } else {
        localStorage.setItem(`motissimo-progress-${id}`, JSON.stringify(userGrid));
      }
    }
  }, [userGrid, id]);

  useEffect(() => {
    if (revealRequest && !isComplete) {
      const { char } = revealRequest;
      const newGrid = [...userGrid.map(r => [...r])];
      const newlyRevealed = new Set<string>();
      let changed = false;

      gridLayout.forEach((row, rIndex) => {
        row.forEach((cell, cIndex) => {
          if (!cell.isBlack && cell.char === char) {
            if (newGrid[rIndex][cIndex] !== char) {
              newGrid[rIndex][cIndex] = char;
              newlyRevealed.add(`${rIndex}-${cIndex}`);
              changed = true;
            }
          }
        });
      });

      if (changed) {
        setUserGrid(newGrid);
        setRevealedCells(prev => {
          const next = new Set(prev);
          newlyRevealed.forEach(key => next.add(key));
          return next;
        });

        // Remove animation class after delay
        setTimeout(() => {
          setRevealedCells(prev => {
            const next = new Set(prev);
            newlyRevealed.forEach(key => next.delete(key));
            return next;
          });
        }, 1500);
      }
    }
  }, [revealRequest, gridLayout, isComplete]); // userGrid removed from dependency to avoid infinite loops if referential logic changes, though here we clone it.

  useEffect(() => {
    if (isComplete || words.length === 0) return;

    let allCorrect = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cellData = gridLayout[r][c];
        if (!cellData.isBlack && cellData.char !== userGrid[r][c]) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }

    if (allCorrect) {
      setIsComplete(true);
      onComplete();
      setActiveCell(null);
    }
  }, [userGrid, gridLayout, size, isComplete, words, onComplete]);

  const getActiveWord = (): Word | undefined => {
    if (!activeCell) return undefined;
    const cellData = gridLayout[activeCell.row][activeCell.col];
    const wordIndex = direction === 'across' ? cellData.acrossWordIndex : cellData.downWordIndex;
    if (wordIndex !== undefined) return words[wordIndex];
    const otherDirection = direction === 'across' ? 'down' : 'across';
    const otherWordIndex = otherDirection === 'across' ? cellData.acrossWordIndex : cellData.downWordIndex;
    if (otherWordIndex !== undefined) {
      setDirection(otherDirection);
      return words[otherWordIndex];
    }
    return undefined;
  };

  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return;
    const newActiveCell = { row, col };
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      const cellData = gridLayout[row][col];
      if (cellData.acrossWordIndex !== undefined && cellData.downWordIndex !== undefined) {
        setDirection(prev => prev === 'across' ? 'down' : 'across');
      }
    } else {
      const cellData = gridLayout[row][col];
      if (cellData.acrossWordIndex !== undefined && cellData.downWordIndex === undefined) {
        setDirection('across');
      } else if (cellData.acrossWordIndex === undefined && cellData.downWordIndex !== undefined) {
        setDirection('down');
      }
    }
    setActiveCell(newActiveCell);
  };

  const handleClueClick = (word: Word) => {
    if (isComplete) return;
    setActiveCell({ row: word.row, col: word.col });
    setDirection(word.direction);
  }

  const activeWord = getActiveWord();

  const isCellInActiveWord = (row: number, col: number) => {
    if (!activeWord) return false;
    if (activeWord.direction === 'across') {
      return row === activeWord.row && col >= activeWord.col && col < activeWord.col + activeWord.answer.length;
    } else {
      return col === activeWord.col && row >= activeWord.row && row < activeWord.row + activeWord.answer.length;
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>, row: number, col: number) => {
    if (isComplete) return;

    const input = e.currentTarget;
    const val = input.value;

    // On mobile, if a letter is already there, we want to grab the most recently typed character
    // usually it will be the last character if the cursor is at the end, or we can just take the last char of the string
    if (val.length > 0) {
      const charStr = val.slice(-1);

      if (charStr.match(/[a-zA-ZàâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]/)) {
        let char = charStr.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const newUserGrid = [...userGrid.map(r => [...r])];
        newUserGrid[row][col] = char;
        setUserGrid(newUserGrid);

        let nextRow = row;
        let nextCol = col;
        if (direction === 'across') nextCol++; else nextRow++;

        if (isCellInActiveWord(nextRow, nextCol)) {
          setActiveCell({ row: nextRow, col: nextCol });
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (isComplete) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newUserGrid = [...userGrid.map(r => [...r])];
      if (newUserGrid[row][col] !== '') {
        newUserGrid[row][col] = '';
        setUserGrid(newUserGrid);
      } else {
        let prevRow = row;
        let prevCol = col;
        if (direction === 'across') prevCol--; else prevRow--;
        if (isCellInActiveWord(prevRow, prevCol)) {
          setActiveCell({ row: prevRow, col: prevCol });
        }
      }
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const move = (dr: number, dc: number) => {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < size && c >= 0 && c < size) {
          if (!gridLayout[r][c].isBlack) {
            setActiveCell({ row: r, col: c });
            return;
          }
          r += dr; c += dc;
        }
      };
      if (e.key === 'ArrowUp') move(-1, 0);
      else if (e.key === 'ArrowDown') move(1, 0);
      else if (e.key === 'ArrowLeft') move(0, -1);
      else if (e.key === 'ArrowRight') move(0, 1);
    }
  };

  const acrossClues = useMemo(() => words.filter(w => w.direction === 'across').sort((a, b) => a.number - b.number), [words]);
  const downClues = useMemo(() => words.filter(w => w.direction === 'down').sort((a, b) => a.number - b.number), [words]);

  const completedWordsIndices = useMemo(() => {
    const indices = new Set<number>();
    words.forEach((word, index) => {
      let isComplete = true;
      for (let i = 0; i < word.answer.length; i++) {
        const r = word.direction === 'down' ? word.row + i : word.row;
        const c = word.direction === 'across' ? word.col + i : word.col;
        if (userGrid[r][c] !== word.answer[i]) {
          isComplete = false;
          break;
        }
      }
      if (isComplete) indices.add(index);
    });
    return indices;
  }, [userGrid, words]);

  const prevCompletedCountRef = useRef(completedWordsIndices.size);

  useEffect(() => {
    if (completedWordsIndices.size > prevCompletedCountRef.current) {
      playSound('word');
    }
    prevCompletedCountRef.current = completedWordsIndices.size;
  }, [completedWordsIndices.size, playSound]);

  return (
    <div className="relative p-4 md:p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-3 animate-fade-in">
      {/* Fallback for when there's no image but we still want the layout behavior */}
      <div className="flex-grow z-10 flex justify-center lg:justify-end">
        <div
          className="grid bg-black shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden border-4 border-black mx-auto lg:mx-0"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '600px',
            aspectRatio: '1 / 1'
          }}
        >
          {gridLayout.map((rowItems, row) =>
            rowItems.map((cell, col) => {
              if (cell.isBlack) {
                return <div key={`${row}-${col}`} className="bg-slate-800 dark:bg-black" />;
              }
              const isActive = activeCell?.row === row && activeCell?.col === col;
              const isInActiveWord = isCellInActiveWord(row, col);

              const isAcrossValid = cell.acrossWordIndex !== undefined && completedWordsIndices.has(cell.acrossWordIndex);
              const isDownValid = cell.downWordIndex !== undefined && completedWordsIndices.has(cell.downWordIndex);
              const isValidated = isAcrossValid || isDownValid;
              const isJustRevealed = revealedCells.has(`${row}-${col}`);

              let cellBg = 'bg-white dark:bg-slate-800';
              if (isActive && !isComplete) cellBg = 'bg-yellow-100 dark:bg-yellow-900/60 ring-2 ring-yellow-400 dark:ring-yellow-500 z-10';
              else if (isInActiveWord && !isComplete) cellBg = 'bg-blue-200 dark:bg-blue-900/30';

              if (isJustRevealed) {
                cellBg = 'bg-green-100 dark:bg-green-900/50 animate-pulse ring-2 ring-green-400';
              }

              const textColor = isValidated
                ? 'text-green-600 dark:text-green-400 font-bold'
                : 'text-slate-900 dark:text-slate-100';

              return (
                <div key={`${row}-${col}`} className={`relative border border-black ${cellBg} transition-all duration-200`}>
                  {cell.number && <span className="absolute top-0.5 left-1 text-[9px] md:text-[11px] text-slate-400 dark:text-slate-500 font-bold leading-none">{cell.number}</span>}
                  <input
                    ref={el => { if (el) inputRefs.current[row][col] = el; }}
                    type="text"
                    maxLength={5}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    onClick={() => handleCellClick(row, col)}
                    onFocus={e => e.currentTarget.select()}
                    onKeyDown={e => handleKeyDown(e, row, col)}
                    onInput={e => handleInput(e as React.FormEvent<HTMLInputElement>, row, col)}
                    value={userGrid[row][col] || ''}
                    disabled={isComplete}
                    className={`w-full h-full p-0 m-0 text-center uppercase text-xl md:text-3xl font-bold bg-transparent outline-none ring-0 ${textColor} ${isComplete ? 'cursor-default' : 'cursor-pointer'}`}
                    aria-label={`Case à la ligne ${row + 1}, colonne ${col + 1}`}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 flex-shrink-0 space-y-6 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Horizontalement
          </h2>
          <ul className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {acrossClues.map((word) => (
              <li
                key={word.number + word.direction}
                onClick={() => handleClueClick(word)}
                className={`pb-0.5 rounded-lg transition-all ${activeWord?.number === word.number && activeWord?.direction === word.direction ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'} cursor-pointer`}
              >
                <div className="flex gap-3 items-center pl-2">
                  <span className={`font-black text-lg ${activeWord?.number === word.number && activeWord?.direction === word.direction ? 'text-white' : 'text-blue-500 dark:text-blue-400'} `}>{word.number}</span>
                  <span className="text-sm font-medium leading-tight pt-0.5">{word.clue}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {/* Fix: removed duplicate 'd' and 'clipRule' attributes in the vertical bars path */}
              <path fillRule="evenodd" d="M4 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm5 0a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm5 0a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Verticalement
          </h2>
          <ul className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {downClues.map((word) => (
              <li
                key={word.number + word.direction}
                onClick={() => handleClueClick(word)}
                className={`pb-0.5 rounded-lg transition-all ${activeWord?.number === word.number && activeWord?.direction === word.direction ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'} cursor-pointer`}
              >
                <div className="flex gap-3 items-center pl-2">
                  <span className={`font-black text-lg ${activeWord?.number === word.number && activeWord?.direction === word.direction ? 'text-white' : 'text-teal-500 dark:text-teal-400'}`}>{word.number}</span>
                  <span className="text-sm font-medium leading-tight pt-0.5">{word.clue}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showHomeButton && onGoHome && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <button
            onClick={onGoHome}
            className="px-8 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Retourner à l'accueil
          </button>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </div>
  );
};

export default Crossword;
