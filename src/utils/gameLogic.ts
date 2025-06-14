import { Card, SlotSymbol, RouletteNumber } from '../types/casino';

export const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  suits.forEach(suit => {
    values.forEach((value, index) => {
      deck.push({
        suit,
        value,
        numericValue: value === 'A' ? 11 : (index >= 10 ? 10 : index + 1)
      });
    });
  });

  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;

  hand.forEach(card => {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else {
      value += card.numericValue;
    }
  });

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

export const slotSymbols: SlotSymbol[] = [
  { symbol: '🍒', multiplier: 2 },
  { symbol: '🍋', multiplier: 3 },
  { symbol: '🍊', multiplier: 4 },
  { symbol: '🍇', multiplier: 5 },
  { symbol: '💎', multiplier: 10 },
  { symbol: '🎰', multiplier: 20 },
  { symbol: '💰', multiplier: 50 }
];

export const spinSlots = (): SlotSymbol[] => {
  return Array(3).fill(null).map(() => 
    slotSymbols[Math.floor(Math.random() * slotSymbols.length)]
  );
};

export const calculateSlotWin = (result: SlotSymbol[], bet: number): number => {
  if (result[0].symbol === result[1].symbol && result[1].symbol === result[2].symbol) {
    return bet * result[0].multiplier;
  }
  if (result[0].symbol === result[1].symbol || result[1].symbol === result[2].symbol) {
    return bet * 2;
  }
  return 0;
};

export const rouletteNumbers: RouletteNumber[] = [
  { number: 0, color: 'green' },
  ...Array.from({ length: 36 }, (_, i) => ({
    number: i + 1,
    color: ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(i + 1) ? 'red' : 'black') as 'red' | 'black'
  }))
];

export const spinRoulette = (): RouletteNumber => {
  return rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
};
