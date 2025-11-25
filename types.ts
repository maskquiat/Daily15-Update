export type GameMode = 'daily15' | 'quickplay' | 'genius';

export interface PuzzleState {
  grid: (number | null)[];
  moves: number;
  isComplete: boolean;
  startTime: number | null;
  completionTime: number | null;
}

export interface GeniusPiece {
  id: string;
  shape: number[][];
  color: string;
  name: string;
  rotation: number; // 0, 1, 2, 3
  placed: boolean;
}

export interface GeniusState {
  grid: (string | null)[]; // 'blocker' | pieceId | null
  pieces: GeniusPiece[];
  selectedPieceId: string | null;
  timer: number;
  isComplete: boolean;
}

export interface DailyStats {
  played: number;
  streak: number;
  wins: number;
  bestTime: number | null;
}