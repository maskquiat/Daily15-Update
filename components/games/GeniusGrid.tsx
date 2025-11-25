import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '../ui/Button';
import { RotateCw, Undo2, RefreshCw } from 'lucide-react';
import { GeniusPiece } from '../../types';

// Sophisticated Palette (Nature/Library/Academic tones)
const PIECES_CONFIG = {
  I1: { shape: [[1]], color: '#8B4513', name: 'Oak' },           // Saddle Brown
  I2: { shape: [[1, 1]], color: '#A0522D', name: 'Sienna' },     // Sienna
  I3: { shape: [[1, 1, 1]], color: '#CD853F', name: 'Peru' },    // Peru
  I4: { shape: [[1, 1, 1, 1]], color: '#556B2F', name: 'Olive' }, // Dark Olive Green
  I5: { shape: [[1, 1, 1, 1, 1]], color: '#2E8B57', name: 'Sea' }, // Sea Green
  L3: { shape: [[1, 1], [1, 0]], color: '#4682B4', name: 'Steel' },   // Steel Blue
  L4: { shape: [[1, 1, 1], [1, 0, 0]], color: '#191970', name: 'Midnight' }, // Midnight Blue
  T4: { shape: [[1, 1, 1], [0, 1, 0]], color: '#483D8B', name: 'Slate' }, // Dark Slate Blue
  Z4: { shape: [[1, 1, 0], [0, 1, 1]], color: '#800000', name: 'Maroon' }  // Maroon
};

// Simple static daily puzzle
const DAILY_BLOCKERS = [
  { row: 0, col: 4 }, { row: 1, col: 1 }, { row: 2, col: 5 }, 
  { row: 3, col: 2 }, { row: 4, col: 0 }, { row: 5, col: 3 }
];

export const GeniusGrid: React.FC = () => {
  const GRID_SIZE = 6;
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  const [pieces, setPieces] = useState<GeniusPiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{r: number, c: number} | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize
  useEffect(() => {
    const initialPieces = Object.entries(PIECES_CONFIG).map(([id, config]) => ({
      id,
      ...config,
      rotation: 0,
      placed: false
    }));
    setPieces(initialPieces);

    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    DAILY_BLOCKERS.forEach(b => {
      newGrid[b.row][b.col] = 'blocker';
    });
    setGrid(newGrid as (string | null)[][]);
    setIsComplete(false);
  }, []);

  // Logic Helpers
  const rotateShape = (shape: number[][]) => {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j];
      }
    }
    return rotated;
  };

  const getRotatedPieceShape = (piece: GeniusPiece) => {
    let shape = piece.shape;
    for (let i = 0; i < piece.rotation; i++) {
      shape = rotateShape(shape);
    }
    return shape;
  };

  const handleRotate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedPieceId) return;
    setPieces(prev => prev.map(p => {
      if (p.id === selectedPieceId) {
        return { ...p, rotation: (p.rotation + 1) % 4 };
      }
      return p;
    }));
  };

  // Check bounds and collisions
  const isValidPlacement = (shape: number[][], r: number, c: number) => {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          const nr = r + i;
          const nc = c + j;
          if (nr >= GRID_SIZE || nc >= GRID_SIZE || nr < 0 || nc < 0) return false;
          if (grid[nr][nc] !== null) return false;
        }
      }
    }
    return true;
  };

  // Keyboard Rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'r') {
        e.preventDefault();
        handleRotate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPieceId]);


  // Smart Snap Logic
  const getSmartSnapPosition = (shape: number[][], r: number, c: number) => {
    const offsetR = Math.floor(shape.length / 2);
    const offsetC = Math.floor(shape[0].length / 2);
    const baseR = r - offsetR;
    const baseC = c - offsetC;

    // 1. Check exact center first
    if (isValidPlacement(shape, baseR, baseC)) return { r: baseR, c: baseC };

    // 2. Spiral search for nearest valid spot
    const deltas = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    for (let [dr, dc] of deltas) {
        if (isValidPlacement(shape, baseR + dr, baseC + dc)) {
            return { r: baseR + dr, c: baseC + dc };
        }
    }

    return null;
  };

  const handleCellClick = (r: number, c: number) => {
    const cellValue = grid[r][c];

    // 1. Remove Piece
    if (cellValue && cellValue !== 'blocker') {
      // Save history before removing
      setHistory(prev => [...prev, { grid: JSON.parse(JSON.stringify(grid)), pieces: JSON.parse(JSON.stringify(pieces)) }]);
      
      const newGrid = grid.map(row => row.map(cell => cell === cellValue ? null : cell));
      setGrid(newGrid);
      setPieces(prev => prev.map(p => p.id === cellValue ? { ...p, placed: false } : p));
      setSelectedPieceId(cellValue);
      return;
    }

    // 2. Place Piece
    if (selectedPieceId) {
      const piece = pieces.find(p => p.id === selectedPieceId);
      if (!piece) return;

      const shape = getRotatedPieceShape(piece);
      const snapPos = getSmartSnapPosition(shape, r, c);

      if (snapPos) {
        setHistory(prev => [...prev, { grid: JSON.parse(JSON.stringify(grid)), pieces: JSON.parse(JSON.stringify(pieces)) }]);

        const newGrid = [...grid.map(row => [...row])];
        for(let i=0; i<shape.length; i++) {
            for(let j=0; j<shape[0].length; j++) {
                if(shape[i][j] === 1) {
                    newGrid[snapPos.r + i][snapPos.c + j] = piece.id;
                }
            }
        }
        setGrid(newGrid);
        setPieces(prev => prev.map(p => p.id === selectedPieceId ? { ...p, placed: true } : p));
        setSelectedPieceId(null);
        setHoverPos(null);

        // Check Win
        const isFull = newGrid.every(row => row.every(cell => cell !== null));
        if (isFull) {
            setIsComplete(true);
            confetti({
                particleCount: 200,
                spread: 100,
                colors: ['#BFA15F', '#2C2C2C', '#F0EFE9']
            });
        }
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setGrid(lastState.grid);
    setPieces(lastState.pieces);
    setHistory(prev => prev.slice(0, -1));
  };

  // Calculate Preview
  const preview = useMemo(() => {
    if (!selectedPieceId || !hoverPos) return null;
    const piece = pieces.find(p => p.id === selectedPieceId);
    if (!piece) return null;

    const shape = getRotatedPieceShape(piece);
    const snapPos = getSmartSnapPosition(shape, hoverPos.r, hoverPos.c);
    
    if (!snapPos) return { valid: false, cells: [] }; 

    const cells = [];
    for(let i=0; i<shape.length; i++) {
        for(let j=0; j<shape[0].length; j++) {
            if(shape[i][j] === 1) {
                cells.push({ r: snapPos.r + i, c: snapPos.c + j });
            }
        }
    }
    return { valid: true, cells };
  }, [selectedPieceId, hoverPos, pieces, grid]);


  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full animate-slide-up">
      
      {/* Control Bar */}
      <div className="flex justify-between items-center w-full mb-4 px-4">
        <div className="flex flex-col">
             {/* Tiny progress indicator */}
             <div className="flex gap-1">
                 <span className="text-xs font-sans uppercase tracking-widest text-ink-light">Remaining:</span>
                 <span className="text-xs font-sans font-bold text-ink">{pieces.filter(p => !p.placed).length}</span>
             </div>
        </div>
        <div className="flex gap-3">
            <Button size="sm" variant="ghost" onClick={handleUndo} disabled={history.length === 0}>
                <Undo2 size={16} className="mr-1" /> Undo
            </Button>
             <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
                <RefreshCw size={16} className="mr-1" /> Reset
            </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div 
        className="bg-daily-ivory p-4 rounded-lg border border-ink/10 mb-8 relative select-none touch-none shadow-soft"
        onMouseLeave={() => setHoverPos(null)}
      >
        <div 
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
            {grid.map((row, r) => row.map((cell, c) => {
                const isPreview = preview?.valid && preview.cells.some(p => p.r === r && p.c === c);
                const pieceData = cell && cell !== 'blocker' ? pieces.find(p => p.id === cell) : null;
                
                return (
                    <div
                        key={`${r}-${c}`}
                        className={`
                            w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-[2px] transition-all duration-150
                            flex items-center justify-center border
                            ${cell === 'blocker' ? 'bg-ink border-ink' : 'border-ink/5'}
                            ${!cell && !isPreview ? 'bg-paper' : ''}
                            ${isPreview ? 'bg-ink/10 border-ink/20' : ''}
                        `}
                        style={{ 
                            backgroundColor: pieceData ? pieceData.color : undefined,
                            borderColor: pieceData ? 'rgba(0,0,0,0.1)' : undefined,
                        }}
                        onMouseEnter={() => setHoverPos({r, c})}
                        onClick={() => handleCellClick(r, c)}
                    >
                        {cell === 'blocker' && (
                             <div className="w-2 h-2 rounded-full bg-paper/20"></div>
                        )}
                    </div>
                );
            }))}
        </div>
      </div>

      {/* Piece Tray */}
      <div className="w-full bg-paper rounded-xl p-6 border-t border-ink/5">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans text-xs uppercase tracking-widest text-ink-light">Available Pieces</h3>
            <Button size="sm" variant="outline" onClick={handleRotate} disabled={!selectedPieceId}>
                <RotateCw size={14} className="mr-2" /> Rotate
            </Button>
        </div>

        <div className="flex flex-wrap gap-8 justify-center min-h-[100px] items-start content-start">
            {pieces.filter(p => !p.placed).map(piece => {
                 const shape = getRotatedPieceShape(piece);
                 const isSelected = selectedPieceId === piece.id;
                 return (
                    <motion.button
                        key={piece.id}
                        layoutId={`piece-${piece.id}`}
                        className={`
                            relative transition-all duration-300
                            ${isSelected ? 'z-10 drop-shadow-md scale-105' : 'hover:opacity-80 opacity-90'}
                        `}
                        onClick={() => setSelectedPieceId(isSelected ? null : piece.id)}
                    >
                        {/* Render using Flex Column of Rows to match Matrix[row][col] structure */}
                        <div className="flex flex-col gap-[1px]">
                           {shape.map((row, r) => (
                             <div key={r} className="flex gap-[1px]">
                               {row.map((cell, c) => (
                                 <div 
                                   key={c} 
                                   className={`w-4 h-4 sm:w-5 sm:h-5 rounded-[1px]`}
                                   style={{ 
                                       backgroundColor: cell ? piece.color : 'transparent',
                                   }}
                                 />
                               ))}
                             </div>
                           ))}
                        </div>

                        {isSelected && (
                            <motion.div 
                                layoutId="selection-ring"
                                className="absolute -inset-2 border border-ink/50 rounded-lg pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                    </motion.button>
                 );
            })}
            
            {pieces.every(p => p.placed) && (
                <div className="text-success font-serif italic py-8 animate-fade-in">
                    Grid completed.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};