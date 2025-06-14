import { useState, useCallback } from 'react';

export const useWallet = (initialBalance: number = 1000) => {
  const [balance, setBalance] = useState(initialBalance);

  const placeBet = useCallback((amount: number): boolean => {
    if (amount <= balance) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  }, [balance]);

  const addWinnings = useCallback((amount: number) => {
    setBalance(prev => prev + amount);
  }, []);

  const resetBalance = useCallback(() => {
    setBalance(initialBalance);
  }, [initialBalance]);

  return {
    balance,
    placeBet,
    addWinnings,
    resetBalance
  };
};
