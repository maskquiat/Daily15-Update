import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SeededRandom, getTodaysSeed, getPuzzleNumber } from '../../utils/seededRandom';
import { Button } from '../ui/Button';
import { Clock, Trophy } from 'lucide-react';

interface SlidingPuzzleProps {
  mode: 'daily15' | 'quickplay';
}

const RANKING_TIERS = [
  { label: 'Grandmaster', threshold: 60 },
  { label: 'Master', threshold: 80 },
  { label: 'Expert', threshold: 100 },
  { label: 'Scholar', threshold: 140 },
  { label: 'Novice', threshold: Infinity },
];

export const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ mode }) => {
  const gridSize = mode === 'daily15' ? 4 : 3;
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Initialize/Reset Logic
  const initGame = useCallback(() => {
    const size = gridSize * gridSize;
    let newTiles: (number | null)[] = [];
    
    for (let i = 1; i < size; i++) newTiles.push(i);
    newTiles.push(null);

    let emptyIdx = size - 1;
    let rng: SeededRandom;

    if (mode === 'daily15') {
      rng = new SeededRandom(getTodaysSeed());
    } else {
      rng = new SeededRandom(Date.now());
    }

    // Shuffle
    const shuffleCount = mode === 'daily15' ? 1500 : 100;
    for (let i = 0; i < shuffleCount; i++) {
      const moves: number[] = [];
      const row = Math.floor(emptyIdx / gridSize);
      const col = emptyIdx % gridSize;

      if (row > 0) moves.push(emptyIdx - gridSize);
      if (row < gridSize - 1) moves.push(emptyIdx + gridSize);
      if (col > 0) moves.push(emptyIdx - 1);
      if (col < gridSize - 1) moves.push(emptyIdx + 1);

      const randomMove = moves[Math.floor(rng.next() * moves.length)];
      newTiles[emptyIdx] = newTiles[randomMove];
      newTiles[randomMove] = null;
      emptyIdx = randomMove;
    }

    setTiles(newTiles);
    setMoves(0);
    setIsComplete(false);
    if (mode === 'daily15') {
      setIsPlaying(true);
      setStartTime(Date.now());
    } else {
      setIsPlaying(false);
      setTimeLeft(60);
    }
  }, [mode, gridSize]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer
  useEffect(() => {
    let interval: any;
    if (mode === 'quickplay' && isPlaying && !isComplete && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [mode, isPlaying, isComplete, timeLeft]);

  const handleTileClick = (index: number) => {
    if (isComplete || (!isPlaying && mode === 'quickplay')) return;

    const emptyIdx = tiles.indexOf(null);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIdx / gridSize);
    const emptyCol = emptyIdx % gridSize;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[emptyIdx] = newTiles[index];
      newTiles[index] = null;
      setTiles(newTiles);
      setMoves((m) => m + 1);

      const isWin = newTiles.every((val, idx) => {
        if (idx === newTiles.length - 1) return val === null;
        return val === idx + 1;
      });

      if (isWin) {
        setIsComplete(true);
        setIsPlaying(false);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#BFA15F', '#2C2C2C', '#F0EFE9'],
          disableForReducedMotion: true
        });
      }
    }
  };

  const startQuickPlay = () => {
    initGame();
    setIsPlaying(true);
  };

  const shareResult = () => {
    const text = `Daily15.xyz #${getPuzzleNumber()} \nSolved in ${moves} moves.`;
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard"));
  };

  const getRank = (moveCount: number) => {
    return RANKING_TIERS.find(t => moveCount <= t.threshold)?.label || 'Novice';
  };

  return (
    <div className="flex flex-col items-center max-w-[400px] mx-auto w-full animate-slide-up">
      {/* Subtle Stats Header */}
      <div className="w-full flex justify-between items-end mb-6 text-ink-light font-sans text-xs tracking-widest uppercase">
        <div className="flex gap-4">
           <div>Moves <span className="text-ink font-bold ml-1">{moves}</span></div>
        </div>
        
        {mode === 'daily15' && (
             <div className="text-ink-light">No. <span className="text-ink font-bold ml-1">{getPuzzleNumber()}</span></div>
        )}

        {mode === 'quickplay' && (
          <div className={`${timeLeft <= 10 ? 'text-red-700' : 'text-ink'} transition-colors`}>
            Time <span className="font-bold ml-1">{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Grid Frame */}
      <div 
        className="bg-daily-ivory p-3 rounded-lg border border-ink/5 shadow-soft mb-8 w-full aspect-square relative"
      >
        <div 
            className="w-full h-full"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: '8px'
            }}
        >
            {tiles.map((tile, index) => (
            <motion.button
                layout
                key={tile !== null ? tile : `empty-${index}`}
                /* CRITICAL CHANGE: type: 'tween' removes the spring bounce entirely */
                transition={{ 
                    layout: { duration: 0.15, type: "tween", ease: "easeInOut" } 
                }} 
                className={`
                relative rounded-md text-3xl md:text-4xl font-serif flex items-center justify-center
                ${tile === null 
                    ? 'invisible pointer-events-none' 
                    : 'bg-paper text-ink shadow-[0_2px_0_rgba(0,0,0,0.08)] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all duration-100 cursor-pointer border border-ink/5'
                }
                ${isComplete && tile !== null ? '!bg-gold !text-white !border-gold' : ''}
                `}
                onClick={() => handleTileClick(index)}
                disabled={isComplete}
            >
                {tile}
            </motion.button>
            ))}
        </div>
        
        {/* Overlays */}
        {!isPlaying && mode === 'quickplay' && !isComplete && (
          <div className="absolute inset-0 bg-paper/90 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 text-ink p-6 text-center rounded-lg">
            <Clock size={32} className="mb-4 text-gold" strokeWidth={1.5} />
            <h3 className="text-xl font-serif font-bold mb-2">Blitz Mode</h3>
            <p className="mb-6 font-sans text-sm text-ink-light max-w-[200px]">Complete the 3x3 grid within 60 seconds.</p>
            <Button onClick={startQuickPlay} variant="primary" size="md">
              Start Round
            </Button>
          </div>
        )}

        {isComplete && (
           <div className="absolute inset-0 bg-paper/95 backdrop-blur-md flex flex-col items-center justify-center z-20 text-ink p-6 text-center rounded-lg animate-fade-in">
             <Trophy size={32} className="text-gold mb-4" strokeWidth={1.5} />
             <h3 className="text-2xl font-serif font-bold mb-2">
                 {mode === 'daily15' ? getRank(moves) : 'Excellent'}
             </h3>
             <p className="mb-8 font-sans text-sm text-ink-light">
               {mode === 'quickplay' ? `Finished with ${timeLeft}s remaining` : `Solved in ${moves} moves`}
             </p>
             <div className="flex flex-col gap-3 w-full max-w-[180px]">
               <Button onClick={mode === 'quickplay' ? startQuickPlay : shareResult} variant="primary" size="md" className="w-full">
                 {mode === 'quickplay' ? 'Again' : 'Share'}
               </Button>
               {mode === 'daily15' && (
                   <Button onClick={initGame} variant="ghost" size="sm" className="w-full">
                     Reset Puzzle
                   </Button>
               )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};