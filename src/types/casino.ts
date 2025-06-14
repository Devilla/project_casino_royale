export interface GameResult {
  win: boolean;
  amount: number;
  message: string;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numericValue: number;
}

export interface SlotSymbol {
  symbol: string;
  multiplier: number;
}

export interface RouletteNumber {
  number: number;
  color: 'red' | 'black' | 'green';
}
