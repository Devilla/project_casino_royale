import { useState } from 'react';
import { Card } from '../types/casino';
import { createDeck, calculateHandValue } from '../utils/gameLogic';
import { cn } from '../utils/utils';

interface BlackjackProps {
  balance: number;
  onBet: (amount: number) => boolean;
  onWin: (amount: number) => void;
}

export const Blackjack = ({ balance, onBet, onWin }: BlackjackProps) => {
  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'finished'>('betting');
  const [bet, setBet] = useState(25);
  const [message, setMessage] = useState('');
  const [showDealerCard, setShowDealerCard] = useState(false);

  const getCardSymbol = (suit: Card['suit']) => {
    const symbols = { hearts: '♥️', diamonds: '♦️', clubs: '♣️', spades: '♠️' };
    return symbols[suit];
  };

  const dealCard = (currentDeck: Card[]): [Card, Card[]] => {
    const newDeck = [...currentDeck];
    const card = newDeck.pop()!;
    return [card, newDeck];
  };

  const startGame = () => {
    if (!onBet(bet)) {
      alert('Insufficient balance!');
      return;
    }

    const newDeck = createDeck();
    const [playerCard1, deck1] = dealCard(newDeck);
    const [dealerCard1, deck2] = dealCard(deck1);
    const [playerCard2, deck3] = dealCard(deck2);
    const [dealerCard2, finalDeck] = dealCard(deck3);

    setDeck(finalDeck);
    setPlayerHand([playerCard1, playerCard2]);
    setDealerHand([dealerCard1, dealerCard2]);
    setGameState('playing');
    setMessage('');
    setShowDealerCard(false);

    if (calculateHandValue([playerCard1, playerCard2]) === 21) {
      setGameState('finished');
      setShowDealerCard(true);
      if (calculateHandValue([dealerCard1, dealerCard2]) === 21) {
        setMessage('Push! Both have blackjack');
        onWin(bet);
      } else {
        setMessage('Blackjack! You win!');
        onWin(bet * 2.5);
      }
    }
  };

  const hit = () => {
    const [newCard, newDeck] = dealCard(deck);
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (calculateHandValue(newHand) > 21) {
      setGameState('finished');
      setShowDealerCard(true);
      setMessage('Bust! You lose');
    }
  };

  const stand = () => {
    setGameState('dealer');
    setShowDealerCard(true);
    dealerPlay();
  };

  const dealerPlay = () => {
    let currentDeck = [...deck];
    let currentDealerHand = [...dealerHand];

    while (calculateHandValue(currentDealerHand) < 17) {
      const [newCard, newDeck] = dealCard(currentDeck);
      currentDealerHand.push(newCard);
      currentDeck = newDeck;
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(currentDealerHand);

    if (dealerValue > 21) {
      setMessage('Dealer busts! You win!');
      onWin(bet * 2);
    } else if (dealerValue > playerValue) {
      setMessage('Dealer wins!');
    } else if (playerValue > dealerValue) {
      setMessage('You win!');
      onWin(bet * 2);
    } else {
      setMessage('Push!');
      onWin(bet);
    }

    setGameState('finished');
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setMessage('');
    setShowDealerCard(false);
  };

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🃏 Blackjack</h2>

      <div className="space-y-6">
        {/* Dealer Hand */}
        <div>
          <h3 className="text-white mb-2">
            Dealer {showDealerCard ? `(${dealerValue})` : ''}
          </h3>
          <div className="flex gap-2">
            {dealerHand.map((card, index) => (
              <div
                key={index}
                className={cn(
                  "w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center text-sm font-bold",
                  (index === 1 && !showDealerCard)
                    ? "bg-blue-900 border-blue-700 text-blue-300"
                    : card.suit === 'hearts' || card.suit === 'diamonds'
                    ? "bg-white border-gray-300 text-red-600"
                    : "bg-white border-gray-300 text-black"
                )}
              >
                {index === 1 && !showDealerCard ? (
                  '🂠'
                ) : (
                  <>
                    <span>{card.value}</span>
                    <span>{getCardSymbol(card.suit)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div>
          <h3 className="text-white mb-2">
            You {playerHand.length > 0 ? `(${playerValue})` : ''}
          </h3>
          <div className="flex gap-2">
            {playerHand.map((card, index) => (
              <div
                key={index}
                className={cn(
                  "w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center text-sm font-bold",
                  card.suit === 'hearts' || card.suit === 'diamonds'
                    ? "bg-white border-gray-300 text-red-600"
                    : "bg-white border-gray-300 text-black"
                )}
              >
                <span>{card.value}</span>
                <span>{getCardSymbol(card.suit)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {gameState === 'betting' && (
            <>
              <div className="flex items-center justify-center gap-4">
                <label className="text-white">Bet:</label>
                <select
                  value={bet}
                  onChange={(e) => setBet(Number(e.target.value))}
                  className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
                >
                  <option value={10}>$10</option>
                  <option value={25}>$25</option>
                  <option value={50}>$50</option>
                  <option value={100}>$100</option>
                </select>
              </div>
              <button
                onClick={startGame}
                disabled={balance < bet}
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-bold text-lg transition-all",
                  balance < bet
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                Deal Cards
              </button>
            </>
          )}

          {gameState === 'playing' && (
            <div className="flex gap-4">
              <button
                onClick={hit}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                Hit
              </button>
              <button
                onClick={stand}
                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                Stand
              </button>
            </div>
          )}

          {gameState === 'finished' && (
            <button
              onClick={resetGame}
              className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-bold"
            >
              New Game
            </button>
          )}
        </div>

        {message && (
          <div className={cn(
            "text-center font-bold text-xl",
            message.includes('win') || message.includes('Blackjack') ? "text-green-400" : "text-red-400"
          )}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
