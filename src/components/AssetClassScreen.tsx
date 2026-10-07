import React, { useState } from 'react';
import { MarketItem, AssetClass } from '../types';
import { ArrowUpRight, ArrowDownRight, Layers, BarChart3, TrendingUp, ShieldAlert } from 'lucide-react';

interface AssetClassScreenProps {
  assetClass: AssetClass;
  title: string;
  subtitle: string;
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export const AssetClassScreen: React.FC<AssetClassScreenProps> = ({
  assetClass,
  title,
  subtitle,
  markets,
  onSelectSymbol,
  onOpenChart,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const items = markets.filter((m) => m.assetClass === assetClass);

  // Top benchmarks for this class
  const heroBenchmarks = items.slice(0, 4);

  // Filtered list
  const displayItems = items.filter((item) => {
    if (filterType === 'gainers') return item.changePercent > 0;
    if (filterType === 'losers') return item.changePercent < 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white dark:text-white light:text-[#131722]">
            {title}
          </h1>
          <p className="mt-1 text-xs text-[#787b86]">{subtitle}</p>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center gap-1 rounded bg-[#1e222d] p-1 border border-[#2a2e39] text-xs dark:bg-[#1e222d] dark:border-[#2a2e39] light:bg-[#f0f3fa] light:border-[#e0e3eb]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 font-semibold rounded transition-colors ${
              filterType === 'all'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-white light:hover:text-[#131722]'
            }`}
          >
            All Instruments
          </button>
          <button
            onClick={() => setFilterType('gainers')}
            className={`px-3 py-1 font-semibold rounded transition-colors ${
              filterType === 'gainers'
                ? 'bg-[#089981] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-white light:hover:text-[#131722]'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setFilterType('losers')}
            className={`px-3 py-1 font-semibold rounded transition-colors ${
              filterType === 'losers'
                ? 'bg-[#f23645] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-white light:hover:text-[#131722]'
            }`}
          >
            Losers
          </button>
        </div>
      </div>

      {/* Hero Benchmark Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {heroBenchmarks.map((item) => {
          const isPos = item.changePercent >= 0;
          return (
            <div
              key={item.id}
              onClick={() => onSelectSymbol(item.symbol)}
              className="cursor-pointer rounded-lg border border-[#2a2e39] bg-[#1e222d] p-4 transition-all hover:border-[#2962ff]/60 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base dark:text-white light:text-[#131722]">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-[#787b86] font-mono">{item.exchange}</span>
                  </div>
                  <div className="text-[11px] text-[#787b86] truncate max-w-[130px]">{item.name}</div>
                </div>
                <span
                  className={`flex items-center text-xs font-mono font-bold ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {isPos ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-xl font-bold font-mono tabular-nums text-white dark:text-white light:text-[#131722]">
                  {item.currency === '$' || item.currency === 'USD' ? '$' : ''}
                  {item.price > 100
                    ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : item.price}
                  {item.currency === '%' ? '%' : ''}
                </div>
                <div className="text-xs font-mono text-[#787b86]">
                  Vol: {item.volume}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChart(item.symbol);
                  }}
                  className="w-full rounded bg-[#2962ff]/10 py-1 text-center text-xs font-bold text-[#2962ff] hover:bg-[#2962ff] hover:text-white transition-colors"
                >
                  Open Superchart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Yield Curve Visualizer specifically for Bonds screen */}
      {assetClass === 'bonds' && (
        <div className="rounded-lg border border-[#2a2e39] bg-[#1e222d] p-5 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white dark:text-white light:text-[#131722]">
                US Treasury Yield Curve Spread
              </h3>
              <p className="text-xs text-[#787b86]">
                Benchmark sovereign bond rates & maturities comparison
              </p>
            </div>
            <span className="text-xs font-mono bg-[#2a2e39] px-2.5 py-1 rounded text-white font-semibold">
              2Y / 10Y Spread: +11.7 bps
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded bg-[#131722] border border-[#2a2e39]">
              <div className="text-[#787b86] text-xs">US 2-Year Yield</div>
              <div className="text-xl font-bold font-mono text-white mt-1">3.965%</div>
              <div className="text-[11px] text-[#089981] font-mono mt-0.5">+0.71%</div>
            </div>
            <div className="p-3 rounded bg-[#131722] border border-[#2a2e39]">
              <div className="text-[#787b86] text-xs">US 10-Year Yield</div>
              <div className="text-xl font-bold font-mono text-white mt-1">4.082%</div>
              <div className="text-[11px] text-[#089981] font-mono mt-0.5">+1.01%</div>
            </div>
            <div className="p-3 rounded bg-[#131722] border border-[#2a2e39]">
              <div className="text-[#787b86] text-xs">German 10Y Bund</div>
              <div className="text-xl font-bold font-mono text-white mt-1">2.215%</div>
              <div className="text-[11px] text-[#089981] font-mono mt-0.5">+0.82%</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="rounded-lg border border-[#2a2e39] bg-[#1e222d] overflow-x-auto dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#2a2e39] text-[#787b86] font-semibold dark:border-[#2a2e39] light:border-[#e0e3eb]">
              <th className="py-3 px-4">Instrument</th>
              <th className="py-3 px-3 text-right">Last Price</th>
              <th className="py-3 px-3 text-right">Change %</th>
              <th className="py-3 px-3 text-right">Change $</th>
              <th className="py-3 px-3 text-right">24h High</th>
              <th className="py-3 px-3 text-right">24h Low</th>
              <th className="py-3 px-3 text-right">Volume</th>
              <th className="py-3 px-3 text-center">Technical Rating</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb]">
            {displayItems.map((item) => {
              const isPos = item.changePercent >= 0;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className="group cursor-pointer hover:bg-[#2a2e39]/30 transition-colors dark:hover:bg-[#2a2e39]/30 light:hover:bg-[#f0f3fa]"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
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
                        <div className="text-[11px] text-[#787b86] truncate max-w-[150px]">{item.name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-white dark:text-white light:text-[#131722]">
                    {item.currency === '$' || item.currency === 'USD' ? '$' : ''}
                    {item.price > 100
                      ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : item.price}
                    {item.currency === '%' ? '%' : ''}
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

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#b2b5be]">
                    {item.high24h}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#b2b5be]">
                    {item.low24h}
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

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChart(item.symbol);
                      }}
                      className="rounded bg-[#2962ff] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#1e4bd8] transition-colors"
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
  );
};
