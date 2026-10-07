import React, { useState } from 'react';
import { MarketItem } from '../types';
import {
  X,
  Plus,
  Trash2,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  ExternalLink,
  Check,
} from 'lucide-react';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  allMarkets: MarketItem[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  flashingSymbols: Record<string, 'up' | 'down'>;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  allMarkets,
  activeSymbol,
  onSelectSymbol,
  onOpenChart,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  flashingSymbols,
}) => {
  const [newSymbolInput, setNewSymbolInput] = useState<string>('');
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');
  const [alertCreatedToast, setAlertCreatedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const watchlistItems = watchlistSymbols
    .map((sym) => allMarkets.find((m) => m.symbol.toUpperCase() === sym.toUpperCase()))
    .filter(Boolean) as MarketItem[];

  const activeItem =
    allMarkets.find((m) => m.symbol === activeSymbol) || watchlistItems[0] || allMarkets[0];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolInput.trim()) return;
    const found = allMarkets.find(
      (m) => m.symbol.toUpperCase() === newSymbolInput.trim().toUpperCase()
    );
    if (found) {
      onAddToWatchlist(found.symbol);
      setNewSymbolInput('');
    }
  };

  const handleCreateAlert = () => {
    if (!alertTargetPrice) return;
    setAlertCreatedToast(`Price alert set for ${activeItem.symbol} @ $${alertTargetPrice}`);
    setAlertTargetPrice('');
    setTimeout(() => setAlertCreatedToast(null), 3000);
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-80 sm:w-96 flex-col border-l border-[#2a2e39] bg-[#1e222d] shadow-2xl dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white">
      {/* Dock Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#2a2e39] px-4 dark:border-[#2a2e39] light:border-[#e0e3eb]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm dark:text-white light:text-[#131722]">
            Watchlist & Details
          </span>
          <span className="rounded bg-[#2a2e39] px-1.5 py-0.5 text-[10px] font-mono text-[#b2b5be] dark:bg-[#2a2e39] light:bg-[#e0e3eb] light:text-[#131722]">
            {watchlistItems.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-[#787b86] hover:bg-[#2a2e39] hover:text-white dark:hover:bg-[#2a2e39] light:hover:bg-[#f0f3fa]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Add Symbol Input */}
      <form onSubmit={handleAdd} className="border-b border-[#2a2e39] p-3 dark:border-[#2a2e39] light:border-[#e0e3eb]">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Add symbol (e.g. NVDA, BTCUSD)..."
            value={newSymbolInput}
            onChange={(e) => setNewSymbolInput(e.target.value.toUpperCase())}
            className="w-full rounded border border-[#2a2e39] bg-[#131722] py-1.5 px-3 text-xs font-mono uppercase text-white placeholder-[#787b86] outline-none focus:border-[#2962ff] dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-[#f8f9fc] light:text-[#131722]"
          />
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded bg-[#2962ff] text-white hover:bg-[#1e4bd8]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Watchlist Items Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb]">
        {watchlistItems.map((item) => {
          const isPos = item.changePercent >= 0;
          const isSelected = item.symbol === activeSymbol;
          const flash = flashingSymbols[item.symbol];

          return (
            <div
              key={item.id}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[#2962ff]/15 border-l-2 border-[#2962ff]'
                  : 'hover:bg-[#2a2e39]/40 dark:hover:bg-[#2a2e39]/40 light:hover:bg-[#f0f3fa]'
              } ${
                flash === 'up'
                  ? 'bg-[#089981]/25'
                  : flash === 'down'
                  ? 'bg-[#f23645]/25'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white dark:text-white light:text-[#131722]">
                    {item.symbol}
                  </span>
                  <span className="text-[10px] text-[#787b86] font-mono">{item.exchange}</span>
                </div>
                <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                  {item.name}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-xs font-bold tabular-nums text-white dark:text-white light:text-[#131722]">
                    ${item.price > 100 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price}
                  </div>
                  <div
                    className={`font-mono text-[10px] font-semibold tabular-nums ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWatchlist(item.symbol);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#787b86] hover:text-[#f23645] transition-opacity"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Symbol Detail Drawer Section */}
      {activeItem && (
        <div className="border-t border-[#2a2e39] bg-[#171b26] p-4 text-xs dark:border-[#2a2e39] dark:bg-[#171b26] light:border-[#e0e3eb] light:bg-[#f8f9fc]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-extrabold text-white text-sm dark:text-white light:text-[#131722]">
                {activeItem.symbol}
              </span>
              <span className="text-[11px] text-[#787b86] ml-2">· {activeItem.name}</span>
            </div>
            <button
              onClick={() => onOpenChart(activeItem.symbol)}
              className="flex items-center gap-1 rounded bg-[#2962ff] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#1e4bd8]"
            >
              <span>Chart</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          {/* Day Range */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-[#787b86]">
              <span>Low: {activeItem.low24h}</span>
              <span>High: {activeItem.high24h}</span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-[#2a2e39] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2962ff] rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      10,
                      ((activeItem.price - activeItem.low24h) /
                        (activeItem.high24h - activeItem.low24h || 1)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Quick Price Alert Form */}
          <div className="mt-4 pt-3 border-t border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
            <span className="text-[11px] font-semibold text-[#787b86] flex items-center gap-1 mb-1.5">
              <Bell className="h-3 w-3 text-[#f59e0b]" />
              Set Price Alert
            </span>
            {alertCreatedToast ? (
              <div className="flex items-center gap-1 text-[11px] text-[#089981] font-medium bg-[#089981]/15 p-1.5 rounded">
                <Check className="h-3.5 w-3.5" />
                <span>{alertCreatedToast}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder={`Target (e.g. ${(activeItem.price * 1.05).toFixed(2)})`}
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  className="w-full rounded border border-[#2a2e39] bg-[#131722] py-1 px-2.5 text-xs font-mono text-white placeholder-[#787b86] outline-none focus:border-[#2962ff] dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-white light:text-[#131722]"
                />
                <button
                  onClick={handleCreateAlert}
                  className="rounded bg-[#2a2e39] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#363a45] whitespace-nowrap dark:bg-[#2a2e39] light:bg-[#e0e3eb] light:text-[#131722]"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
