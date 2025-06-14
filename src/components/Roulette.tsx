import { useState } from 'react';
import { RouletteNumber } from '../types/casino';
import { rouletteNumbers, spinRoulette } from '../utils/gameLogic';
import { cn } from '../utils/utils';

interface RouletteProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onWin: (amount: number) => void;
}

export const Roulette = ({ balance, onBet, onWin }: RouletteProps) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RouletteNumber | null>(null);
  const [bets, setBets] = useState<{ type: string; amount: number; numbers?: number[] }>({
    type: '',
    amount: 10,
    numbers: []
  });
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState(10);

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const placeBet = (type: string, numbers?: number[]) => {
    setBets({ type, amount: betAmount, numbers });
  };

  const spin = async () => {
    if (!bets.type) {
      alert('Please place a bet first!');
      return;
    }

    if (!onBet(bets.amount)) {
      alert('Insufficient balance!');
      return;
    }

    setSpinning(true);
    setResult(null);

    // Simulate spinning animation
    for (let i = 0; i < 20; i++) {
      setResult(spinRoulette());
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const finalResult = spinRoulette();
    setResult(finalResult);

    // Calculate winnings
    let winAmount = 0;
    
    if (bets.type === 'number' && bets.numbers?.includes(finalResult.number)) {
      winAmount = bets.amount * 36; // 35:1 payout + original bet
    } else if (bets.type === 'red' && finalResult.color === 'red') {
      winAmount = bets.amount * 2;
    } else if (bets.type === 'black' && finalResult.color === 'black') {
      winAmount = bets.amount * 2;
    } else if (bets.type === 'even' && finalResult.number % 2 === 0 && finalResult.number !== 0) {
      winAmount = bets.amount * 2;
    } else if (bets.type === 'odd' && finalResult.number % 2 === 1) {
      winAmount = bets.amount * 2;
    } else if (bets.type === 'low' && finalResult.number >= 1 && finalResult.number <= 18) {
      winAmount = bets.amount * 2;
    } else if (bets.type === 'high' && finalResult.number >= 19 && finalResult.number <= 36) {
      winAmount = bets.amount * 2;
    }

    if (winAmount > 0) {
      onWin(winAmount);
    }

    setSpinning(false);
  };

  const resetBets = () => {
    setBets({ type: '', amount: 10, numbers: [] });
    setSelectedNumbers([]);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🎯 Roulette</h2>

      {/* Wheel Display */}
      <div className="flex justify-center mb-6">
        <div className={cn(
          "w-32 h-32 rounded-full border-8 border-yellow-400 flex items-center justify-center text-4xl font-bold",
          spinning && "animate-spin",
          result?.color === 'red' && "bg-red-600 text-white",
          result?.color === 'black' && "bg-black text-white",
          result?.color === 'green' && "bg-green-600 text-white",
          !result && "bg-gray-700 text-gray-300"
        )}>
          {result ? result.number : '?'}
        </div>
      </div>

      {/* Betting Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-center gap-4">
          <label className="text-white">Bet Amount:</label>
          <select
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
            disabled={spinning}
          >
            <option value={5}>$5</option>
            <option value={10}>$10</option>
            <option value={25}>$25</option>
            <option value={50}>$50</option>
            <option value={100}>$100</option>
          </select>
        </div>

        {/* Betting Options */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => placeBet('red')}
            className={cn(
              "py-2 px-4 rounded font-bold",
              bets.type === 'red' ? "bg-red-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            )}
            disabled={spinning}
          >
            Red (2:1)
          </button>
          <button
            onClick={() => placeBet('black')}
            className={cn(
              "py-2 px-4 rounded font-bold",
              bets.type === 'black' ? "bg-gray-900 text-white border-2 border-white" : "bg-black hover:bg-gray-900 text-white"
            )}
            disabled={spinning}
          >
            Black (2:1)
          </button>
          <button
            onClick={() => placeBet('even')}
            className={cn(
              "py-2 px-4 rounded font-bold",
              bets.type === 'even' ? "bg-blue-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
            disabled={spinning}
          >
            Even (2:1)
          </button>
          <button
            onClick={() => placeBet('odd')}
            className={cn(
              "py-2 px-4 rounded font-bold",
              bets.type === 'odd' ? "bg-purple-600 text-white" : "bg-purple-500 hover:bg-purple-600 text-white"
            )}
            disabled={spinning}
          >
            Odd (2:1)
          </button>
          <button
            onClick={() => placeBet('low')}
            className={cn(
              "py-2 px-4 rounded font-bold",
              bets.type === 'low' ? "bg-green-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
            )}
            disabled={spinning}
          >
            1-18 (2:1)
          </button>
          <button
            onClick={() => placeBet('high')}
            className={cn(
              "py-2 px-4 rounded font-bold",
              bets.type === 'high' ? "bg-orange-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
            )}
            disabled={spinning}
          >
            19-36 (2:1)
          </button>
        </div>

        {/* Number Selection */}
        <div>
          <p className="text-white mb-2">Select Numbers (36:1):</p>
          <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
            {rouletteNumbers.slice(1).map((num) => (
              <button
                key={num.number}
                onClick={() => handleNumberSelect(num.number)}
                className={cn(
                  "w-8 h-8 text-xs font-bold rounded",
                  selectedNumbers.includes(num.number)
                    ? "bg-yellow-500 text-black"
                    : num.color === 'red'
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-black text-white hover:bg-gray-800 border border-gray-600"
                )}
                disabled={spinning}
              >
                {num.number}
              </button>
            ))}
          </div>
          {selectedNumbers.length > 0 && (
            <button
              onClick={() => placeBet('number', selectedNumbers)}
              className="mt-2 w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-bold"
              disabled={spinning}
            >
              Bet on Selected Numbers
            </button>
          )}
        </div>
      </div>

      {/* Current Bet Display */}
      {bets.type && (
        <div className="bg-gray-700 p-3 rounded mb-4">
          <p className="text-white">
            Current Bet: ${bets.amount} on{' '}
            {bets.type === 'number' ? `numbers ${bets.numbers?.join(', ')}` : bets.type}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={spin}
          disabled={spinning || !bets.type || balance < bets.amount}
          className={cn(
            "flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all",
            spinning || !bets.type || balance < bets.amount
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-black"
          )}
        >
          {spinning ? "SPINNING..." : "SPIN"}
        </button>
        <button
          onClick={resetBets}
          disabled={spinning}
          className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
        >
          Clear Bets
        </button>
      </div>

      {/* Result Display */}
      {result && !spinning && (
        <div className="mt-4 text-center">
          <p className="text-white text-lg">
            Result: <span className={cn(
              "font-bold",
              result.color === 'red' && "text-red-400",
              result.color === 'black' && "text-white",
              result.color === 'green' && "text-green-400"
            )}>
              {result.number} ({result.color})
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
