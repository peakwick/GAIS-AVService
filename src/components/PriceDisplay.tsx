import React from 'react';
import { AdminSettings, GeneralSettings } from '../types';

interface PriceDisplayProps {
  amount: number;
  adminSettings: AdminSettings;
  generalSettings: GeneralSettings;
  onAdminChange?: (settings: AdminSettings) => void;
  onGeneralChange?: (settings: GeneralSettings) => void;
  className?: string;
}

export function PriceDisplay({ amount, adminSettings, generalSettings, onAdminChange, onGeneralChange, className = '' }: PriceDisplayProps) {
  const isUSD = generalSettings.currency === 'USD';
  const displayAmount = isUSD ? amount / (generalSettings.usdExchangeRate || 1) : amount;
  
  const formattedPrice = new Intl.NumberFormat(isUSD ? 'en-US' : 'tr-TR', { 
    style: 'currency', 
    currency: isUSD ? 'USD' : 'TRY', 
    maximumFractionDigits: 0 
  }).format(displayAmount);

  const toggleCurrency = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGeneralChange) {
      onGeneralChange({
        ...generalSettings,
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
