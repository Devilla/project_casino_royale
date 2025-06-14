import { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/utils';

interface PlinkoProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onWin: (amount: number) => void;
}

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 500;
const PEG_RADIUS = 4;
const BALL_RADIUS = 6;
const ROWS = 12;
const SLOTS = 9;

const multipliers = [100, 50, 10, 5, 2, 1, 2, 5, 10, 50, 100];

export const Plinko = ({ balance, onBet, onWin }: PlinkoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [bet, setBet] = useState(10);
  const [isDropping, setIsDropping] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [totalWins, setTotalWins] = useState(0);

  const pegs = useRef<{ x: number; y: number }[]>([]);

  // Initialize pegs
  useEffect(() => {
    const pegArray = [];
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 3;
      const spacing = BOARD_WIDTH / (pegsInRow + 1);
      const y = 80 + (row * (BOARD_HEIGHT - 200) / ROWS);
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = spacing * (col + 1);
        pegArray.push({ x, y });
      }
    }
    pegs.current = pegArray;
  }, []);

  const drawBoard = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Draw pegs
    ctx.fillStyle = '#fbbf24';
    pegs.current.forEach(peg => {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw slots at bottom
    const slotWidth = BOARD_WIDTH / SLOTS;
    for (let i = 0; i < SLOTS; i++) {
      const x = i * slotWidth;
      const multiplier = multipliers[i];
      
      // Slot background
      ctx.fillStyle = multiplier >= 10 ? '#dc2626' : multiplier >= 5 ? '#ea580c' : multiplier >= 2 ? '#ca8a04' : '#16a34a';
      ctx.fillRect(x, BOARD_HEIGHT - 60, slotWidth - 2, 60);
      
      // Slot text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${multiplier}x`, x + slotWidth / 2, BOARD_HEIGHT - 35);
    }

    // Draw balls
    balls.forEach(ball => {
      if (ball.active) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const updateBalls = () => {
    setBalls(prevBalls => {
      const updatedBalls = prevBalls.map(ball => {
        if (!ball.active) return ball;

        let newX = ball.x + ball.vx;
        let newY = ball.y + ball.vy;
        let newVx = ball.vx;
        let newVy = ball.vy + 0.3; // gravity

        // Check collision with pegs
        pegs.current.forEach(peg => {
          const dx = newX - peg.x;
          const dy = newY - peg.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < PEG_RADIUS + BALL_RADIUS) {
            // Bounce off peg
            const angle = Math.atan2(dy, dx);
            newVx = Math.cos(angle) * 2 + (Math.random() - 0.5) * 2;
            newVy = Math.abs(Math.sin(angle) * 2) + 1;
            
            // Move ball away from peg
            newX = peg.x + Math.cos(angle) * (PEG_RADIUS + BALL_RADIUS + 1);
            newY = peg.y + Math.sin(angle) * (PEG_RADIUS + BALL_RADIUS + 1);
          }
        });

        // Bounce off walls
        if (newX < BALL_RADIUS || newX > BOARD_WIDTH - BALL_RADIUS) {
          newVx = -newVx * 0.8;
          newX = Math.max(BALL_RADIUS, Math.min(BOARD_WIDTH - BALL_RADIUS, newX));
        }

        // Check if ball reached bottom
        if (newY > BOARD_HEIGHT - 60) {
          const slotIndex = Math.floor(newX / (BOARD_WIDTH / SLOTS));
          const clampedSlotIndex = Math.max(0, Math.min(SLOTS - 1, slotIndex));
          const multiplier = multipliers[clampedSlotIndex];
          const winAmount = bet * multiplier;
          
          setLastWin(winAmount);
          setTotalWins(prev => prev + winAmount);
          onWin(winAmount);
          
          return { ...ball, active: false };
        }

        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx * 0.99, // friction
          vy: newVy
        };
      });

      // Remove inactive balls after some time
      return updatedBalls.filter(ball => ball.active || ball.y < BOARD_HEIGHT + 100);
    });
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    updateBalls();
    drawBoard(ctx);

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balls]);

  const dropBall = () => {
    if (!onBet(bet)) {
      alert('Insufficient balance!');
      return;
    }

    setIsDropping(true);
    setLastWin(0);

    const newBall: Ball = {
      id: Date.now(),
      x: BOARD_WIDTH / 2 + (Math.random() - 0.5) * 20,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 1,
      active: true
    };

    setBalls(prev => [...prev, newBall]);

    // Reset dropping state after ball settles
    setTimeout(() => {
      setIsDropping(false);
    }, 3000);
  };

  const dropMultipleBalls = async () => {
    const ballCount = 5;
    const totalBet = bet * ballCount;

    if (!onBet(totalBet)) {
      alert('Insufficient balance!');
      return;
    }

    setIsDropping(true);
    setLastWin(0);
    setTotalWins(0);

    for (let i = 0; i < ballCount; i++) {
      const newBall: Ball = {
        id: Date.now() + i,
        x: BOARD_WIDTH / 2 + (Math.random() - 0.5) * 40,
        y: 20,
        vx: (Math.random() - 0.5) * 2,
        vy: 1,
        active: true
      };

      setBalls(prev => [...prev, newBall]);
      
      if (i < ballCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setTimeout(() => {
      setIsDropping(false);
    }, 5000);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🎯 Plinko</h2>

      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          className="border-2 border-yellow-400 rounded-lg bg-gray-900"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <label className="text-white">Bet per Ball:</label>
          <select
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
            disabled={isDropping}
          >
            <option value={5}>$5</option>
            <option value={10}>$10</option>
            <option value={25}>$25</option>
            <option value={50}>$50</option>
            <option value={100}>$100</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={dropBall}
            disabled={isDropping || balance < bet}
            className={cn(
              "flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all",
              isDropping || balance < bet
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            Drop Ball (${bet})
          </button>
          <button
            onClick={dropMultipleBalls}
            disabled={isDropping || balance < bet * 5}
            className={cn(
              "flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all",
              isDropping || balance < bet * 5
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            )}
          >
            Drop 5 Balls (${bet * 5})
          </button>
        </div>

        {lastWin > 0 && (
          <div className="text-center text-green-400 font-bold text-xl animate-pulse">
            🎉 Last Win: ${lastWin}! 🎉
          </div>
        )}

        {totalWins > 0 && balls.filter(b => b.active).length === 0 && !isDropping && (
          <div className="text-center text-yellow-400 font-bold text-lg">
            Total Round Winnings: ${totalWins}
          </div>
        )}

        <div className="bg-gray-700 p-3 rounded">
          <h3 className="text-white font-bold mb-2">Multipliers:</h3>
          <div className="grid grid-cols-11 gap-1 text-center text-sm">
            {multipliers.map((mult, index) => (
              <div
                key={index}
                className={cn(
                  "py-1 px-1 rounded font-bold",
                  mult >= 10 ? "bg-red-600 text-white" : 
                  mult >= 5 ? "bg-orange-600 text-white" : 
                  mult >= 2 ? "bg-yellow-600 text-black" : "bg-green-600 text-white"
                )}
              >
                {mult}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
