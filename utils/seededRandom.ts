export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

export const getTodaysSeed = (): number => {
  const today = new Date();
  return (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  );
};

export const getPuzzleNumber = (startDateStr = '2025-09-20'): number => {
    const today = new Date();
    const epoch = new Date(startDateStr);
    const diffTime = Math.abs(today.getTime() - epoch.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}