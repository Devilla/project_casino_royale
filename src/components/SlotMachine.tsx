import { useState } from 'react';
import { SlotSymbol } from '../types/casino';
import { spinSlots, calculateSlotWin } from '../utils/gameLogic';
import { cn } from '../utils/utils';

interface SlotMachineProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onWin: (amount: number) => void;
}

export const SlotMachine = ({ balance, onBet, onWin }: SlotMachineProps) => {
  const [reels, setReels] = useState<SlotSymbol[]>([
    { symbol: '🍒', multiplier: 2 },
    { symbol: '🍒', multiplier: 2 },
    { symbol: '🍒', multiplier: 2 }
  ]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState(0);

  const handleSpin = async () => {
    if (!onBet(bet)) {
      alert('Insufficient balance!');
      return;
    }

    setSpinning(true);
    setLastWin(0);

    // Simulate spinning animation
    for (let i = 0; i < 10; i++) {
      setReels(spinSlots());
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const finalResult = spinSlots();
    setReels(finalResult);
    
    const winAmount = calculateSlotWin(finalResult, bet);
    if (winAmount > 0) {
      setLastWin(winAmount);
      onWin(winAmount);
    }

    setSpinning(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🎰 Slot Machine</h2>
      
      <div className="flex justify-center mb-6">
        <div className="bg-black p-4 rounded-lg border-4 border-yellow-400">
          <div className="flex gap-2">
            {reels.map((reel, index) => (
              <div
                key={index}
                className={cn(
                  "w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl border-2 border-gray-300",
                  spinning && "animate-pulse"
                )}
              >
                {reel.symbol}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <label className="text-white">Bet:</label>
          <select
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
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

        <button
          onClick={handleSpin}
          disabled={spinning || balance < bet}
          className={cn(
            "w-full py-3 px-6 rounded-lg font-bold text-lg transition-all",
            spinning || balance < bet
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-black"
          )}
        >
          {spinning ? "SPINNING..." : "SPIN"}
        </button>

        {lastWin > 0 && (
          <div className="text-center text-green-400 font-bold text-xl animate-pulse">
            🎉 YOU WON ${lastWin}! 🎉
          </div>
        )}
      </div>
    </div>
  );
};
