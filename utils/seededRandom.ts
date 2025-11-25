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

export const getPuzzleNumber = (startDateStr = '2025-09-19'): number => {
    // robust local date calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [y, m, d] = startDateStr.split('-').map(Number);
    // Note: Month is 0-indexed in JS Date constructor (0 = Jan, 8 = Sep)
    const epoch = new Date(y, m - 1, d); 
    epoch.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - epoch.getTime();
    // Use floor to get completed days, +1 for 1-based index (Day 1, Day 2...)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}