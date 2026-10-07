import React, { useState, useEffect } from 'react';
import { MarketItem, AssetClass } from '../types';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
}

export const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({
  isOpen,
  onClose,
  markets,
  onSelectSymbol,
}) => {
  const [query, setQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<AssetClass>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal handled in parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = markets.filter((m) => {
    if (filterClass !== 'all' && m.assetClass !== filterClass) return false;
    if (!query) return true;
    return (
      m.symbol.toLowerCase().includes(query.toLowerCase()) ||
      m.name.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleSelect = (symbol: string) => {
    onSelectSymbol(symbol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[#2a2e39] bg-[#1e222d] shadow-2xl overflow-hidden dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#2a2e39] px-4 py-3 dark:border-[#2a2e39] light:border-[#e0e3eb]">
          <Search className="h-5 w-5 text-[#787b86] shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search symbol, currency pair, stock, or index..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm font-medium text-white placeholder-[#787b86] outline-none dark:text-white light:text-[#131722]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[#787b86] hover:bg-[#2a2e39] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#2a2e39] px-4 py-2 text-xs dark:border-[#2a2e39] light:border-[#e0e3eb]">
          {(['all', 'stocks', 'crypto', 'forex', 'indices', 'futures', 'bonds'] as AssetClass[]).map(
            (c) => (
              <button
                key={c}
                onClick={() => setFilterClass(c)}
                className={`whitespace-nowrap rounded px-2.5 py-1 font-semibold uppercase text-[10px] transition-colors ${
                  filterClass === c
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] dark:hover:bg-[#2a2e39] light:hover:bg-[#f0f3fa]'
                }`}
              >
                {c}
              </button>
            )
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#787b86]">
              No instruments match "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isPos = item.changePercent >= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.symbol)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#2962ff]/15'
                      : 'hover:bg-[#2a2e39]/40 dark:hover:bg-[#2a2e39]/40 light:hover:bg-[#f0f3fa]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-7 w-7 rounded flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: item.brandColor || '#2962ff' }}
                    >
                      {item.logoText.slice(0, 3)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white dark:text-white light:text-[#131722]">
                          {item.symbol}
                        </span>
                        <span className="rounded bg-[#2a2e39] px-1.5 py-0.2 text-[10px] font-mono text-[#b2b5be] dark:bg-[#2a2e39] light:bg-[#e0e3eb] light:text-[#131722]">
                          {item.exchange}
                        </span>
                        <span className="text-[10px] text-[#787b86] capitalize">
                          {item.assetClass}
                        </span>
                      </div>
                      <div className="text-xs text-[#787b86]">{item.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-white dark:text-white light:text-[#131722]">
                        ${item.price > 100 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price}
                      </div>
                      <div
                        className={`font-mono text-xs font-semibold ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <CornerDownLeft className="h-4 w-4 text-[#787b86] opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Key Hints */}
        <div className="border-t border-[#2a2e39] bg-[#171b26] px-4 py-2 text-[11px] text-[#787b86] flex justify-between dark:border-[#2a2e39] dark:bg-[#171b26] light:border-[#e0e3eb] light:bg-[#f8f9fc]">
          <span>Select an asset to view real-time charts & financials</span>
          <span className="flex items-center gap-1 font-mono">
            ESC to close
          </span>
        </div>
      </div>
    </div>
  );
};
