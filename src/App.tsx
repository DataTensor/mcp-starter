import React, { useState, useEffect } from 'react';
import { INITIAL_MARKETS } from './data/mockMarkets';
import { MarketItem, AssetClass } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { TickerTape } from './components/TickerTape';
import { MarketPulseOverview } from './components/MarketPulseOverview';
import { InteractiveTradingViewChart } from './components/InteractiveTradingViewChart';
import { SectorsHeatmap } from './components/SectorsHeatmap';
import { MarketScreener } from './components/MarketScreener';
import { MarketNews } from './components/MarketNews';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { AssetClassScreen } from './components/AssetClassScreen';

export default function App() {
  const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKETS);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeSymbol, setActiveSymbol] = useState<string>('NVDA');
  const [watchlist, setWatchlist] = useState<string[]>([
    'SPX',
    'NDX',
    'NVDA',
    'AAPL',
    'MSFT',
    'BTCUSD',
    'ETHUSD',
    'XAUUSD',
    'CL1!',
  ]);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [portfolioBalance, setPortfolioBalance] = useState<number>(100000);
  const [flashingSymbols, setFlashingSymbols] = useState<Record<string, 'up' | 'down'>>({});

  // Real-time market tick simulation engine
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 2 random symbols to tick
      const idx1 = Math.floor(Math.random() * markets.length);
      const idx2 = Math.floor(Math.random() * markets.length);
      const targets = [idx1, idx2];

      const newFlashes: Record<string, 'up' | 'down'> = {};

      setMarkets((prev) => {
        return prev.map((item, idx) => {
          if (!targets.includes(idx)) return item;

          const changeFactor = (Math.random() - 0.49) * 0.003;
          const oldPrice = item.price;
          const newPrice = Number(Math.max(0.01, oldPrice * (1 + changeFactor)).toFixed(oldPrice > 100 ? 2 : 4));
          const diff = Number((newPrice - oldPrice).toFixed(4));
          const isUp = diff >= 0;

          newFlashes[item.symbol] = isUp ? 'up' : 'down';

          const newPct = Number((item.changePercent + (diff / oldPrice) * 100).toFixed(2));
          const newHigh = Math.max(item.high24h, newPrice);
          const newLow = Math.min(item.low24h, newPrice);

          // Update last candle close
          const newCandles = [...item.candles];
          if (newCandles.length > 0) {
            const lastCandle = { ...newCandles[newCandles.length - 1] };
            lastCandle.close = newPrice;
            lastCandle.high = Math.max(lastCandle.high, newPrice);
            lastCandle.low = Math.min(lastCandle.low, newPrice);
            newCandles[newCandles.length - 1] = lastCandle;
          }

          return {
            ...item,
            price: newPrice,
            change: Number((item.change + diff).toFixed(2)),
            changePercent: newPct,
            high24h: newHigh,
            low24h: newLow,
            candles: newCandles,
            sparkline: [...item.sparkline.slice(1), newPrice],
          };
        });
      });

      setFlashingSymbols(newFlashes);
      setTimeout(() => {
        setFlashingSymbols({});
      }, 700);
    }, 2800);

    return () => clearInterval(interval);
  }, [markets.length]);

  // Handle Hotkey ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSymbol = (symbol: string) => {
    setActiveSymbol(symbol);
  };

  const handleOpenChart = (symbol: string) => {
    setActiveSymbol(symbol);
    setActiveTab('chart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist((prev) => [...prev, symbol]);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  const handleExecuteTrade = ({
    type,
    quantity,
    price,
  }: {
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
  }) => {
    const total = quantity * price;
    if (type === 'buy') {
      setPortfolioBalance((prev) => Math.max(0, prev - total));
    } else {
      setPortfolioBalance((prev) => prev + total);
    }
  };

  const activeMarketItem =
    markets.find((m) => m.symbol === activeSymbol) || markets[0];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#131722] text-[#d1d4dc] dark:bg-[#131722] dark:text-[#d1d4dc] light:bg-[#ffffff] light:text-[#131722] font-sans flex flex-col">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          watchlistCount={watchlist.length}
          isWatchlistOpen={isWatchlistOpen}
          setIsWatchlistOpen={setIsWatchlistOpen}
          portfolioBalance={portfolioBalance}
        />

        {/* Global Continuous Ticker Tape */}
        <TickerTape
          markets={markets}
          onSelectSymbol={(sym) => {
            handleSelectSymbol(sym);
            handleOpenChart(sym);
          }}
          flashingSymbols={flashingSymbols}
        />

        {/* Main Content Area */}
        <main className="flex-1 mx-auto w-full max-w-[1720px] px-4 sm:px-6 py-6">
          {activeTab === 'overview' && (
            <MarketPulseOverview
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'chart' && (
            <InteractiveTradingViewChart
              item={activeMarketItem}
              portfolioBalance={portfolioBalance}
              onExecuteTrade={handleExecuteTrade}
            />
          )}

          {activeTab === 'stocks' && (
            <AssetClassScreen
              assetClass="stocks"
              title="Equities & Stocks"
              subtitle="Major corporate equities, market capitalization leaders, semiconductor, software, and consumer growth stocks"
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'crypto' && (
            <AssetClassScreen
              assetClass="crypto"
              title="Cryptocurrency & Digital Assets"
              subtitle="Bitcoin, Ethereum, layer-1 blockchains, spot ETF volumes, and crypto dominance overview"
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'forex' && (
            <AssetClassScreen
              assetClass="forex"
              title="Currencies & Forex"
              subtitle="Global foreign exchange rates, major currency pairs, pip fluctuations, and central bank divergence"
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'indices' && (
            <AssetClassScreen
              assetClass="indices"
              title="Global Market Indices"
              subtitle="Benchmark market indices across the Americas, Europe, and Asia-Pacific equity centers"
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'futures' && (
            <AssetClassScreen
              assetClass="futures"
              title="Futures & Commodities"
              subtitle="Energy, precious metals, industrial materials, and agricultural commodity futures contracts"
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'bonds' && (
            <AssetClassScreen
              assetClass="bonds"
              title="Government Bonds & Sovereign Rates"
              subtitle="US Treasury yield curve, German bunds, sovereign debt instruments, and monetary policy rate expectations"
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'heatmap' && (
            <SectorsHeatmap
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'screener' && (
            <MarketScreener
              markets={markets}
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}

          {activeTab === 'news' && (
            <MarketNews
              onSelectSymbol={handleSelectSymbol}
              onOpenChart={handleOpenChart}
            />
          )}
        </main>

        {/* Collapsible Watchlist Sidebar Dock */}
        <WatchlistSidebar
          isOpen={isWatchlistOpen}
          onClose={() => setIsWatchlistOpen(false)}
          watchlistSymbols={watchlist}
          allMarkets={markets}
          activeSymbol={activeSymbol}
          onSelectSymbol={handleSelectSymbol}
          onOpenChart={handleOpenChart}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          flashingSymbols={flashingSymbols}
        />

        {/* Global Symbol Search Modal */}
        <SymbolSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          markets={markets}
          onSelectSymbol={(sym) => {
            handleSelectSymbol(sym);
            handleOpenChart(sym);
          }}
        />

        {/* Financial Terminal Footer */}
        <footer className="mt-auto border-t border-[#2a2e39] bg-[#171b26] py-6 text-xs text-[#787b86] dark:border-[#2a2e39] dark:bg-[#171b26] light:border-[#e0e3eb] light:bg-[#f8f9fc]">
          <div className="mx-auto max-w-[1720px] px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#2962ff]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M4 14.5L9.5 9L14.5 14L20 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold text-white dark:text-white light:text-[#131722]">TradingView Markets</span>
              <span>·</span>
              <span>Global Financial Analytics & Charts</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Market Data: Continuous Feed</span>
              <span>·</span>
              <span>Paper Trading Simulator</span>
              <span>·</span>
              <span>Quotes Delay: Real-time</span>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
