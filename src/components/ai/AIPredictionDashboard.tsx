'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StockSearch } from './StockSearch';
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

export const AIPredictionDashboard: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuoteFromAPI | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [_predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
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
