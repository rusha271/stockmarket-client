'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Stack,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { nifty50Stocks } from './StockSearch';
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
const AI_DISCLAIMER_KEY = 'ai_prediction_disclaimer_choice_v1';

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
  const [mobileExpandedSection, setMobileExpandedSection] = useState<'available' | 'selected'>('available');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [disclaimerDeclined, setDisclaimerDeclined] = useState(false);
  const lastClosedRunSignatureRef = useRef<string | null>(null);
  const theme = useTheme();
  const isMobileLayout = useMediaQuery(theme.breakpoints.down('md'));
  const totalProfileStocks = nifty50Stocks.length;

  const _handleStockSelect = (stock: StockOption | null) => {
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
    setProfileStagingSymbols((prev) => {
      if (prev.includes(symbol)) {
        if (leftActiveSymbol === symbol) setLeftActiveSymbol(null);
        if (rightActiveSymbol === symbol) setRightActiveSymbol(null);
        return prev.filter((s) => s !== symbol);
      }
      return [...prev, symbol];
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setProfileStagingSymbols(checked ? nifty50Stocks.map((s) => s.symbol) : []);
  };

  const handleConfirmSelection = () => {
    setProfileSelectedSymbols([...profileStagingSymbols]);
    setLeftActiveSymbol(null);
    setRightActiveSymbol(null);
    if (isMobileLayout) {
      setMobileExpandedSection('selected');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedChoice = window.localStorage.getItem(AI_DISCLAIMER_KEY);
    if (savedChoice === 'declined') {
      setDisclaimerDeclined(true);
      return;
    }
    if (savedChoice !== 'accepted') {
      setDisclaimerOpen(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AI_DISCLAIMER_KEY, 'accepted');
    }
    setDisclaimerDeclined(false);
    setDisclaimerOpen(false);
  };

  const handleDeclineDisclaimer = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AI_DISCLAIMER_KEY, 'declined');
    }
    setDisclaimerDeclined(true);
    setDisclaimerOpen(false);
  };

  const profilingDirty = useMemo(() => {
    const a = [...profileStagingSymbols].sort().join('\u0000');
    const b = [...profileSelectedSymbols].sort().join('\u0000');
    return a !== b;
  }, [profileStagingSymbols, profileSelectedSymbols]);

  const runProfilePrediction = async (symbols: string[]) => {
    if (symbols.length === 0) {
      setProfileRows([]);
      setProfileError(null);
      setProfileLastRunAt(null);
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
    if (profileSelectedSymbols.length === 0) {
      lastClosedRunSignatureRef.current = null;
      return;
    }

    if (isMarketOpen()) {
      lastClosedRunSignatureRef.current = null;
      void runProfilePrediction(profileSelectedSymbols);
      return;
    }

    const signature = [...profileSelectedSymbols].sort().join('|');
    if (lastClosedRunSignatureRef.current === signature) return;
    lastClosedRunSignatureRef.current = signature;
    void runProfilePrediction(profileSelectedSymbols);
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
        p: { xs: 1.5, sm: 2, md: 4 },
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
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {disclaimerDeclined && (
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
            }}
          >
            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
              AI predictions are informational and may be inaccurate. Review risk before trading.
            </Typography>
            <Button size="small" variant="outlined" onClick={() => setDisclaimerOpen(true)}>
              Review disclaimer
            </Button>
          </Paper>
        )}

        <Dialog open={disclaimerOpen} onClose={handleDeclineDisclaimer} maxWidth="sm" fullWidth>
          <DialogTitle>AI Prediction Disclaimer</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              This dashboard provides AI-based predictions for educational and informational use only.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              It is not financial advice. Markets are risky and outcomes are not guaranteed. Please verify
              with your own analysis before making investment decisions.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDeclineDisclaimer} color="inherit">
              Decline
            </Button>
            <Button onClick={handleAcceptDisclaimer} variant="contained">
              Accept
            </Button>
          </DialogActions>
        </Dialog>

        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4, md: 6 } }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1.5, sm: 2 },
                p: { xs: 2, sm: 3 },
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
                  p: { xs: 1.5, sm: 2 },
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
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography 
                  variant="h3" 
                  fontWeight={900}
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.4rem', md: '3rem' },
                    lineHeight: 1.1,
                    background: theme.palette.primary.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Real Time Analysis
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontWeight: 500, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}
                >
                  Live market analysis and technical insights
                </Typography>
              </Box>
            </Box>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', px: { xs: 1, sm: 0 }, fontSize: { xs: '1rem', sm: '1.05rem' } }}
            >
              Search for any stock symbol or company name to get real-time analysis, 
              technical indicators, and market insights.
            </Typography>
          </Box>
        </Fade>

        {/* Search Section */}
        {/* <Fade in timeout={800}>
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
                onStockSelect={_handleStockSelect}
                selectedStock={selectedStock}
                quoteOHLC={stockQuote}
                quoteLoading={quoteLoading}
              />
            </Paper>
          </Box>
        </Fade> */}

        <Fade in timeout={900}>
          <Box sx={{ mb: 6 }}>
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
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
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                Profiling (Nifty 50)
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, lineHeight: 1.45, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Use checkboxes to select or deselect stocks, then tap Confirm to apply your changes.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  {isMobileLayout ? (
                    <Accordion
                      expanded={mobileExpandedSection === 'available'}
                      onChange={(_, expanded) =>
                        setMobileExpandedSection(expanded ? 'available' : 'selected')
                      }
                      disableGutters
                      sx={{ borderRadius: 2, overflow: 'hidden' }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            size="small"
                            checked={profileStagingSymbols.length === nifty50Stocks.length}
                            indeterminate={
                              profileStagingSymbols.length > 0 &&
                              profileStagingSymbols.length < nifty50Stocks.length
                            }
                            onChange={(_, checked) => handleSelectAll(checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Typography variant="subtitle2" fontWeight={700}>
                            Nifty 50 ({profileStagingSymbols.length}/{totalProfileStocks})
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <List dense sx={{ maxHeight: 280, overflowY: 'auto' }}>
                          {nifty50Stocks.map((s) => {
                            const isSelected = profileStagingSymbols.includes(s.symbol);
                            return (
                              <ListItem key={s.symbol} disablePadding dense>
                                <ListItemIcon sx={{ minWidth: 46 }}>
                                  <Checkbox
                                    size="medium"
                                    checked={isSelected}
                                    onChange={() => toggleProfileStock(s.symbol)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </ListItemIcon>
                                <ListItemButton
                                  selected={leftActiveSymbol === s.symbol}
                                  onClick={() => setLeftActiveSymbol(s.symbol)}
                                  sx={{ minHeight: 52 }}
                                >
                                  <ListItemText primary={s.symbol} secondary={s.name} />
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Paper
                      variant="outlined"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const symbol = e.dataTransfer.getData('text/plain');
                        if (symbol) moveRightToLeft(symbol);
                        setDragSymbol(null);
                      }}
                      sx={{ minHeight: { xs: 220, sm: 280 } }}
                    >
                      <Box sx={{ px: { xs: 1.25, sm: 2 }, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          size={isMobileLayout ? 'medium' : 'small'}
                          checked={profileStagingSymbols.length === nifty50Stocks.length}
                          indeterminate={
                            profileStagingSymbols.length > 0 &&
                            profileStagingSymbols.length < nifty50Stocks.length
                          }
                          onChange={(_, checked) => handleSelectAll(checked)}
                        />
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Nifty 50 — Select All ({profileStagingSymbols.length}/{totalProfileStocks})
                        </Typography>
                      </Box>
                      <Divider />
                      <List dense sx={{ maxHeight: { xs: 250, sm: 320 }, overflowY: 'auto' }}>
                        {nifty50Stocks.map((s) => {
                          const isSelected = profileStagingSymbols.includes(s.symbol);
                          return (
                            <ListItem key={s.symbol} disablePadding dense>
                              <ListItemIcon sx={{ minWidth: { xs: 48, sm: 40 } }}>
                                <Checkbox
                                  size={isMobileLayout ? 'medium' : 'small'}
                                  checked={isSelected}
                                  onChange={() => toggleProfileStock(s.symbol)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </ListItemIcon>
                              <ListItemButton
                                selected={leftActiveSymbol === s.symbol}
                                onClick={() => {
                                  setLeftActiveSymbol(s.symbol);
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
                                  minHeight: { xs: 52, sm: 48 },
                                  py: { xs: 0.75, sm: 0.5 },
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
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1, md: 1 },
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { md: 120 },
                  }}
                >
                  <Button
                    variant="contained"
                    size={isMobileLayout ? 'medium' : 'small'}
                    onClick={() => moveLeftToRight()}
                    disabled
                    startIcon={<ArrowForwardIcon />}
                    fullWidth={isMobileLayout}
                    sx={{ minHeight: { xs: 48, md: 'auto' } }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outlined"
                    size={isMobileLayout ? 'medium' : 'small'}
                    onClick={() => moveRightToLeft()}
                    disabled
                    startIcon={<ArrowBackIcon />}
                    fullWidth={isMobileLayout}
                    sx={{ minHeight: { xs: 48, md: 'auto' } }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size={isMobileLayout ? 'medium' : 'small'}
                    onClick={handleConfirmSelection}
                    disabled={!profilingDirty}
                    fullWidth={isMobileLayout}
                    sx={{ minHeight: { xs: 48, md: 'auto' }, mt: { md: 1 } }}
                  >
                    Confirm
                  </Button>
                  {isMobileLayout && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setMobileExpandedSection('available')}
                    >
                      Select more stocks
                    </Button>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  {isMobileLayout ? (
                    <Accordion
                      expanded={mobileExpandedSection === 'selected'}
                      onChange={(_, expanded) =>
                        setMobileExpandedSection(expanded ? 'selected' : 'available')
                      }
                      disableGutters
                      sx={{ borderRadius: 2, overflow: 'hidden' }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Selected ({selectedProfileStocks.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <List dense sx={{ maxHeight: 280, overflowY: 'auto' }}>
                          {selectedProfileStocks.length === 0 ? (
                            <Box sx={{ px: 2, py: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Select stocks with checkboxes from Nifty 50.
                              </Typography>
                            </Box>
                          ) : (
                            selectedProfileStocks.map((s) => {
                              const row = profileRows.find((r) => r.symbol === s.symbol);
                              return (
                                <ListItem key={s.symbol} disablePadding dense>
                                  <ListItemIcon sx={{ minWidth: 46, alignSelf: 'flex-start', mt: 0.5 }}>
                                    <Checkbox
                                      size="medium"
                                      checked
                                      onChange={() => toggleProfileStock(s.symbol)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </ListItemIcon>
                                  <ListItemButton
                                    selected={rightActiveSymbol === s.symbol}
                                    onClick={() => setRightActiveSymbol(s.symbol)}
                                    sx={{ alignItems: 'flex-start', minHeight: 56, py: 1 }}
                                  >
                                    <ListItemText
                                      primary={s.symbol}
                                      primaryTypographyProps={{ sx: { fontWeight: 700 } }}
                                      secondaryTypographyProps={{ component: 'div' }}
                                      secondary={
                                        <Stack spacing={0.35} sx={{ mt: 0.25 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35, fontSize: '0.78rem' }}>
                                            Current:{' '}
                                            {row?.currentPrice != null
                                              ? `₹${row.currentPrice.toLocaleString('en-IN', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })}`
                                              : '--'}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35, fontSize: '0.78rem' }}>
                                            Predicted:{' '}
                                            {row?.predictedPrice != null
                                              ? `₹${row.predictedPrice.toLocaleString('en-IN', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })}${getDirectionSymbol(row.currentPrice, row.predictedPrice)}`
                                              : '--'}
                                          </Typography>
                                        </Stack>
                                      }
                                    />
                                  </ListItemButton>
                                </ListItem>
                              );
                            })
                          )}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
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
                      sx={{ minHeight: { xs: 220, sm: 280 } }}
                    >
                      <Box sx={{ px: { xs: 1.25, sm: 2 }, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Selected ({selectedProfileStocks.length})
                        </Typography>
                      </Box>
                      <Divider />
                      <List dense sx={{ maxHeight: { xs: 250, sm: 320 }, overflowY: 'auto' }}>
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
                                <ListItemIcon sx={{ minWidth: { xs: 48, sm: 40 }, alignSelf: 'flex-start', mt: 0.5 }}>
                                  <Checkbox
                                    size={isMobileLayout ? 'medium' : 'small'}
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
                                    alignItems: 'flex-start',
                                    minHeight: { xs: 56, sm: 48 },
                                    py: { xs: 1, sm: 0.5 },
                                    cursor: 'grab',
                                    transition: 'background-color 0.2s ease, transform 0.15s ease',
                                    '&:active': { cursor: 'grabbing', transform: 'scale(0.995)' },
                                  }}
                                >
                                  <ListItemText
                                    primary={s.symbol}
                                    primaryTypographyProps={{ sx: { fontWeight: 700 } }}
                                    secondaryTypographyProps={{ component: 'div' }}
                                    secondary={
                                      <Stack spacing={0.35} sx={{ mt: 0.25 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                                          Current:{' '}
                                          {row?.currentPrice != null
                                            ? `₹${row.currentPrice.toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}`
                                            : '--'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                                          Predicted:{' '}
                                          {row?.predictedPrice != null
                                            ? `₹${row.predictedPrice.toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}${getDirectionSymbol(row.currentPrice, row.predictedPrice)}`
                                            : '--'}
                                        </Typography>
                                      </Stack>
                                    }
                                  />
                                </ListItemButton>
                              </ListItem>
                            );
                          })
                        )}
                      </List>
                    </Paper>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 2 },
                  alignItems: { xs: 'stretch', sm: 'center' },
                }}
              >
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
