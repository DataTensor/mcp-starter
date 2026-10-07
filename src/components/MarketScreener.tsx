import React, { useState, useMemo } from 'react';
import { MarketItem, AssetClass, TechnicalRating } from '../types';
import { Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

interface MarketScreenerProps {
  markets: MarketItem[];
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volumeNum' | 'marketCapNum' | 'pe';

export const MarketScreener: React.FC<MarketScreenerProps> = ({
  markets,
  onSelectSymbol,
  onOpenChart,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [assetClass, setAssetClass] = useState<AssetClass>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [perfFilter, setPerfFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('marketCapNum');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredMarkets = useMemo(() => {
    return markets.filter((item) => {
      // Search
      if (
        searchTerm &&
        !item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Asset Class
      if (assetClass !== 'all' && item.assetClass !== assetClass) {
        return false;
      }

      // Rating
      if (ratingFilter !== 'all' && item.rating !== ratingFilter) {
        return false;
      }

      // Performance
      if (perfFilter === 'positive' && item.changePercent <= 0) return false;
      if (perfFilter === 'negative' && item.changePercent >= 0) return false;
      if (perfFilter === 'gainers2' && item.changePercent < 2) return false;
      if (perfFilter === 'losers1' && item.changePercent > -1) return false;

      return true;
    });
  }, [markets, searchTerm, assetClass, ratingFilter, perfFilter]);

  const sortedMarkets = useMemo(() => {
    return [...filteredMarkets].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined || valA === null) valA = -Infinity;
      if (valB === undefined || valB === null) valB = -Infinity;

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredMarkets, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screener Header */}
      <div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6 text-[#2962ff]" />
          <h1 className="text-2xl font-black tracking-tight text-white dark:text-white light:text-[#131722]">
            Market Screener
          </h1>
        </div>
        <p className="mt-1 text-xs text-[#787b86]">
          Multi-asset quantitative screener with real-time valuation, technical ratings, and fundamental metrics
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-lg border border-[#2a2e39] bg-[#1e222d] p-4 space-y-3 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#787b86]" />
            <input
              type="text"
              placeholder="Filter by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-[#2a2e39] bg-[#131722] py-2 pl-9 pr-3 text-xs text-white placeholder-[#787b86] outline-none focus:border-[#2962ff] dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-[#f8f9fc] light:text-[#131722]"
            />
          </div>

          {/* Asset Class Filter */}
          <div>
            <select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value as AssetClass)}
              className="w-full rounded border border-[#2a2e39] bg-[#131722] py-2 px-3 text-xs text-white outline-none focus:border-[#2962ff] dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-[#f8f9fc] light:text-[#131722]"
            >
              <option value="all">All Asset Classes</option>
              <option value="stocks">Stocks</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="forex">Forex (Currencies)</option>
              <option value="indices">Indices</option>
              <option value="futures">Futures & Commodities</option>
              <option value="bonds">Bonds & Rates</option>
            </select>
          </div>

          {/* Technical Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full rounded border border-[#2a2e39] bg-[#131722] py-2 px-3 text-xs text-white outline-none focus:border-[#2962ff] dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-[#f8f9fc] light:text-[#131722]"
            >
              <option value="all">All Technical Ratings</option>
              <option value="Strong Buy">Strong Buy</option>
              <option value="Buy">Buy</option>
              <option value="Neutral">Neutral</option>
              <option value="Sell">Sell</option>
              <option value="Strong Sell">Strong Sell</option>
            </select>
          </div>

          {/* Performance Filter */}
          <div>
            <select
              value={perfFilter}
              onChange={(e) => setPerfFilter(e.target.value)}
              className="w-full rounded border border-[#2a2e39] bg-[#131722] py-2 px-3 text-xs text-white outline-none focus:border-[#2962ff] dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-[#f8f9fc] light:text-[#131722]"
            >
              <option value="all">All Performance</option>
              <option value="positive">Green Only (&gt; 0%)</option>
              <option value="negative">Red Only (&lt; 0%)</option>
              <option value="gainers2">Gainers &gt; +2%</option>
              <option value="losers1">Losers &lt; -1%</option>
            </select>
          </div>
        </div>

        {/* Count Indicator */}
        <div className="flex items-center justify-between text-xs text-[#787b86] pt-1">
          <span>
            Showing <strong className="text-white dark:text-white light:text-[#131722]">{sortedMarkets.length}</strong> matching assets
          </span>
          {(searchTerm || assetClass !== 'all' || ratingFilter !== 'all' || perfFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setAssetClass('all');
                setRatingFilter('all');
                setPerfFilter('all');
              }}
              className="text-[#2962ff] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Screener Table */}
      <div className="rounded-lg border border-[#2a2e39] bg-[#1e222d] overflow-x-auto dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#2a2e39] text-[#787b86] font-semibold select-none dark:border-[#2a2e39] light:border-[#e0e3eb]">
              <th
                onClick={() => toggleSort('symbol')}
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol & Name</span>
                  {sortField === 'symbol' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                onClick={() => toggleSort('price')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price</span>
                  {sortField === 'price' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                onClick={() => toggleSort('changePercent')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>24h Change %</span>
                  {sortField === 'changePercent' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
              </th>
              <th className="py-3 px-3 text-right">Change $</th>
              <th className="py-3 px-3 text-center">Day Range</th>
              <th
                onClick={() => toggleSort('volumeNum')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  {sortField === 'volumeNum' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                onClick={() => toggleSort('marketCapNum')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Market Cap</span>
                  {sortField === 'marketCapNum' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
              </th>
              <th
                onClick={() => toggleSort('pe')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>P/E</span>
                  {sortField === 'pe' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
              </th>
              <th className="py-3 px-3 text-center">Technical Rating</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 light:divide-[#e0e3eb]">
            {sortedMarkets.map((item) => {
              const isPos = item.changePercent >= 0;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className="group cursor-pointer hover:bg-[#2a2e39]/30 transition-colors dark:hover:bg-[#2a2e39]/30 light:hover:bg-[#f0f3fa]"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: item.brandColor || '#2962ff' }}
                      >
                        {item.logoText.slice(0, 3)}
                      </span>
                      <div>
                        <div className="font-bold text-white group-hover:text-[#2962ff] dark:text-white light:text-[#131722]">
                          {item.symbol}
                        </div>
                        <div className="text-[11px] text-[#787b86] truncate max-w-[150px]">
                          {item.name}
                        </div>
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

                  <td className="py-3 px-3 text-center">
                    <div className="w-24 mx-auto">
                      <div className="flex justify-between text-[9px] font-mono text-[#787b86]">
                        <span>{item.low24h}</span>
                        <span>{item.high24h}</span>
                      </div>
                      <div className="h-1 bg-[#2a2e39] rounded-full overflow-hidden mt-0.5 dark:bg-[#2a2e39] light:bg-[#e0e3eb]">
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
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#b2b5be]">
                    {item.volume}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#b2b5be]">
                    {item.marketCap || '—'}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#b2b5be]">
                    {item.pe ? item.pe.toFixed(1) : '—'}
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
                      className="inline-flex items-center gap-1 rounded bg-[#2962ff] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#1e4bd8] transition-colors"
                    >
                      <span>Chart</span>
                      <ExternalLink className="h-3 w-3" />
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
