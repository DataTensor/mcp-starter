import React from 'react';
import { MarketItem } from '../types';

interface TickerTapeProps {
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
  flashingSymbols?: Record<string, 'up' | 'down'>;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  markets,
  onSelectSymbol,
  flashingSymbols = {},
}) => {
  // Take top major benchmarks for ticker tape
  const tapeItems = markets.slice(0, 16);
  // Duplicate for seamless infinite scroll
  const duplicated = [...tapeItems, ...tapeItems];

  return (
    <div className="relative w-full overflow-hidden border-b border-[#2a2e39] bg-[#171b26] py-1.5 dark:border-[#2a2e39] dark:bg-[#171b26] light:border-[#e0e3eb] light:bg-[#f8f9fc]">
      <div className="flex animate-ticker hover:[animation-play-state:paused]">
        {duplicated.map((item, idx) => {
          const isPositive = item.changePercent >= 0;
          const flash = flashingSymbols[item.symbol];

          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`flex items-center gap-2 border-r border-[#2a2e39]/60 px-4 py-0.5 text-xs transition-colors hover:bg-[#1e222d] dark:border-[#2a2e39]/60 dark:hover:bg-[#1e222d] light:border-[#e0e3eb] light:hover:bg-[#f0f3fa] ${
                flash === 'up'
                  ? 'bg-[#089981]/25 text-[#089981]'
                  : flash === 'down'
                  ? 'bg-[#f23645]/25 text-[#f23645]'
                  : ''
              }`}
            >
              <span className="font-bold tracking-tight text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">
                {item.symbol}
              </span>
              <span className="font-mono tabular-nums text-[#b2b5be] dark:text-[#b2b5be] light:text-[#434651]">
                {item.price > 100 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price}
              </span>
              <span
                className={`font-mono text-[11px] font-semibold tabular-nums ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPositive ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
