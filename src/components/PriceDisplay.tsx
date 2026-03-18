import React from 'react';
import { AdminSettings } from '../types';

interface PriceDisplayProps {
  amount: number;
  adminSettings: AdminSettings;
  onAdminChange?: (settings: AdminSettings) => void;
  className?: string;
}

export function PriceDisplay({ amount, adminSettings, onAdminChange, className = '' }: PriceDisplayProps) {
  const isUSD = adminSettings.currency === 'USD';
  const displayAmount = isUSD ? amount / (adminSettings.usdExchangeRate || 1) : amount;
  
  const formattedPrice = new Intl.NumberFormat(isUSD ? 'en-US' : 'tr-TR', { 
    style: 'currency', 
    currency: isUSD ? 'USD' : 'TRY', 
    maximumFractionDigits: 0 
  }).format(displayAmount);

  const toggleCurrency = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdminChange) {
      onAdminChange({
        ...adminSettings,
        currency: isUSD ? 'TRY' : 'USD'
      });
    }
  };

  return (
    <span 
      className={`cursor-pointer transition-colors hover:text-indigo-600 ${className}`} 
      onClick={toggleCurrency}
      title="Para birimini değiştirmek için tıklayın"
    >
      {formattedPrice}
    </span>
  );
}
