import React, { useState } from 'react';
import { GameMode } from './types';
import { SlidingPuzzle } from './components/games/SlidingPuzzle';
import { GeniusGrid } from './components/games/GeniusGrid';
import { Info, HelpCircle } from 'lucide-react';
import { Modal } from './components/ui/Modal';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameMode>('daily15');
  const [showInfo, setShowInfo] = useState(false);

  const games = [
    { id: 'daily15', name: 'Daily 15' },
    { id: 'quickplay', name: 'Blitz' },
    { id: 'genius', name: 'Genius' },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink transition-colors duration-500">
      
      {/* Top Bar / Masthead */}
      <header className="w-full pt-8 pb-4 md:pt-12 md:pb-6 px-6 border-b border-ink/5">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
          
          {/* Logo Area */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="font-serif font-bold text-3xl md:text-4xl tracking-tight text-ink leading-tight">
              Daily15<span className="text-gold">.xyz</span>
            </h1>
            <p className="font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase text-ink-light mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6 md:gap-8">
             {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id as GameMode)}
                  className={`
                    text-xs md:text-sm font-sans font-medium uppercase tracking-widest transition-all duration-300 relative py-1
                    ${activeGame === game.id 
                      ? 'text-ink' 
                      : 'text-ink-light hover:text-gold'
                    }
                  `}
                >
                  {game.name}
                  <span className={`
                    absolute bottom-0 left-0 w-full h-[1px] bg-ink transform transition-transform duration-300 origin-left
                    ${activeGame === game.id ? 'scale-x-100' : 'scale-x-0'}
                  `}/>
                </button>
             ))}
          </nav>

          {/* Utility */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 md:static md:translate-y-0 hidden md:block">
            <button 
                onClick={() => setShowInfo(true)}
                className="text-ink-light hover:text-ink transition-colors p-2"
                aria-label="How to Play"
            >
                <HelpCircle size={20} strokeWidth={1.5} />
            </button>
          </div>
          {/* Mobile Utility */}
          <div className="absolute right-0 top-0 md:hidden p-4">
             <button onClick={() => setShowInfo(true)}>
                 <HelpCircle size={20} className="text-ink-light" strokeWidth={1.5} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        
        {/* Editorial Intro */}
        <div className="text-center mb-10 md:mb-14 animate-fade-in max-w-lg mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink mb-3 leading-snug">
                {activeGame === 'daily15' && "Order from chaos."}
                {activeGame === 'quickplay' && "Sixty seconds on the clock."}
                {activeGame === 'genius' && "A perfect fit."}
            </h2>
            <p className="font-serif text-ink-light text-sm md:text-base leading-relaxed italic">
                {activeGame === 'daily15' && "Arrange the tiles sequentially. A single daily challenge to sharpen the mind."}
                {activeGame === 'quickplay' && "Speed and precision. Solve the 3x3 grid before time runs out."}
                {activeGame === 'genius' && "Fit all geometric pieces into the grid. No gaps, no overlaps."}
            </p>
        </div>

        {/* Game Stage */}
        <div className="w-full flex justify-center min-h-[400px]">
            {activeGame === 'daily15' && <SlidingPuzzle mode="daily15" />}
            {activeGame === 'quickplay' && <SlidingPuzzle mode="quickplay" />}
            {activeGame === 'genius' && <GeniusGrid />}
        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="py-12 text-center border-t border-ink/5 mt-auto">
        <div className="max-w-2xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-ink-light">
            <div className="text-[10px] uppercase tracking-widest font-sans">
             Daily15 &copy; {new Date().getFullYear()}
            </div>
            <div className="flex gap-6">
                 <a href="#" className="text-[10px] uppercase tracking-widest font-sans hover:text-ink hover:underline">About</a>
                 <a href="#" className="text-[10px] uppercase tracking-widest font-sans hover:text-ink hover:underline">Privacy</a>
            </div>
        </div>
      </footer>

      {/* Info Modal */}
      <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="Rules of Engagement">
        <div className="space-y-8 text-ink font-serif leading-relaxed text-sm md:text-base">
            <section>
                <h3 className="font-sans font-bold text-ink uppercase tracking-wider text-xs mb-3 text-gold-dark">Daily 15</h3>
                <p>Slide the ivory tiles to order them from 1 to 15. The empty space must end up in the bottom-right corner. A new puzzle is curated every day at midnight.</p>
                
                {/* Rankings Breakdown */}
                <div className="mt-6 bg-ink/5 p-4 rounded-md">
                   <h4 className="font-sans font-bold text-ink uppercase tracking-wider text-[10px] mb-3">Performance Standards</h4>
                   <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-ink font-bold">Grandmaster</div>
                      <div className="text-right text-ink-light">&lt; 60 moves</div>
                      
                      <div className="text-ink font-bold">Master</div>
                      <div className="text-right text-ink-light">&lt; 80 moves</div>
                      
                      <div className="text-ink font-bold">Expert</div>
                      <div className="text-right text-ink-light">&lt; 100 moves</div>

                      <div className="text-ink font-bold">Scholar</div>
                      <div className="text-right text-ink-light">&lt; 140 moves</div>

                      <div className="text-ink font-bold">Novice</div>
                      <div className="text-right text-ink-light">140+ moves</div>
                   </div>
                </div>
            </section>
            <section>
                <h3 className="font-sans font-bold text-ink uppercase tracking-wider text-xs mb-3 text-gold-dark">Blitz Mode</h3>
                <p>A rapid-fire version on a 3x3 grid. You have 60 seconds. Precision and speed are key.</p>
            </section>
            <section>
                <h3 className="font-sans font-bold text-ink uppercase tracking-wider text-xs mb-3 text-gold-dark">Genius Grid</h3>
                <p>Fit all the colored pieces into the grid. Click a piece to select, then click the grid to place. Press <b>Space</b> or click the button to rotate.</p>
            </section>
        </div>
      </Modal>
    </div>
  );
}