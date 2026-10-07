import React, { useState } from 'react';
import { MarketItem } from '../types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, BarChart2, Layers } from 'lucide-react';

interface MarketPulseOverviewProps {
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

// Mini SVG Area Sparkline with high-contrast gradient
const MiniChart: React.FC<{
  data: number[];
  isPositive: boolean;
  height?: number;
}> = ({ data, isPositive, height = 50 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 180;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  const strokeColor = isPositive ? '#089981' : '#f23645';
  const gradId = `grad-${isPositive ? 'pos' : 'neg'}-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const MarketPulseOverview: React.FC<MarketPulseOverviewProps> = ({
  markets,
  onSelectSymbol,
  onOpenChart,
}) => {
  const [activeMoverTab, setActiveMoverTab] = useState<'gainers' | 'losers' | 'active' | 'tech'>('gainers');
  const [pulseTimeframe, setPulseTimeframe] = useState<string>('1D');

  // Key spotlight benchmarks (SPX, NDX, BTCUSD, XAUUSD, NVDA, US10Y)
  const spotlightSymbols = ['SPX', 'NDX', 'BTCUSD', 'XAUUSD', 'NVDA', 'US10Y'];
  const spotlightItems = spotlightSymbols
    .map((sym) => markets.find((m) => m.symbol === sym))
    .filter(Boolean) as MarketItem[];

  // Movers calculation
  const gainers = [...markets].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
  const losers = [...markets].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
  const active = [...markets].sort((a, b) => b.volumeNum - a.volumeNum).slice(0, 6);
  const techStocks = markets.filter((m) => m.sector === 'Technology').slice(0, 6);

  const currentMoverList =
    activeMoverTab === 'gainers'
      ? gainers
      : activeMoverTab === 'losers'
      ? losers
      : activeMoverTab === 'active'
      ? active
      : techStocks;

  return (
    <div className="space-y-8">
      {/* Top Banner / Market Overview Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white dark:text-white light:text-[#131722] sm:text-3xl">
            Markets Overview
          </h1>
          <p className="mt-1 text-xs text-[#787b86] dark:text-[#787b86] light:text-[#787b86]">
            Real-time multi-asset quotes, indices performance, and global market pulse
          </p>
        </div>

        {/* Global Timeframe Selector */}
        <div className="flex items-center gap-1 rounded bg-[#1e222d] p-1 border border-[#2a2e39] text-xs dark:bg-[#1e222d] dark:border-[#2a2e39] light:bg-[#f0f3fa] light:border-[#e0e3eb]">
          {['1D', '5D', '1M', '6M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setPulseTimeframe(tf)}
              className={`px-2.5 py-1 font-semibold rounded transition-colors ${
                pulseTimeframe === tf
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] dark:text-[#787b86] dark:hover:text-white light:text-[#787b86] light:hover:text-[#131722]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Hero Spotlight Benchmark Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {spotlightItems.map((item) => {
          const isPos = item.changePercent >= 0;
          return (
            <div
              key={item.id}
              onClick={() => onSelectSymbol(item.symbol)}
              className="group cursor-pointer rounded-lg border border-[#2a2e39] bg-[#1e222d]/90 p-4 transition-all hover:border-[#2962ff]/60 hover:bg-[#1e222d] dark:border-[#2a2e39] dark:bg-[#1e222d]/90 light:border-[#e0e3eb] light:bg-white light:hover:border-[#2962ff]/50 light:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight text-white dark:text-white light:text-[#131722]">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-[#787b86] uppercase tracking-wider font-mono">
                      {item.exchange}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#787b86] truncate max-w-[120px]" title={item.name}>
                    {item.name}
                  </div>
                </div>

                <span
                  className={`flex items-center text-xs font-mono font-bold tabular-nums ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {isPos ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Price & Sparkline */}
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-xl font-bold font-mono tracking-tight tabular-nums text-white dark:text-white light:text-[#131722]">
                    {item.currency === '$' || item.currency === 'USD' ? '$' : ''}
                    {item.price > 100
                      ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : item.price}
                    {item.currency === '%' ? '%' : ''}
                  </div>
                  <div className="text-[11px] font-mono text-[#787b86] tabular-nums">
                    {isPos ? '+' : ''}
                    {item.change.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Sparkline Canvas */}
              <div className="mt-3 h-10 w-full">
                <MiniChart data={item.sparkline} isPositive={isPos} height={40} />
              </div>

              {/* 24h High/Low Bar */}
              <div className="mt-3 pt-2 border-t border-[#2a2e39]/50 dark:border-[#2a2e39]/50 light:border-[#e0e3eb]">
                <div className="flex justify-between text-[10px] font-mono text-[#787b86] tabular-nums">
                  <span>L: {item.low24h}</span>
                  <span>H: {item.high24h}</span>
                </div>
                <div className="mt-1 h-1 w-full bg-[#2a2e39] rounded-full overflow-hidden dark:bg-[#2a2e39] light:bg-[#e0e3eb]">
                  <div
                    className="h-full bg-[#2962ff] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          10,
                          ((item.price - item.low24h) / (item.high24h - item.low24h || 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Movers Section */}
      <div className="rounded-lg border border-[#2a2e39] bg-[#1e222d] p-5 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#2a2e39] pb-4 dark:border-[#2a2e39] light:border-[#e0e3eb]">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[#2962ff]" />
            <h2 className="text-base font-bold text-white dark:text-white light:text-[#131722]">
              Market Movers & Highlights
            </h2>
          </div>

          {/* Segmented Movers Tabs */}
          <div className="flex items-center gap-1 rounded bg-[#131722] p-1 border border-[#2a2e39] text-xs dark:bg-[#131722] dark:border-[#2a2e39] light:bg-[#f0f3fa] light:border-[#e0e3eb]">
            <button
              onClick={() => setActiveMoverTab('gainers')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeMoverTab === 'gainers'
                  ? 'bg-[#089981] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] dark:text-[#787b86] light:text-[#787b86]'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setActiveMoverTab('losers')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeMoverTab === 'losers'
                  ? 'bg-[#f23645] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] dark:text-[#787b86] light:text-[#787b86]'
              }`}
            >
              Top Losers
            </button>
            <button
              onClick={() => setActiveMoverTab('active')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeMoverTab === 'active'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] dark:text-[#787b86] light:text-[#787b86]'
              }`}
            >
              Most Active
            </button>
            <button
              onClick={() => setActiveMoverTab('tech')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeMoverTab === 'tech'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] dark:text-[#787b86] light:text-[#787b86]'
              }`}
            >
              Tech Leaders
            </button>
          </div>
        </div>

        {/* Table of Movers */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86] font-semibold dark:border-[#2a2e39] light:border-[#e0e3eb]">
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Change %</th>
                <th className="py-2.5 px-3 text-right">Change $</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-center">Rating</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb]">
              {currentMoverList.map((item) => {
                const isPos = item.changePercent >= 0;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectSymbol(item.symbol)}
                    className="group cursor-pointer hover:bg-[#2a2e39]/40 transition-colors dark:hover:bg-[#2a2e39]/40 light:hover:bg-[#f0f3fa]"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: item.brandColor || '#2962ff' }}
                        >
                          {item.logoText.slice(0, 3)}
                        </span>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#2962ff] dark:text-white light:text-[#131722]">
                            {item.symbol}
                          </div>
                          <div className="text-[10px] text-[#787b86] font-mono">{item.exchange}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[#d1d4dc] dark:text-[#d1d4dc] light:text-[#434651] max-w-[200px] truncate font-medium">
                      {item.name}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-white dark:text-white light:text-[#131722]">
                      ${item.price > 100 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price}
                    </td>

                    <td
                      className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </td>

                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {item.change.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86]">
                      {item.volume}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.rating === 'Strong Buy'
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : item.rating === 'Buy'
                            ? 'bg-[#089981]/10 text-[#089981]'
                            : item.rating === 'Strong Sell'
                            ? 'bg-[#f23645]/15 text-[#f23645]'
                            : item.rating === 'Sell'
                            ? 'bg-[#f23645]/10 text-[#f23645]'
                            : 'bg-[#787b86]/15 text-[#b2b5be]'
                        }`}
                      >
                        {item.rating}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChart(item.symbol);
                        }}
                        className="rounded bg-[#2962ff]/10 px-2.5 py-1 text-xs font-semibold text-[#2962ff] hover:bg-[#2962ff] hover:text-white transition-colors"
                      >
                        Chart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
