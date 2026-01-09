
import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import { WORDS_LIMIT } from './constants';
import SnakeGame from './components/SnakeGame';
import { generatePoem, remixPoem, generatePoemImage } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [poem, setPoem] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [remixText, setRemixText] = useState('');

  const handleWordCollected = (word: string) => {
    setCollectedWords(prev => {
      const newList = [...prev, word];
      if (newList.length === WORDS_LIMIT) {
        setGameState(GameState.POEM_GENERATION);
        handleGeneratePoem(newList);
      }
      return newList;
    });
  };

  const handleGeneratePoem = async (words: string[]) => {
    setLoading(true);
    try {
      const result = await generatePoem(words);
      setPoem(result);
    } catch (error) {
      console.error(error);
      setPoem("A technical glitch in the verse...");
    } finally {
      setLoading(false);
    }
  };

  const handleRemix = async () => {
    if (!remixText) return;
    setLoading(true);
    try {
      const result = await remixPoem(poem, remixText);
      setPoem(result);
      setRemixText('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setGameState(GameState.IMAGE_GENERATION);
    setLoading(true);
    try {
      const url = await generatePoemImage(poem);
      setImageUrl(url);
      setGameState(GameState.FINISHED);
    } catch (error) {
      console.error(error);
      setGameState(GameState.POEM_GENERATION);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameState(GameState.START);
    setCollectedWords([]);
    setPoem('');
    setImageUrl('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gradient-to-b from-slate-950 to-slate-900 overflow-x-hidden">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          SNAKE POET
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Eat the words. Paint the verse.</p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Game Area */}
        <div className="md:col-span-7 flex flex-col items-center">
          {gameState === GameState.START && (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Ready to collect some words?</h2>
              <p className="text-slate-400 mb-8 max-w-sm">
                Control the snake to devour 8 mystical words. Once the feast is over, the AI will weave them into a poem.
              </p>
              <button 
                onClick={() => setGameState(GameState.PLAYING)}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                START GAME
              </button>
            </div>
          )}

          {gameState === GameState.PLAYING && (
            <SnakeGame 
              onWordCollected={handleWordCollected} 
              collectedCount={collectedWords.length} 
            />
          )}

          {(gameState === GameState.POEM_GENERATION || gameState === GameState.IMAGE_GENERATION || gameState === GameState.FINISHED) && (
            <div className="w-full bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-sm animate-in fade-in duration-700">
              {loading && gameState === GameState.IMAGE_GENERATION ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-emerald-400 font-mono animate-pulse">Visualizing your poem...</p>
                </div>
              ) : imageUrl ? (
                <div className="space-y-6">
                  <div className="relative group overflow-hidden rounded-xl">
                    <img src={imageUrl} alt="AI Generated Verse" className="w-full aspect-square object-cover shadow-2xl" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={resetGame}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
                    >
                      New Story
                    </button>
                    <a 
                      href={imageUrl} 
                      download="poem-art.png"
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-center rounded-lg font-bold transition-colors"
                    >
                      Save Art
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-emerald-400 font-mono">Channeling the muses...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Collection & Poem */}
        <div className="md:col-span-5 space-y-6">
          {/* Word Box */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex justify-between">
              Collected Words
              <span>{collectedWords.length} / {WORDS_LIMIT}</span>
            </h3>
            <div className="flex flex-wrap gap-2 min-h-[100px]">
              {collectedWords.length === 0 && (
                <p className="text-slate-600 text-sm italic">The box is empty. Start eating!</p>
              )}
              {collectedWords.map((word, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 bg-slate-800 text-emerald-400 border border-emerald-900/30 rounded-md text-sm font-mono animate-in zoom-in"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>

          {/* Poem Area */}
          {(poem || loading) && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg animate-in slide-in-from-right duration-500">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">The Verse</h3>
              {loading && !poem ? (
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-slate-800 rounded w-2/3 animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <blockquote className="text-lg font-serif italic text-slate-200 border-l-2 border-emerald-500 pl-4 whitespace-pre-wrap leading-relaxed">
                    {poem}
                  </blockquote>
                  
                  {gameState === GameState.POEM_GENERATION && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={remixText}
                          onChange={(e) => setRemixText(e.target.value)}
                          placeholder="Make it darker, happier, a haiku..."
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button 
                          onClick={handleRemix}
                          disabled={loading}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          Remix
                        </button>
                      </div>
                      <button 
                        onClick={handleGenerateImage}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                      >
                        CREATE IMAGE ART
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
