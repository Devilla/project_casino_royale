import { useState } from 'react';
import { SlotMachine } from './components/SlotMachine';
import { Blackjack } from './components/Blackjack';
import { Roulette } from './components/Roulette';
import { Plinko } from './components/Plinko';
import { cn } from './utils/utils';

type GameType = 'slots' | 'blackjack' | 'roulette' | 'plinko';

function App() {
  const [balance, setBalance] = useState(1000);
  const [currentGame, setCurrentGame] = useState<GameType>('slots');

  const handleBet = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  const handleWin = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const addFunds = () => {
    setBalance(prev => prev + 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">🎰 Casino Royale 🎰</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-green-600 px-4 py-2 rounded-lg">
              <span className="text-white font-bold">Balance: ${balance}</span>
            </div>
            <button
              onClick={addFunds}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold"
            >
              Add $500
            </button>
          </div>
        </div>

        {/* Game Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
            <div className="flex gap-2">
              {[
                { id: 'slots', label: '🎰 Slots', color: 'yellow' },
                { id: 'blackjack', label: '🃏 Blackjack', color: 'green' },
                { id: 'roulette', label: '🎯 Roulette', color: 'red' },
                { id: 'plinko', label: '🎯 Plinko', color: 'purple' }
              ].map(game => (
                <button
                  key={game.id}
                  onClick={() => setCurrentGame(game.id as GameType)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold transition-all",
                    currentGame === game.id
                      ? game.color === 'yellow' ? "bg-yellow-500 text-black"
                      : game.color === 'green' ? "bg-green-600 text-white"
                      : game.color === 'red' ? "bg-red-600 text-white"
                      : "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  {game.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex justify-center">
          {currentGame === 'slots' && (
            <SlotMachine balance={balance} onBet={handleBet} onWin={handleWin} />
          )}
          {currentGame === 'blackjack' && (
            <Blackjack balance={balance} onBet={handleBet} onWin={handleWin} />
          )}
          {currentGame === 'roulette' && (
            <Roulette balance={balance} onBet={handleBet} onWin={handleWin} />
          )}
          {currentGame === 'plinko' && (
            <Plinko balance={balance} onBet={handleBet} onWin={handleWin} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>🎲 Good luck and gamble responsibly! 🎲</p>
        </div>
      </div>
    </div>
  );
}

export default App;
