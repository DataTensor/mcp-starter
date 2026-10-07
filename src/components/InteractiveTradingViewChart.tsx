import React, { useState, useRef, useMemo } from 'react';
import { MarketItem, Candle, ChartType } from '../types';
import {
  CandlestickChart,
  TrendingUp,
  Activity,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  CheckCircle2,
  Share2,
  MousePointer,
  Minus,
  PenTool,
  Hash,
  Ruler,
  Trash2,
} from 'lucide-react';

interface InteractiveTradingViewChartProps {
  item: MarketItem;
  portfolioBalance: number;
  onExecuteTrade: (order: { symbol: string; type: 'buy' | 'sell'; quantity: number; price: number }) => void;
}

export const InteractiveTradingViewChart: React.FC<InteractiveTradingViewChartProps> = ({
  item,
  portfolioBalance,
  onExecuteTrade,
}) => {
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string>('crosshair');

  // Interactive Hover Crosshair State
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Trading order panel state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeQuantity, setTradeQuantity] = useState<number>(10);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const candles = item.candles || [];

  // Calculate Moving Averages
  const { ema20, sma50, bollingerUpper, bollingerLower } = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const ema: (number | null)[] = [];
    const sma: (number | null)[] = [];
    const bUpper: (number | null)[] = [];
    const bLower: (number | null)[] = [];

    // SMA 50
    for (let i = 0; i < closes.length; i++) {
      if (i < 9) {
        sma.push(null);
      } else {
        const slice = closes.slice(Math.max(0, i - 14), i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        sma.push(avg);
      }
    }

    // EMA 20
    const k = 2 / (15 + 1);
    let prevEMA = closes[0];
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        ema.push(prevEMA);
      } else {
        prevEMA = closes[i] * k + prevEMA * (1 - k);
        ema.push(prevEMA);
      }
    }

    // Bollinger
    for (let i = 0; i < closes.length; i++) {
      if (i < 10) {
        bUpper.push(null);
        bLower.push(null);
      } else {
        const slice = closes.slice(i - 10, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
        const stdDev = Math.sqrt(variance);
        bUpper.push(mean + 1.8 * stdDev);
        bLower.push(mean - 1.8 * stdDev);
      }
    }

    return { ema20: ema, sma50: sma, bollingerUpper: bUpper, bollingerLower: bLower };
  }, [candles]);

  // Chart Dimensions & Scales
  const chartWidth = 900;
  const chartHeight = 440;
  const volumeHeight = showVolume ? 70 : 0;
  const mainPlotHeight = chartHeight - volumeHeight - 40;

  const minPrice = useMemo(() => {
    if (!candles.length) return 0;
    const allLows = candles.map((c) => c.low);
    return Math.min(...allLows) * 0.995;
  }, [candles]);

  const maxPrice = useMemo(() => {
    if (!candles.length) return 100;
    const allHighs = candles.map((c) => c.high);
    return Math.max(...allHighs) * 1.005;
  }, [candles]);

  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = useMemo(() => {
    if (!candles.length) return 1;
    return Math.max(...candles.map((c) => c.volume)) * 1.1;
  }, [candles]);

  // Coordinates helper
  const getY = (price: number) => {
    return mainPlotHeight - ((price - minPrice) / priceRange) * mainPlotHeight + 20;
  };

  const candleSpacing = chartWidth / Math.max(1, candles.length);
  const candleBodyWidth = Math.max(2, Math.min(14, candleSpacing * 0.65));

  // Handle Mouse Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || candles.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalizing scale
    const svgX = (x / rect.width) * chartWidth;
    const svgY = (y / rect.height) * chartHeight;

    const index = Math.min(
      candles.length - 1,
      Math.max(0, Math.floor(svgX / candleSpacing))
    );

    setHoveredCandle(candles[index]);
    setMousePos({ x: svgX, y: svgY });
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setMousePos(null);
  };

  const handlePlaceOrder = () => {
    if (tradeQuantity <= 0) return;
    const cost = item.price * tradeQuantity;

    if (tradeType === 'buy' && cost > portfolioBalance) {
      setOrderNotification('Insufficient simulated funds!');
      setTimeout(() => setOrderNotification(null), 3000);
      return;
    }

    onExecuteTrade({
      symbol: item.symbol,
      type: tradeType,
      quantity: tradeQuantity,
      price: item.price,
    });

    setOrderNotification(
      `Filled ${tradeType.toUpperCase()} order for ${tradeQuantity} ${item.symbol} @ $${item.price.toFixed(2)}`
    );
    setTimeout(() => setOrderNotification(null), 3500);
  };

  const isPositive = item.changePercent >= 0;
  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="space-y-4">
      {/* Top Header Information Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#2a2e39] bg-[#1e222d] p-4 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded text-sm font-bold text-white shadow-xs"
            style={{ backgroundColor: item.brandColor || '#2962ff' }}
          >
            {item.logoText.slice(0, 4)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white dark:text-white light:text-[#131722]">
                {item.symbol}
              </span>
              <span className="text-xs font-mono text-[#787b86] uppercase">{item.exchange}</span>
              <span className="text-xs text-[#787b86]">· {item.currency}</span>
            </div>
            <div className="text-xs font-medium text-[#787b86]">{item.name}</div>
          </div>
        </div>

        {/* Live Quote & Daily Change */}
        <div className="flex items-baseline gap-4">
          <div className="text-right">
            <div className="text-2xl font-black font-mono tracking-tight tabular-nums text-white dark:text-white light:text-[#131722]">
              {item.currency === '$' || item.currency === 'USD' ? '$' : ''}
              {item.price > 100
                ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : item.price}
            </div>
            <div
              className={`flex items-center justify-end gap-1 text-xs font-mono font-bold tabular-nums ${
                isPositive ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              <span>{isPositive ? '+' : ''}{item.change.toFixed(2)}</span>
              <span>({isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Terminal Window */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Left: Interactive TradingView Chart & Toolbar (3 cols) */}
        <div className="lg:col-span-3 rounded-lg border border-[#2a2e39] bg-[#1e222d] overflow-hidden dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
          {/* Chart Controls Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#2a2e39] px-3 py-2 text-xs dark:border-[#2a2e39] light:border-[#e0e3eb]">
            {/* Timeframe & Chart Types */}
            <div className="flex items-center gap-1">
              {['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 font-semibold rounded transition-colors ${
                    timeframe === tf
                      ? 'bg-[#2962ff] text-white'
                      : 'text-[#787b86] hover:text-[#d1d4dc] dark:hover:text-white light:hover:text-[#131722]'
                  }`}
                >
                  {tf}
                </button>
              ))}

              <div className="mx-2 h-4 w-[1px] bg-[#2a2e39] dark:bg-[#2a2e39] light:bg-[#e0e3eb]" />

              {/* Chart Type Toggles */}
              {(['candlestick', 'area', 'line', 'bars'] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-2 py-1 font-medium capitalize rounded transition-colors ${
                    chartType === type
                      ? 'bg-[#2a2e39] text-white font-bold dark:bg-[#2a2e39] light:bg-[#e0e3eb] light:text-[#131722]'
                      : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Technical Indicators Bar */}
            <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
              <button
                onClick={() => setShowEMA((p) => !p)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  showEMA ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                <span>EMA 20</span>
              </button>
              <button
                onClick={() => setShowSMA((p) => !p)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  showSMA ? 'bg-[#06b6d4]/20 text-[#06b6d4]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                <span>SMA 50</span>
              </button>
              <button
                onClick={() => setShowBollinger((p) => !p)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  showBollinger ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                <span>BB</span>
              </button>
              <button
                onClick={() => setShowVolume((p) => !p)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  showVolume ? 'bg-[#2962ff]/20 text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                <span>Vol</span>
              </button>
            </div>
          </div>

          {/* Candle OHLC Hover Telemetry Banner */}
          {activeCandle && (
            <div className="flex flex-wrap items-center gap-4 border-b border-[#2a2e39]/60 px-4 py-1.5 text-[11px] font-mono tabular-nums text-[#787b86] dark:border-[#2a2e39]/60 light:border-[#e0e3eb]">
              <span>Date: <strong className="text-white dark:text-white light:text-[#131722]">{activeCandle.time}</strong></span>
              <span>O: <strong className="text-white dark:text-white light:text-[#131722]">{activeCandle.open}</strong></span>
              <span>H: <strong className="text-white dark:text-white light:text-[#131722]">{activeCandle.high}</strong></span>
              <span>L: <strong className="text-white dark:text-white light:text-[#131722]">{activeCandle.low}</strong></span>
              <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-[#089981]' : 'text-[#f23645]'}>{activeCandle.close}</strong></span>
              <span>Vol: <strong className="text-white dark:text-white light:text-[#131722]">{(activeCandle.volume / 1000000).toFixed(2)}M</strong></span>
            </div>
          )}

          {/* Chart Display Area with Left Tools Rail */}
          <div className="flex">
            {/* Left Drawing Tools Rail */}
            <div className="hidden sm:flex flex-col items-center gap-2 border-r border-[#2a2e39] py-3 px-1.5 bg-[#171b26] dark:border-[#2a2e39] dark:bg-[#171b26] light:border-[#e0e3eb] light:bg-[#f8f9fc]">
              {[
                { id: 'crosshair', icon: MousePointer, label: 'Crosshair' },
                { id: 'trend', icon: Minus, label: 'Trend Line' },
                { id: 'ray', icon: PenTool, label: 'Horizontal Ray' },
                { id: 'fib', icon: Hash, label: 'Fibonacci' },
                { id: 'measure', icon: Ruler, label: 'Measure' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={tool.label}
                  className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
                    activeTool === tool.id
                      ? 'bg-[#2962ff] text-white shadow-xs'
                      : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] dark:hover:bg-[#2a2e39] light:hover:bg-[#e0e3eb]'
                  }`}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* SVG Interactive Canvas */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full cursor-crosshair select-none bg-[#131722] dark:bg-[#131722] light:bg-[#ffffff]"
              style={{ height: '440px' }}
            >
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-hidden"
              >
                {/* Horizontal Grid Lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                  const y = mainPlotHeight * ratio + 20;
                  const priceLabel = maxPrice - (maxPrice - minPrice) * ratio;
                  return (
                    <g key={ratio}>
                      <line
                        x1="0"
                        y1={y}
                        x2={chartWidth - 65}
                        y2={y}
                        stroke="#2a2e39"
                        strokeDasharray="3 3"
                        strokeOpacity="0.4"
                      />
                      <text
                        x={chartWidth - 60}
                        y={y + 4}
                        fill="#787b86"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {priceLabel > 100 ? priceLabel.toFixed(1) : priceLabel.toFixed(3)}
                      </text>
                    </g>
                  );
                })}

                {/* Bollinger Bands Shading & Lines */}
                {showBollinger && (
                  <>
                    <path
                      d={`M ${candles
                        .map((_, i) => {
                          const x = i * candleSpacing + candleSpacing / 2;
                          const y = bollingerUpper[i] ? getY(bollingerUpper[i]!) : getY(candles[i].close);
                          return `${x},${y}`;
                        })
                        .join(' L ')} L ${candles
                        .slice()
                        .reverse()
                        .map((_, idx) => {
                          const i = candles.length - 1 - idx;
                          const x = i * candleSpacing + candleSpacing / 2;
                          const y = bollingerLower[i] ? getY(bollingerLower[i]!) : getY(candles[i].close);
                          return `${x},${y}`;
                        })
                        .join(' L ')} Z`}
                      fill="#8b5cf6"
                      fillOpacity="0.08"
                    />
                    {/* Upper line */}
                    <path
                      d={`M ${candles
                        .map((_, i) => {
                          const x = i * candleSpacing + candleSpacing / 2;
                          const y = bollingerUpper[i] ? getY(bollingerUpper[i]!) : getY(candles[i].close);
                          return `${x},${y}`;
                        })
                        .join(' L ')}`}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="1.2"
                      strokeOpacity="0.6"
                    />
                    {/* Lower line */}
                    <path
                      d={`M ${candles
                        .map((_, i) => {
                          const x = i * candleSpacing + candleSpacing / 2;
                          const y = bollingerLower[i] ? getY(bollingerLower[i]!) : getY(candles[i].close);
                          return `${x},${y}`;
                        })
                        .join(' L ')}`}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="1.2"
                      strokeOpacity="0.6"
                    />
                  </>
                )}

                {/* Volume Histogram */}
                {showVolume &&
                  candles.map((candle, i) => {
                    const x = i * candleSpacing + (candleSpacing - candleBodyWidth) / 2;
                    const vHeight = (candle.volume / maxVolume) * volumeHeight;
                    const y = chartHeight - vHeight - 15;
                    const isBull = candle.close >= candle.open;
                    return (
                      <rect
                        key={`vol-${i}`}
                        x={x}
                        y={y}
                        width={candleBodyWidth}
                        height={vHeight}
                        fill={isBull ? '#089981' : '#f23645'}
                        fillOpacity="0.35"
                      />
                    );
                  })}

                {/* Main Price Renderings */}
                {chartType === 'candlestick' &&
                  candles.map((candle, i) => {
                    const x = i * candleSpacing + (candleSpacing - candleBodyWidth) / 2;
                    const centerX = x + candleBodyWidth / 2;
                    const isBull = candle.close >= candle.open;
                    const topY = getY(Math.max(candle.open, candle.close));
                    const bottomY = getY(Math.min(candle.open, candle.close));
                    const highY = getY(candle.high);
                    const lowY = getY(candle.low);
                    const bodyHeight = Math.max(1.5, bottomY - topY);
                    const color = isBull ? '#089981' : '#f23645';

                    return (
                      <g key={i}>
                        {/* Upper & Lower Wick */}
                        <line x1={centerX} y1={highY} x2={centerX} y2={lowY} stroke={color} strokeWidth="1.2" />
                        {/* Body */}
                        <rect
                          x={x}
                          y={topY}
                          width={candleBodyWidth}
                          height={bodyHeight}
                          fill={color}
                          stroke={color}
                          strokeWidth="0.8"
                          rx="0.5"
                        />
                      </g>
                    );
                  })}

                {chartType === 'bars' &&
                  candles.map((candle, i) => {
                    const centerX = i * candleSpacing + candleSpacing / 2;
                    const isBull = candle.close >= candle.open;
                    const highY = getY(candle.high);
                    const lowY = getY(candle.low);
                    const openY = getY(candle.open);
                    const closeY = getY(candle.close);
                    const color = isBull ? '#089981' : '#f23645';

                    return (
                      <g key={`bar-${i}`}>
                        <line x1={centerX} y1={highY} x2={centerX} y2={lowY} stroke={color} strokeWidth="1.5" />
                        {/* Open Tick (Left) */}
                        <line x1={centerX - 4} y1={openY} x2={centerX} y2={openY} stroke={color} strokeWidth="1.5" />
                        {/* Close Tick (Right) */}
                        <line x1={centerX} y1={closeY} x2={centerX + 4} y2={closeY} stroke={color} strokeWidth="1.5" />
                      </g>
                    );
                  })}

                {(chartType === 'line' || chartType === 'area') && (
                  <>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2962ff" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {chartType === 'area' && (
                      <path
                        d={`M 0,${mainPlotHeight + 20} L ${candles
                          .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`)
                          .join(' L ')} L ${(candles.length - 1) * candleSpacing},${mainPlotHeight + 20} Z`}
                        fill="url(#areaGrad)"
                      />
                    )}
                    <path
                      d={`M ${candles
                        .map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`)
                        .join(' L ')}`}
                      fill="none"
                      stroke="#2962ff"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* EMA 20 Overlay Line */}
                {showEMA && (
                  <path
                    d={`M ${candles
                      .map((_, i) => `${i * candleSpacing + candleSpacing / 2},${getY(ema20[i] || candles[i].close)}`)
                      .join(' L ')}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.6"
                  />
                )}

                {/* SMA 50 Overlay Line */}
                {showSMA && (
                  <path
                    d={`M ${candles
                      .map((_, i) => `${i * candleSpacing + candleSpacing / 2},${getY(sma50[i] || candles[i].close)}`)
                      .join(' L ')}`}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.6"
                  />
                )}

                {/* Hover Crosshair Lines & Axis Tags */}
                {mousePos && (
                  <g>
                    {/* Vertical Hairline */}
                    <line
                      x1={mousePos.x}
                      y1="0"
                      x2={mousePos.x}
                      y2={chartHeight - 15}
                      stroke="#787b86"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    {/* Horizontal Hairline */}
                    <line
                      x1="0"
                      y1={mousePos.y}
                      x2={chartWidth - 65}
                      y2={mousePos.y}
                      stroke="#787b86"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />

                    {/* Price Tag Box on Right Axis */}
                    {(() => {
                      const hoverPrice = maxPrice - ((mousePos.y - 20) / mainPlotHeight) * priceRange;
                      return (
                        <g transform={`translate(${chartWidth - 64}, ${mousePos.y - 10})`}>
                          <rect width="60" height="20" fill="#2962ff" rx="2" />
                          <text x="30" y="14" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {hoverPrice > 100 ? hoverPrice.toFixed(2) : hoverPrice.toFixed(4)}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Quick Trade / Paper Order Execution Panel (1 col) */}
        <div className="flex flex-col rounded-lg border border-[#2a2e39] bg-[#1e222d] p-4 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
          <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3 dark:border-[#2a2e39] light:border-[#e0e3eb]">
            <span className="font-bold text-white text-sm dark:text-white light:text-[#131722]">
              Order Simulator
            </span>
            <span className="text-[11px] font-mono text-[#089981] font-semibold">
              Paper Trading
            </span>
          </div>

          {/* Toast Notification */}
          {orderNotification && (
            <div className="mt-3 flex items-center gap-2 rounded bg-[#089981]/20 p-2 text-xs font-medium text-[#089981]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{orderNotification}</span>
            </div>
          )}

          {/* Buy / Sell Tab Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setTradeType('buy')}
              className={`py-2 text-xs font-bold rounded transition-colors ${
                tradeType === 'buy'
                  ? 'bg-[#089981] text-white shadow-xs'
                  : 'bg-[#2a2e39]/60 text-[#787b86] hover:text-[#d1d4dc] dark:bg-[#2a2e39]/60 light:bg-[#f0f3fa]'
              }`}
            >
              BUY / LONG
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`py-2 text-xs font-bold rounded transition-colors ${
                tradeType === 'sell'
                  ? 'bg-[#f23645] text-white shadow-xs'
                  : 'bg-[#2a2e39]/60 text-[#787b86] hover:text-[#d1d4dc] dark:bg-[#2a2e39]/60 light:bg-[#f0f3fa]'
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          {/* Order Details */}
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-medium text-[#787b86]">Market Price</label>
              <div className="mt-1 flex items-center justify-between rounded border border-[#2a2e39] bg-[#131722] px-3 py-2 font-mono font-bold text-white dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-[#f8f9fc] light:text-[#131722]">
                <span>${item.price.toFixed(2)}</span>
                <span className="text-[10px] text-[#787b86]">USD</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#787b86]">Quantity (Units / Shares)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded border border-[#2a2e39] bg-[#131722] px-3 py-2 font-mono font-bold text-white outline-none focus:border-[#2962ff] dark:border-[#2a2e39] dark:bg-[#131722] light:border-[#e0e3eb] light:bg-[#f8f9fc] light:text-[#131722]"
                />
              </div>
            </div>

            {/* Total Estimated Cost */}
            <div className="rounded bg-[#131722] p-3 border border-[#2a2e39] dark:bg-[#131722] dark:border-[#2a2e39] light:bg-[#f0f3fa] light:border-[#e0e3eb]">
              <div className="flex justify-between text-[#787b86]">
                <span>Order Total:</span>
                <span className="font-mono font-bold text-white dark:text-white light:text-[#131722]">
                  ${(item.price * tradeQuantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-[#787b86] text-[11px]">
                <span>Available Cash:</span>
                <span className="font-mono">${portfolioBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handlePlaceOrder}
              className={`w-full py-3 rounded text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 ${
                tradeType === 'buy' ? 'bg-[#089981]' : 'bg-[#f23645]'
              }`}
            >
              EXECUTE {tradeType.toUpperCase()} ORDER
            </button>
          </div>

          {/* Technical Summary Meter */}
          <div className="mt-6 pt-4 border-t border-[#2a2e39] dark:border-[#2a2e39] light:border-[#e0e3eb]">
            <div className="text-xs font-bold text-white mb-2 dark:text-white light:text-[#131722]">
              Technical Analysis Summary
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#787b86]">
              <span>Oscillators: <strong className="text-[#089981]">Buy</strong></span>
              <span>Moving Avg: <strong className="text-[#089981]">Strong Buy</strong></span>
            </div>
            <div className="mt-2 text-center">
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                  item.rating === 'Strong Buy'
                    ? 'bg-[#089981] text-white'
                    : item.rating === 'Buy'
                    ? 'bg-[#089981]/20 text-[#089981]'
                    : 'bg-[#2a2e39] text-[#b2b5be]'
                }`}
              >
                Overall: {item.rating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Financial Statistics & Metrics Grid */}
      <div className="rounded-lg border border-[#2a2e39] bg-[#1e222d] p-5 dark:border-[#2a2e39] dark:bg-[#1e222d] light:border-[#e0e3eb] light:bg-white light:shadow-sm">
        <h3 className="text-sm font-bold text-white mb-4 dark:text-white light:text-[#131722]">
          Key Statistics & Valuation Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 text-xs">
          <div>
            <div className="text-[#787b86]">Day Range</div>
            <div className="font-mono font-bold text-white mt-1 dark:text-white light:text-[#131722]">
              {item.low24h} - {item.high24h}
            </div>
          </div>
          <div>
            <div className="text-[#787b86]">52-Week Range</div>
            <div className="font-mono font-bold text-white mt-1 dark:text-white light:text-[#131722]">
              {item.low52w} - {item.high52w}
            </div>
          </div>
          <div>
            <div className="text-[#787b86]">Market Cap</div>
            <div className="font-mono font-bold text-white mt-1 dark:text-white light:text-[#131722]">
              {item.marketCap || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[#787b86]">P/E Ratio</div>
            <div className="font-mono font-bold text-white mt-1 dark:text-white light:text-[#131722]">
              {item.pe ? item.pe.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[#787b86]">Dividend Yield</div>
            <div className="font-mono font-bold text-white mt-1 dark:text-white light:text-[#131722]">
              {item.dividendYield ? `${item.dividendYield.toFixed(2)}%` : 'None'}
            </div>
          </div>
          <div>
            <div className="text-[#787b86]">Beta (1Y)</div>
            <div className="font-mono font-bold text-white mt-1 dark:text-white light:text-[#131722]">
              {item.beta ? item.beta.toFixed(2) : '1.00'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
