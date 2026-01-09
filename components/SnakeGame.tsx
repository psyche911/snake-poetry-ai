
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Point, Direction, FoodItem } from '../types';
import { GRID_SIZE, INITIAL_SPEED, WORD_BANK, WORDS_LIMIT } from '../constants';

interface SnakeGameProps {
  onWordCollected: (word: string) => void;
  collectedCount: number;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onWordCollected, collectedCount }) => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<FoodItem | null>(null);
  const [gameOver, setGameOver] = useState(false);
  
  const moveRef = useRef<Direction>('RIGHT');

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newPos: Point;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(s => s.x === newPos.x && s.y === newPos.y)) break;
    }
    const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setFood({ pos: newPos, word });
  }, []);

  useEffect(() => {
    if (!food) generateFood(snake);
  }, [food, snake, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (dir !== 'DOWN') moveRef.current = 'UP'; break;
        case 'ArrowDown': if (dir !== 'UP') moveRef.current = 'DOWN'; break;
        case 'ArrowLeft': if (dir !== 'RIGHT') moveRef.current = 'LEFT'; break;
        case 'ArrowRight': if (dir !== 'LEFT') moveRef.current = 'RIGHT'; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir]);

  useEffect(() => {
    if (gameOver || collectedCount >= WORDS_LIMIT) return;

    const interval = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        const newDir = moveRef.current;
        setDir(newDir);

        const newHead = { ...head };
        if (newDir === 'UP') newHead.y -= 1;
        if (newDir === 'DOWN') newHead.y += 1;
        if (newDir === 'LEFT') newHead.x -= 1;
        if (newDir === 'RIGHT') newHead.x += 1;

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food collision
        if (food && newHead.x === food.pos.x && newHead.y === food.pos.y) {
          onWordCollected(food.word);
          setFood(null);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => clearInterval(interval);
  }, [food, gameOver, collectedCount, onWordCollected]);

  const reset = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDir('RIGHT');
    moveRef.current = 'RIGHT';
    setFood(null);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl overflow-hidden"
        style={{ width: 400, height: 400 }}
      >
        {snake.map((p, i) => (
          <div
            key={i}
            className={`absolute rounded-sm transition-all duration-150 ${i === 0 ? 'bg-emerald-400 z-10' : 'bg-emerald-600'}`}
            style={{
              left: `${(p.x / GRID_SIZE) * 100}%`,
              top: `${(p.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
            }}
          />
        ))}
        {food && (
          <div
            className="absolute flex items-center justify-center animate-pulse"
            style={{
              left: `${(food.pos.x / GRID_SIZE) * 100}%`,
              top: `${(food.pos.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
            }}
          >
            <div className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            <span className="absolute -top-6 text-[10px] font-bold text-rose-300 whitespace-nowrap bg-black/50 px-1 rounded">
              {food.word}
            </span>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-bold text-rose-500 mb-2">CRASHED!</h2>
            <p className="text-slate-300 mb-6">The snake was too hungry for poetry.</p>
            <button 
              onClick={reset}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      <div className="text-sm text-slate-400 font-mono italic">
        Use Arrow Keys to Move • Eat {WORDS_LIMIT} words to unleash your inner poet
      </div>
    </div>
  );
};

export default SnakeGame;
