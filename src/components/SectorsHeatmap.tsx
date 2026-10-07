import React, { useState } from 'react';
import { HEATMAP_DATA } from '../data/mockMarkets';
import { HeatmapItem } from '../types';
import { Grid3X3, Filter, ZoomIn, Layers } from 'lucide-react';

interface SectorsHeatmapProps {
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export const SectorsHeatmap: React.FC<SectorsHeatmapProps> = ({
  onSelectSymbol,
  onOpenChart,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [hoveredStock, setHoveredStock] = useState<HeatmapItem | null>(null);

  const getHeatmapColor = (pct: number) => {
    if (pct >= 3.0) return 'bg-[#089981] text-white';
    if (pct >= 1.5) return 'bg-[#0d7362] text-white';
    if (pct > 0) return 'bg-[#13594e] text-white';
    if (pct === 0) return 'bg-[#2a2e39] text-[#b2b5be]';
    if (pct > -1.5) return 'bg-[#5c1c24] text-white';
    if (pct > -3.0) return 'bg-[#99202c] text-white';
    return 'bg-[#f23645] text-white';
  };

  const sectorsToDisplay =
    selectedSector === 'All'
      ? HEATMAP_DATA
      : HEATMAP_DATA.filter((s) => s.sector === selectedSector);

  return (
    <div className="space-y-6">
      {/* Heatmap Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-[#2962ff]" />
            <h1 className="text-2xl font-black tracking-tight text-white dark:text-white light:text-[#131722]">
              Stock Market Heatmap
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#787b86]">
            Visual treemap of global equities sized by market capitalization and colored by daily performance
          </p>
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded bg-[#1e222d] p-1 border border-[#2a2e39] text-xs dark:bg-[#1e222d] dark:border-[#2a2e39] light:bg-[#f0f3fa] light:border-[#e0e3eb]">
          {['All', 'Technology', 'Communication', 'Consumer Cyclical', 'Financials', 'Healthcare', 'Energy'].map(
            (sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`whitespace-nowrap px-2.5 py-1 font-semibold rounded transition-colors ${
                  selectedSector === sec
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-white light:hover:text-[#131722]'
                }`}
              >
                {sec}
              </button>
            )
          )}
        </div>
      </div>

      {/* Heatmap Color Legend Bar */}
      <div className="flex items-center justify-between rounded-lg border border-[#2a2e39] bg-[#1e222d] px-4 py-2 text-xs dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
        <span className="text-[#787b86] font-medium text-[11px]">Performance Legend:</span>
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#f23645] text-white font-bold">&lt; -3%</span>
          <span className="px-2 py-0.5 rounded bg-[#99202c] text-white">-2%</span>
          <span className="px-2 py-0.5 rounded bg-[#5c1c24] text-white">-1%</span>
          <span className="px-2 py-0.5 rounded bg-[#2a2e39] text-[#b2b5be]">0%</span>
          <span className="px-2 py-0.5 rounded bg-[#13594e] text-white">+1%</span>
          <span className="px-2 py-0.5 rounded bg-[#0d7362] text-white">+2%</span>
          <span className="px-2 py-0.5 rounded bg-[#089981] text-white font-bold">&gt; +3%</span>
        </div>
      </div>

      {/* Main Treemap Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {sectorsToDisplay.map((secGroup) => {
          // Calculate sector average
          const avgPerf =
            secGroup.items.reduce((acc, curr) => acc + curr.changePercent, 0) / secGroup.items.length;
          const isPos = avgPerf >= 0;

          return (
            <div
              key={secGroup.sector}
              className="rounded-lg border border-[#2a2e39] bg-[#1e222d] p-4 flex flex-col dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#2a2e39] pb-2 mb-3 dark:border-[#2a2e39] light:border-[#e0e3eb]">
                <span className="font-bold text-sm text-white dark:text-white light:text-[#131722]">
                  {secGroup.sector}
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {avgPerf.toFixed(2)}%
                </span>
              </div>

              {/* Tiles Grid with proportional sizing */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
                {secGroup.items.map((stock) => {
                  const isLarge = stock.marketCap > 1000;
                  const isStockPos = stock.changePercent >= 0;

                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => onOpenChart(stock.symbol)}
                      onMouseEnter={() => setHoveredStock(stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      className={`group relative cursor-pointer rounded p-3 transition-transform hover:scale-[1.03] hover:z-10 shadow-xs flex flex-col justify-between ${
                        isLarge ? 'col-span-2 row-span-2 min-h-[130px]' : 'min-h-[85px]'
                      } ${getHeatmapColor(stock.changePercent)}`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`font-black tracking-tight ${isLarge ? 'text-lg' : 'text-sm'}`}>
                            {stock.symbol}
                          </span>
                          <span className="font-mono text-[10px] opacity-80">
                            ${stock.price.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-90 truncate mt-0.5">{stock.name}</div>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between font-mono">
                        <span className={`font-bold ${isLarge ? 'text-base' : 'text-xs'}`}>
                          {isStockPos ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                        <span className="text-[10px] opacity-80">${stock.marketCap}B</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating or Hovered Stock Info Bar */}
      {hoveredStock && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 rounded-lg border border-[#2a2e39] bg-[#1e222d]/95 px-5 py-2.5 shadow-2xl backdrop-blur-md dark:border-[#2a2e39] dark:bg-[#1e222d]/95 light:border-[#e0e3eb] light:bg-white/95">
          <span className="font-extrabold text-white dark:text-white light:text-[#131722]">
            {hoveredStock.symbol}
          </span>
          <span className="text-xs text-[#787b86]">{hoveredStock.name}</span>
          <span className="font-mono font-bold text-white dark:text-white light:text-[#131722]">
            ${hoveredStock.price.toFixed(2)}
          </span>
          <span
            className={`font-mono text-xs font-bold ${
              hoveredStock.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
            }`}
          >
            {hoveredStock.changePercent >= 0 ? '+' : ''}
            {hoveredStock.changePercent.toFixed(2)}%
          </span>
          <span className="text-xs font-mono text-[#787b86]">Cap: ${hoveredStock.marketCap}B</span>
          <button
            onClick={() => onOpenChart(hoveredStock.symbol)}
            className="rounded bg-[#2962ff] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#1e4bd8]"
          >
            View Superchart
          </button>
        </div>
      )}
    </div>
  );
};
