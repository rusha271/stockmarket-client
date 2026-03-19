'use client';

import React, { useState, useEffect } from 'react';
import { getFiveMinSlots, getMsUntilNextFiveMinBoundary, isMarketOpen } from '@/utils/timeSlots';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StockSearch, nifty50Stocks } from './StockSearch';
import { StockDisplay } from './StockDisplay';
import { AIPrediction } from './AIPrediction';

export interface StockQuoteFromAPI {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  time: string;
  marketCap?: string | number;
  pe?: number;
  high52?: number;
  low52?: number;
  dividendYield?: number;
  dividendAmount?: number;
  quarterlyDividendAmount?: number;
}

interface StockOption {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
}

interface PredictionResult {
  predictedPrice: number;
  confidence: number;
  direction: 'up' | 'down' | 'neutral';
  timeframe: string;
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    technical: number;
    fundamental: number;
    sentiment: number;
  };
}

interface ProfilingPredictionRow {
  symbol: string;
  currentPrice: number | null;
  predictedPrice: number | null;
}

const PROFILE_REFRESH_MS = 5 * 60 * 1000;

export const AIPredictionDashboard: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuoteFromAPI | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [_predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [profileSelectedSymbols, setProfileSelectedSymbols] = useState<string[]>([]);
  const [profileStagingSymbols, setProfileStagingSymbols] = useState<string[]>([]);
  const [leftActiveSymbol, setLeftActiveSymbol] = useState<string | null>(null);
  const [rightActiveSymbol, setRightActiveSymbol] = useState<string | null>(null);
  const [dragSymbol, setDragSymbol] = useState<string | null>(null);
  const [profileRows, setProfileRows] = useState<ProfilingPredictionRow[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLastRunAt, setProfileLastRunAt] = useState<string | null>(null);
  const [profileNextRunIn, setProfileNextRunIn] = useState<number>(PROFILE_REFRESH_MS / 1000);
  const [profileTimeSlots, setProfileTimeSlots] = useState<{
    currentSlot: string;
    predictionTargetSlot: string;
  } | null>(null);
  const theme = useTheme();

  const handleStockSelect = (stock: StockOption | null) => {
    setSelectedStock(stock);
    setStockQuote(null);
    setPredictionResult(null);
  };

  useEffect(() => {
    if (!selectedStock?.symbol) {
      setStockQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    fetch(`/api/stock-quote?symbol=${encodeURIComponent(selectedStock.symbol)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StockQuoteFromAPI | null) => {
        if (!cancelled && data?.symbol) setStockQuote(data);
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStock?.symbol]);

  const handlePredictionComplete = (result: PredictionResult) => {
    setPredictionResult(result);
  };

  const availableProfileStocks = nifty50Stocks.filter(
    (stock) => !profileStagingSymbols.includes(stock.symbol)
  );
  const selectedProfileStocks = nifty50Stocks.filter((stock) =>
    profileStagingSymbols.includes(stock.symbol)
  );

  const moveLeftToRight = (symbol?: string) => {
    const target = symbol ?? leftActiveSymbol;
    if (!target || profileStagingSymbols.includes(target)) return;
    setProfileStagingSymbols((prev) => [...prev, target]);
    setLeftActiveSymbol(null);
  };

  const moveRightToLeft = (symbol?: string) => {
    const target = symbol ?? rightActiveSymbol;
    if (!target) return;
    setProfileStagingSymbols((prev) => prev.filter((s) => s !== target));
    setRightActiveSymbol(null);
  };

  const toggleProfileStock = (symbol: string) => {
    setProfileStagingSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setProfileStagingSymbols(checked ? nifty50Stocks.map((s) => s.symbol) : []);
  };

  const handleConfirmSelection = () => {
    setProfileSelectedSymbols([...profileStagingSymbols]);
    setLeftActiveSymbol(null);
    setRightActiveSymbol(null);
  };

  const runProfilePrediction = async (symbols: string[]) => {
    if (symbols.length === 0) {
      setProfileRows([]);
      setProfileError(null);
      setProfileLastRunAt(null);
      return;
    }
    if (!isMarketOpen()) {
      setProfileError('Market is closed. NSE hours: 9:15–15:30 IST (Mon–Fri)');
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    const slots = getFiveMinSlots();
    setProfileTimeSlots({
      currentSlot: slots.currentSlot,
      predictionTargetSlot: slots.predictionTargetSlot,
    });
    try {
      const res = await fetch('/api/ai-prediction/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols,
          current_time_slot: slots.currentSlot,
          prediction_target_time: slots.predictionTargetSlot,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg =
          typeof data?.error === 'string'
            ? data.error
            : `Request failed (${res.status})`;
        setProfileError(errMsg);
        return;
      }

      const rawRows = Array.isArray(data)
        ? data
        : Array.isArray(data?.predictions)
          ? data.predictions
          : Array.isArray(data?.data)
            ? data.data
            : [];

      const mapped = symbols.map((symbol) => {
        const item = rawRows.find(
          (r: unknown) =>
            r &&
            typeof r === 'object' &&
            'symbol' in r &&
            String((r as { symbol: unknown }).symbol).toUpperCase() === symbol
        ) as { predictedPrice?: unknown; predicted_price?: unknown; currentPrice?: unknown } | undefined;

        const predictedRaw = item?.predictedPrice ?? item?.predicted_price;
        const predictedPrice =
          typeof predictedRaw === 'number' && Number.isFinite(predictedRaw)
            ? predictedRaw
            : null;
        const currentPriceRaw = item?.currentPrice;
        const currentPrice =
          typeof currentPriceRaw === 'number' && Number.isFinite(currentPriceRaw)
            ? currentPriceRaw
            : null;

        return { symbol, currentPrice, predictedPrice };
      });

      setProfileRows(mapped);
      setProfileLastRunAt(
        new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date())
      );
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to fetch profiling prediction');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    setProfileRows((prev) =>
      prev.filter((row) => profileSelectedSymbols.includes(row.symbol))
    );
    if (isMarketOpen()) {
      void runProfilePrediction(profileSelectedSymbols);
    } else if (profileSelectedSymbols.length > 0) {
      setProfileError('Market is closed. NSE hours: 9:15–15:30 IST (Mon–Fri)');
    }
  }, [profileSelectedSymbols]);

  useEffect(() => {
    if (profileSelectedSymbols.length === 0) {
      setProfileNextRunIn(PROFILE_REFRESH_MS / 1000);
      setProfileTimeSlots(null);
      return;
    }
    if (!isMarketOpen()) {
      setProfileNextRunIn(0);
      setProfileTimeSlots(null);
      return;
    }

    const slots = getFiveMinSlots();
    setProfileTimeSlots({ currentSlot: slots.currentSlot, predictionTargetSlot: slots.predictionTargetSlot });

    // Align to 5-min boundaries (2:40, 2:45, 2:50...)
    const msUntilNext = getMsUntilNextFiveMinBoundary();
    setProfileNextRunIn(Math.ceil(msUntilNext / 1000));

    const countdown = setInterval(() => {
      if (!isMarketOpen()) {
        setProfileNextRunIn(0);
        return;
      }
      setProfileNextRunIn((prev) => {
        if (prev <= 1) {
          void runProfilePrediction(profileSelectedSymbols);
          return PROFILE_REFRESH_MS / 1000; // Next run in 5 mins
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [profileSelectedSymbols]);

  const formatMmSs = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getDirectionSymbol = (currentPrice: number | null, predictedPrice: number | null): string => {
    if (currentPrice == null || predictedPrice == null || !Number.isFinite(currentPrice) || !Number.isFinite(predictedPrice)) return '';
    const diff = predictedPrice - currentPrice;
    if (Math.abs(diff) <= 1.5) return ' →';
    return diff > 0 ? ' ↑' : ' ↓';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.gradient,
        p: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'light' 
            ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(34, 211, 238, 0.2) 0%, transparent 50%)',
          zIndex: -1,
        }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 4,
                background: theme.palette.mode === 'light' 
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: theme.palette.primary.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <TimelineIcon sx={{ fontSize: '2rem', color: 'white' }} />
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography 
                  variant="h3" 
                  fontWeight={900}
                  sx={{
                    background: theme.palette.primary.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Real Time Analysis
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Live market analysis and technical insights
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Search for any stock symbol or company name to get real-time analysis, 
              technical indicators, and market insights.
            </Typography>
          </Box>
        </Fade>

        {/* Search Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6 }}>
            <Paper
              sx={{
                p: 4,
                background: theme.palette.mode === 'light' 
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SearchIcon sx={{ color: theme.palette.primary.main, fontSize: '1.5rem' }} />
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Search Stocks
                </Typography>
              </Box>
              <StockSearch 
                onStockSelect={handleStockSelect}
                selectedStock={selectedStock}
                quoteOHLC={stockQuote}
                quoteLoading={quoteLoading}
              />
            </Paper>
          </Box>
        </Fade>

        <Fade in timeout={900}>
          <Box sx={{ mb: 6 }}>
            <Paper
              sx={{
                p: 3,
                background:
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Profiling (Nifty 50)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select stocks with checkboxes, arrow buttons, or drag-and-drop. Click Confirm to apply.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Paper
                  variant="outlined"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const symbol = e.dataTransfer.getData('text/plain');
                    if (symbol) moveRightToLeft(symbol);
                    setDragSymbol(null);
                  }}
                  sx={{ flex: 1, minHeight: 280 }}
                >
                  <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      size="small"
                      checked={profileStagingSymbols.length === nifty50Stocks.length}
                      indeterminate={
                        profileStagingSymbols.length > 0 &&
                        profileStagingSymbols.length < nifty50Stocks.length
                      }
                      onChange={(_, checked) => handleSelectAll(checked)}
                    />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Nifty 50 — Select All ({profileStagingSymbols.length}/50)
                    </Typography>
                  </Box>
                  <Divider />
                  <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
                    {nifty50Stocks.map((s) => {
                      const isSelected = profileStagingSymbols.includes(s.symbol);
                      return (
                        <ListItem key={s.symbol} disablePadding dense>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => toggleProfileStock(s.symbol)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </ListItemIcon>
                          <ListItemButton
                            selected={leftActiveSymbol === s.symbol}
                            onClick={() => {
                              setLeftActiveSymbol(s.symbol);
                              if (!isSelected) moveLeftToRight(s.symbol);
                            }}
                            draggable={isSelected}
                            onDragStart={(e) => {
                              if (isSelected) {
                                e.dataTransfer.setData('text/plain', s.symbol);
                                e.dataTransfer.effectAllowed = 'move';
                                setDragSymbol(s.symbol);
                              }
                            }}
                            onDragEnd={() => setDragSymbol(null)}
                            sx={{
                              flex: 1,
                              cursor: isSelected ? 'grab' : 'pointer',
                              '&:active': isSelected ? { cursor: 'grabbing' } : {},
                            }}
                          >
                            <ListItemText primary={s.symbol} secondary={s.name} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => moveLeftToRight()}
                    disabled={!leftActiveSymbol}
                    startIcon={<ArrowForwardIcon />}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => moveRightToLeft()}
                    disabled={!rightActiveSymbol}
                    startIcon={<ArrowBackIcon />}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={handleConfirmSelection}
                    disabled={profileStagingSymbols.length === 0}
                    sx={{ mt: { md: 1 } }}
                  >
                    Confirm
                  </Button>
                </Box>

                <Paper
                  variant="outlined"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const symbol = e.dataTransfer.getData('text/plain');
                    if (symbol && availableProfileStocks.some((s) => s.symbol === symbol)) {
                      moveLeftToRight(symbol);
                    }
                    setDragSymbol(null);
                  }}
                  sx={{ flex: 1, minHeight: 280 }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Selected ({selectedProfileStocks.length})
                    </Typography>
                  </Box>
                  <Divider />
                  <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
                    {selectedProfileStocks.length === 0 ? (
                      <Box sx={{ px: 2, py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Select stocks with checkboxes or drag from left.
                        </Typography>
                      </Box>
                    ) : (
                      selectedProfileStocks.map((s) => {
                        const row = profileRows.find((r) => r.symbol === s.symbol);
                        return (
                          <ListItem key={s.symbol} disablePadding dense>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Checkbox
                                size="small"
                                checked
                                onChange={() => toggleProfileStock(s.symbol)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </ListItemIcon>
                            <ListItemButton
                              selected={rightActiveSymbol === s.symbol}
                              onClick={() => setRightActiveSymbol(s.symbol)}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', s.symbol);
                                e.dataTransfer.effectAllowed = 'move';
                                setDragSymbol(s.symbol);
                              }}
                              onDragEnd={() => setDragSymbol(null)}
                              sx={{
                                flex: 1,
                                cursor: 'grab',
                                transition: 'background-color 0.2s ease, transform 0.15s ease',
                                '&:active': { cursor: 'grabbing', transform: 'scale(0.995)' },
                              }}
                            >
                              <ListItemText
                                primary={s.symbol}
                                secondary={
                                  `Current: ${
                                    row?.currentPrice != null
                                      ? `₹${row.currentPrice.toLocaleString('en-IN', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}`
                                      : '--'
                                  } | Predicted: ${
                                    row?.predictedPrice != null
                                      ? `₹${row.predictedPrice.toLocaleString('en-IN', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}${getDirectionSymbol(row.currentPrice, row.predictedPrice)}`
                                      : '--'
                                  }`
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })
                    )}
                  </List>
                </Paper>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                {profileTimeSlots && (
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Current: {profileTimeSlots.currentSlot} | Predicting: {profileTimeSlots.predictionTargetSlot}
                  </Typography>
                )}
                {isMarketOpen() ? (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      Auto refresh: every 5 mins (aligned to 5-min boundaries)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Next run in: {formatMmSs(profileNextRunIn)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" color="warning.main" fontWeight={600}>
                    Market closed (NSE: 9:15–15:30 IST, Mon–Fri)
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Last run: {profileLastRunAt ?? '--:--:--'}
                </Typography>
                {profileLoading && (
                  <Typography variant="caption" color="primary.main">
                    Fetching...
                  </Typography>
                )}
                {profileError && (
                  <Typography variant="caption" color="error.main">
                    {profileError}
                  </Typography>
                )}
                {dragSymbol && (
                  <Typography variant="caption" color="text.secondary">
                    Dragging: {dragSymbol}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Fade>

        {/* Main Content Grid */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Stock Display */}
          <Box sx={{ flex: 1 }}>
            <Zoom in timeout={1000}>
              <Box>
                <StockDisplay stock={selectedStock} quote={stockQuote} quoteLoading={quoteLoading} />
              </Box>
            </Zoom>
          </Box>

          {/* AI Prediction */}
          <Box sx={{ flex: 1 }}>
            <Zoom in timeout={1200}>
              <Box>
                <AIPrediction 
                  stock={selectedStock}
                  currentPrice={stockQuote?.close}
                  onPredictionComplete={handlePredictionComplete}
                />
              </Box>
            </Zoom>
          </Box>
        </Box>

        {/* Features Section - Single Row */}
        <Fade in timeout={1400}>
          <Box sx={{ mt: { xs: 6, md: 8 }, px: { xs: 0.5, sm: 0 } }}>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ textAlign: 'center', mb: { xs: 3, md: 4 }, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
              Features
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: 'center',
                    background: theme.palette.mode === 'light' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                >
                  <TimelineIcon sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1.5, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
                    Real Time Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Live market data, technical indicators, and price action are analyzed to produce predicted levels, confidence, and timeframe for your reference.
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: 'center',
                    background: theme.palette.mode === 'light' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src="/Gemini_Generated_Image_o5gli0o5gli0o5gl.svg"
                      alt="EquaityWaves.ai Logo"
                      sx={{ 
                        width: '2.5rem', 
                        height: '2.5rem', 
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1.5, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
                    Real-time Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Live data streams are continuously analyzed to detect trend shifts, volatility changes, and momentum signals — enabling faster and more informed trading decisions.
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: 'center',
                    background: theme.palette.mode === 'light' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                >
                  <TimelineIcon sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1.5, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
                    Risk Assessment
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    Comprehensive risk analysis with confidence levels and market sentiment evaluation for informed decisions.
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};
