export type AssetClass =
  | 'all'
  | 'indices'
  | 'stocks'
  | 'crypto'
  | 'forex'
  | 'futures'
  | 'bonds';

export type TechnicalRating =
  | 'Strong Buy'
  | 'Buy'
  | 'Neutral'
  | 'Sell'
  | 'Strong Sell';

export type ChartType = 'candlestick' | 'area' | 'line' | 'bars';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketItem {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  exchange: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  high52w: number;
  low52w: number;
  volume: string;
  volumeNum: number;
  avgVolume?: string;
  marketCap?: string;
  marketCapNum?: number;
  pe?: number | null;
  dividendYield?: number | null;
  beta?: number | null;
  sector?: string;
  country: string;
  rating: TechnicalRating;
  sparkline: number[];
  candles: Candle[];
  logoText: string;
  brandColor: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  category: string;
  relatedSymbols: string[];
  imageUrl: string;
  readTime: string;
}

export interface HeatmapItem {
  symbol: string;
  name: string;
  changePercent: number;
  marketCap: number; // For relative box sizing
  sector: string;
  price: number;
}

export interface HeatmapSector {
  sector: string;
  items: HeatmapItem[];
}
