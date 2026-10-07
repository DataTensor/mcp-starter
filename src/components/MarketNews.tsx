import React, { useState } from 'react';
import { MOCK_NEWS } from '../data/mockMarkets';
import { NewsItem } from '../types';
import { Newspaper, Clock, ExternalLink, Tag } from 'lucide-react';

interface MarketNewsProps {
  onSelectSymbol: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export const MarketNews: React.FC<MarketNewsProps> = ({
  onSelectSymbol,
  onOpenChart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Indices & Stocks', 'Technology', 'Digital Assets', 'Commodities'];

  const filteredNews =
    selectedCategory === 'All'
      ? MOCK_NEWS
      : MOCK_NEWS.filter((item) => item.category === selectedCategory);

  const heroNews = filteredNews[0] || MOCK_NEWS[0];
  const secondaryNews = filteredNews.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-[#2962ff]" />
            <h1 className="text-2xl font-black tracking-tight text-white dark:text-white light:text-[#131722]">
              Market News & Macro Insights
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#787b86]">
            Curated financial news, corporate earnings, central bank announcements, and institutional flow
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded bg-[#1e222d] p-1 border border-[#2a2e39] text-xs dark:bg-[#1e222d] dark:border-[#2a2e39] light:bg-[#f0f3fa] light:border-[#e0e3eb]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-2.5 py-1 font-semibold rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-white light:hover:text-[#131722]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Lead Story (Hero Card) */}
      {heroNews && (
        <div className="group overflow-hidden rounded-xl border border-[#2a2e39] bg-[#1e222d] grid grid-cols-1 lg:grid-cols-12 gap-0 transition-all hover:border-[#2962ff]/50 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-md">
          {/* Hero Image */}
          <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto overflow-hidden bg-[#131722]">
            <img
              src={heroNews.imageUrl}
              alt={heroNews.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
          </div>

          {/* Hero Content */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#787b86] mb-3">
                <span className="font-bold text-[#2962ff]">{heroNews.source}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {heroNews.timeAgo}
                </span>
                <span>·</span>
                <span>{heroNews.readTime}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-[#2962ff] transition-colors dark:text-white light:text-[#131722]">
                {heroNews.title}
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-[#b2b5be] dark:text-[#b2b5be] light:text-[#434651]">
                {heroNews.summary}
              </p>
            </div>

            {/* Related Tickers */}
            <div className="mt-6 pt-4 border-t border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
              <span className="text-[11px] font-medium text-[#787b86] block mb-2">Mentioned Symbols:</span>
              <div className="flex flex-wrap gap-1.5">
                {heroNews.relatedSymbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => onOpenChart(sym)}
                    className="flex items-center gap-1 rounded bg-[#2a2e39] px-2.5 py-1 text-xs font-mono font-bold text-white hover:bg-[#2962ff] transition-colors dark:bg-[#2a2e39] light:bg-[#e0e3eb] light:text-[#131722]"
                  >
                    <span>{sym}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stories Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {secondaryNews.map((news) => (
          <div
            key={news.id}
            className="group flex flex-col justify-between rounded-lg border border-[#2a2e39] bg-[#1e222d] overflow-hidden transition-all hover:border-[#2962ff]/50 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-[#131722]">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 text-[11px] text-[#787b86] mb-2">
                  <span className="font-bold text-[#2962ff]">{news.source}</span>
                  <span>·</span>
                  <span>{news.timeAgo}</span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#2962ff] transition-colors line-clamp-2 dark:text-white light:text-[#131722]">
                  {news.title}
                </h3>

                <p className="mt-2 text-xs text-[#b2b5be] line-clamp-2 dark:text-[#b2b5be] light:text-[#434651]">
                  {news.summary}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <div className="border-t border-[#2a2e39]/60 pt-3 flex items-center justify-between dark:border-[#2a2e39]/60 light:border-[#e0e3eb]">
                <div className="flex gap-1">
                  {news.relatedSymbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => onOpenChart(sym)}
                      className="rounded bg-[#2a2e39] px-2 py-0.5 text-[10px] font-mono font-bold text-white hover:bg-[#2962ff] transition-colors dark:bg-[#2a2e39] light:bg-[#e0e3eb] light:text-[#131722]"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#787b86]">{news.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
