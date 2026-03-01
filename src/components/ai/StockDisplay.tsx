'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  alpha,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface StockData {
  symbol: string;
  name: string;
  currentPrice?: number;
  price?: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  previousClose?: number;
}

interface QuoteData {
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

interface StockDisplayProps {
  stock: StockData | null;
  isLoading?: boolean;
  quote?: QuoteData | null;
  quoteLoading?: boolean;
}

export const StockDisplay: React.FC<StockDisplayProps> = ({ stock, isLoading: _isLoading = false, quote: quoteFromParent, quoteLoading: quoteLoadingFromParent = false }) => {
  const [quoteLocal, setQuoteLocal] = useState<QuoteData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const theme = useTheme();
  const quote = quoteFromParent !== undefined ? quoteFromParent : quoteLocal;
  const dataLoadingOrQuoteLoading = quoteFromParent !== undefined ? quoteLoadingFromParent : dataLoading;

  useEffect(() => {
    if (quoteFromParent !== undefined) return;
    if (!stock?.symbol) {
      setQuoteLocal(null);
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    setQuoteLocal(null);
    fetch(`/api/stock-quote?symbol=${encodeURIComponent(stock.symbol)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((quoteRes) => {
        if (!cancelled && quoteRes?.symbol) setQuoteLocal(quoteRes);
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stock?.symbol, quoteFromParent]);

  if (!stock) {
    return (
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          textAlign: 'center',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: 2, md: 4 },
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <TimelineIcon sx={{ fontSize: { xs: '3rem', md: '4rem' }, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>
          Select a stock to view detailed information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
          Use the search above to find and select a stock
        </Typography>
      </Paper>
    );
  }

  const currentPrice = quote?.close ?? stock.currentPrice ?? stock.price ?? 0;
  const change = quote ? quote.change : stock.change;
  const changePercent = quote ? quote.changePercent : stock.changePercent;
  const volume = quote?.volume != null && quote.volume > 0 ? quote.volume : (stock.volume ?? 0);
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'success.main' : 'error.main';
  const high = quote?.high ?? stock.high ?? currentPrice * 1.05;
  const low = quote?.low ?? stock.low ?? currentPrice * 0.95;
  const open = quote?.open ?? stock.open ?? currentPrice;
  const _close = quote?.close ?? stock.close ?? currentPrice;

  return (
    <Fade in={!!stock} timeout={500}>
      <Paper
        sx={{
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: 2, md: 4 },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Stock Header - Compact */}
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: '1 1 auto' }}>
              <Chip
                label={stock.symbol}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                }}
              />
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, wordBreak: 'break-word' }}>
                {stock.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isPositive ? (
                <TrendingUpIcon sx={{ color: changeColor, fontSize: '1.25rem' }} />
              ) : (
                <TrendingDownIcon sx={{ color: changeColor, fontSize: '1.25rem' }} />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ flex: '1 1 min(100%, 120px)', textAlign: 'center', p: { xs: 0.75, sm: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                Current Price
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                ₹{currentPrice.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 min(100%, 120px)', textAlign: 'center', p: { xs: 0.75, sm: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                Change
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: changeColor, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                {isPositive ? '+' : ''}{change.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 min(100%, 120px)', textAlign: 'center', p: { xs: 0.75, sm: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                Change %
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: changeColor, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 min(100%, 120px)', textAlign: 'center', p: { xs: 0.75, sm: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                Volume
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                {volume > 0
                  ? volume >= 1000000
                    ? `${(volume / 1000000).toFixed(1)}M`
                    : volume >= 1000
                      ? `${(volume / 1000).toFixed(1)}K`
                      : volume.toLocaleString('en-IN')
                  : '—'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Key metrics: P/E ratio, 52-wk high, 52-wk low only */}
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          {dataLoadingOrQuoteLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3, gap: 2 }}>
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary">Loading...</Typography>
            </Box>
          )}
          {!dataLoadingOrQuoteLoading && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ flex: '1 1 min(80px, 33%)', minWidth: 0, textAlign: 'center', p: { xs: 1, sm: 1.5 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>P/E ratio</Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {quote?.pe && quote.pe > 0 ? quote.pe.toFixed(2) : '—'}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 min(80px, 33%)', minWidth: 0, textAlign: 'center', p: { xs: 1, sm: 1.5 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>52-wk high</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {quote?.high52 && quote.high52 > 0 ? `₹${quote.high52.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 min(80px, 33%)', minWidth: 0, textAlign: 'center', p: { xs: 1, sm: 1.5 } }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>52-wk low</Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {quote?.low52 && quote.low52 > 0 ? `₹${quote.low52.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Day High / Low / Open */}
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pt: 0, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ flex: '1 1 min(100%, 80px)', textAlign: 'center', p: { xs: 0.75, sm: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>High</Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>₹{high.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 min(100%, 80px)', textAlign: 'center', p: { xs: 0.75, sm: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Low</Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>₹{low.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 min(100%, 80px)', textAlign: 'center', p: { xs: 0.75, sm: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Open</Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>₹{open.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};
