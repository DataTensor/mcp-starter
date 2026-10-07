import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Bookmark, TrendingUp, SlidersHorizontal, BarChart3, Newspaper, Grid3X3, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  watchlistCount: number;
  isWatchlistOpen: boolean;
  setIsWatchlistOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  portfolioBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  watchlistCount,
  isWatchlistOpen,
  setIsWatchlistOpen,
  portfolioBalance,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'America/New_York',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'chart', label: 'Supercharts', icon: BarChart3 },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'heatmap', label: 'Heatmap', icon: Grid3X3 },
    { id: 'screener', label: 'Screener', icon: SlidersHorizontal },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2e39]/80 bg-[#131722]/95 backdrop-blur-md dark:border-[#2a2e39]/80 dark:bg-[#131722]/95 light:border-[#e0e3eb] light:bg-white/95">
      {/* Main Bar */}
      <div className="mx-auto flex h-14 max-w-[1720px] items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand & Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left text-[#d1d4dc] transition-opacity hover:opacity-90 dark:text-[#d1d4dc] light:text-[#131722]"
          >
            {/* TradingView Iconic Geometric Glyph */}
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#2962ff] shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 14.5L9.5 9L14.5 14L20 8.5"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="8.5" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white dark:text-white light:text-[#131722]">
              TradingView
            </span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="group flex h-9 w-44 items-center gap-2 rounded border border-[#2a2e39] bg-[#1e222d] px-2.5 text-xs text-[#787b86] transition-colors hover:border-[#2962ff]/50 hover:text-[#d1d4dc] sm:w-64 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-[#f0f3fa] light:hover:border-[#2962ff]"
          >
            <Search className="h-3.5 w-3.5 text-[#787b86] group-hover:text-[#2962ff]" />
            <span className="truncate">Search markets, stocks, crypto...</span>
            <kbd className="ml-auto hidden rounded border border-[#363a45] bg-[#131722] px-1.5 py-0.5 text-[10px] font-medium text-[#787b86] md:inline-block dark:border-[#363a45] dark:bg-[#131722] light:border-[#d1d4dc] light:bg-white">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors rounded ${
                  isActive
                    ? 'text-[#2962ff] bg-[#2962ff]/10 dark:text-[#2962ff] dark:bg-[#2962ff]/10 light:text-[#2962ff] light:bg-[#2962ff]/10'
                    : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d]/60 dark:text-[#787b86] dark:hover:text-[#d1d4dc] light:text-[#787b86] light:hover:text-[#131722] light:hover:bg-[#f0f3fa]'
                }`}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#2962ff] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Market Status, Theme, Balance, & Watchlist Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* NY Market Status Clock */}
          <div className="hidden items-center gap-2 border-r border-[#2a2e39] pr-3 text-xs md:flex dark:border-[#2a2e39] light:border-[#e0e3eb]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#089981] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#089981]"></span>
            </span>
            <span className="font-medium text-[#787b86] text-[11px]">
              NYSE Open <span className="font-mono text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#131722]">{timeStr} EDT</span>
            </span>
          </div>

          {/* Simulated Paper Trading Balance */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] text-[11px] font-mono text-[#d1d4dc] dark:bg-[#1e222d] dark:border-[#2a2e39] light:bg-[#f0f3fa] light:border-[#e0e3eb] light:text-[#131722]">
            <DollarSign className="w-3 h-3 text-[#089981]" />
            <span>${portfolioBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#2a2e39] bg-[#1e222d] text-[#787b86] transition-colors hover:text-[#d1d4dc] dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-[#f0f3fa] light:text-[#131722]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Watchlist Toggle */}
          <button
            onClick={() => setIsWatchlistOpen((prev: boolean) => !prev)}
            className={`flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-semibold transition-colors ${
              isWatchlistOpen
                ? 'border-[#2962ff] bg-[#2962ff]/15 text-[#2962ff]'
                : 'border-[#2a2e39] bg-[#1e222d] text-[#d1d4dc] hover:border-[#363a45] dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-[#f0f3fa] light:text-[#131722]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Watchlist</span>
            <span className="rounded bg-[#2a2e39] px-1 py-0.2 text-[10px] font-mono font-bold dark:bg-[#2a2e39] light:bg-[#e0e3eb]">
              {watchlistCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex overflow-x-auto border-t border-[#2a2e39]/60 px-4 py-1.5 scrollbar-none xl:hidden dark:border-[#2a2e39]/60 light:border-[#e0e3eb]">
        <div className="flex gap-1">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:bg-[#1e222d] hover:text-[#d1d4dc]'
                }`}
              >
                {item.icon && <item.icon className="h-3 w-3" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
