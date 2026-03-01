'use client';

import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMarketIndices } from '@/hooks/useMarketIndices';
import { useAPICounter } from '@/context/APICounterContext';
// import { Stock } from '@/types/stock';
import StockCard from '@/components/stocks/StockCard';
// import PrimeStockTable from '@/components/common/PrimeStockTable';
// import SearchBar from '@/components/common/SearchBar';
import CustomButton from '@/components/common/CustomButton';
import Layout from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AIPredictionDashboard } from '@/components/ai/AIPredictionDashboard';
import { NoSSR } from '@/components/common/NoSSR';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// Removed Grid import - using Box instead
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  Refresh as RefreshIcon,
  // Star as StarIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

// Lazy load heavy chart components with better loading
const LineChart = lazy(() => import('@/components/charts/LineChart'));
const BarChart = lazy(() => import('@/components/charts/BarChart'));

// Indian Equity Market Data - Updated with real market data
const indianStocks = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    price: 2456.50,
    change: 45.20,
    changePercent: 1.87,
    volume: '2.5M',
    marketCap: '16.6L Cr',
    sector: 'Energy',
    exchange: 'NSE',
    isFavorite: false,
    high52w: 2850.00,
    low52w: 2100.00,
    pe: 18.5,
    dividend: 2.1,
    predictedPrice: 2479.47,
    trend: 'up'
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    price: 3845.75,
    change: -25.30,
    changePercent: -0.65,
    volume: '1.2M',
    marketCap: '14.1L Cr',
    sector: 'IT',
    exchange: 'NSE',
    isFavorite: true,
    high52w: 4200.00,
    low52w: 3200.00,
    pe: 25.2,
    dividend: 1.8,
    predictedPrice: 3833.25,
    trend: 'down'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    price: 1654.20,
    change: 12.80,
    changePercent: 0.78,
    volume: '3.1M',
    marketCap: '12.4L Cr',
    sector: 'Banking',
    exchange: 'NSE',
    isFavorite: false,
    high52w: 1800.00,
    low52w: 1400.00,
    pe: 22.1,
    dividend: 1.2,
    predictedPrice: 1660.65,
    trend: 'up'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    price: 1425.60,
    change: -8.40,
    changePercent: -0.59,
    volume: '1.8M',
    marketCap: '5.9L Cr',
    sector: 'IT',
    exchange: 'NSE',
    isFavorite: true,
    high52w: 1650.00,
    low52w: 1200.00,
    pe: 28.5,
    dividend: 2.5,
    predictedPrice: 1421.39,
    trend: 'down'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    price: 985.40,
    change: 15.60,
    changePercent: 1.61,
    volume: '2.2M',
    marketCap: '6.8L Cr',
    sector: 'Banking',
    exchange: 'NSE',
    isFavorite: false,
    high52w: 1100.00,
    low52w: 850.00,
    pe: 19.8,
    dividend: 1.5,
    predictedPrice: 993.33,
    trend: 'up'
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 567.25,
    change: 8.45,
    changePercent: 1.51,
    volume: '4.2M',
    marketCap: '5.1L Cr',
    sector: 'Banking',
    exchange: 'NSE',
    isFavorite: false,
    high52w: 650.00,
    low52w: 480.00,
    pe: 12.3,
    dividend: 1.8,
    predictedPrice: 572.10,
    trend: 'up'
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Ltd',
    price: 425.80,
    change: -3.20,
    changePercent: -0.75,
    volume: '1.5M',
    marketCap: '2.3L Cr',
    sector: 'IT',
    exchange: 'NSE',
    isFavorite: false,
    high52w: 520.00,
    low52w: 380.00,
    pe: 22.1,
    dividend: 1.2,
    predictedPrice: 422.15,
    trend: 'down'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd',
    price: 1125.40,
    change: 18.75,
    changePercent: 1.69,
    volume: '2.8M',
    marketCap: '6.2L Cr',
    sector: 'Telecom',
    exchange: 'NSE',
    isFavorite: true,
    high52w: 1250.00,
    low52w: 950.00,
    pe: 15.8,
    dividend: 0.8,
    predictedPrice: 1135.20,
    trend: 'up'
  }
];

const INDEX_DISPLAY_NAMES: Record<string, string> = {
  '^NSEI': 'Nifty 50',
  '^NIFTYMIDCAP50': 'Nifty Midcap 50',
  '^NSEBANK': 'Nifty Bank',
  '^CNXIT': 'Nifty IT',
  '^CNXPHARMA': 'Nifty Pharma',
  '^CNXAUTO': 'Nifty Auto',
  '^CNXFMCG': 'Nifty FMCG',
  '^CNXMETAL': 'Nifty Metal',
};

const _portfolioSummary = {
  totalValue: 1250000,
  totalInvested: 1100000,
  totalReturns: 150000,
  returnPercentage: 13.64,
  dayChange: 8500,
  dayChangePercent: 0.68
};

const chartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: 'Stock Price',
      data: [190, 192, 195, 193, 200],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
    },
  ],
};

export default function DashboardContent() {
  const { isAuthenticated, user } = useAuth();
  const { count, increment } = useAPICounter();
  const { data: marketIndicesData, loading: marketIndicesLoading, error: marketIndicesError, refetch: refetchMarketIndices } = useMarketIndices();
  const [search, _setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(['TCS', 'INFY']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const marketIndicesDisplay = useMemo(
    () =>
      marketIndicesData.map((index) => ({
        name: INDEX_DISPLAY_NAMES[index.symbol] ?? index.symbol,
        value: index.regularMarketPrice,
        change: index.regularMarketChange,
        changePercent: index.regularMarketChangePercent,
        symbol: index.symbol.replace(/^\^/, ''),
      })),
    [marketIndicesData]
  );

  useEffect(() => {
    if (!isAuthenticated && count >= 10) setOpen(true);
  }, [count, isAuthenticated]);

  const filteredStocks = indianStocks.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleFavoriteToggle = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Handle client-side mounting and initial load
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      setIsClient(true);
      setIsInitialLoad(true);
      
      let mounted = true;
      if (!isAuthenticated && count < 10 && mounted) increment();
      
      // Reduce initial load time for better performance
      const timer = setTimeout(() => {
        if (mounted) setIsInitialLoad(false);
      }, 200);
      
      return () => { 
        mounted = false; 
        clearTimeout(timer);
      };
    }
  }, [isAuthenticated, count, increment]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Show loading state during initial client-side hydration
  if (!isClient) {
    return (
      <Layout>
        <Box sx={{ 
          minHeight: '100vh', 
          background: theme.palette.background.default,
          p: { xs: 1, sm: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LoadingSpinner message="Loading your dashboard..." />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <NoSSR>
        <Box sx={{ 
          minHeight: '100vh', 
          background: theme.palette.background.default,
          p: { xs: 1, sm: 1.5, md: 2, lg: 3 },
          px: { xs: 1.5, sm: 2 },
          overflowX: 'hidden',
          minWidth: 0,
        }}>
        {/* Loading Overlay - only show on client */}
        {isInitialLoad && (
          <Box
            sx={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'background.default',
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 9999,
              transition: 'opacity 0.3s ease-out',
            }}
          >
            <LoadingSpinner message="Loading your dashboard..." />
          </Box>
        )}
        
        {/* Welcome Header */}
        <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center', px: { xs: 0.5, sm: 0 } }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
            fontSize: { xs: '1.35rem', sm: '1.6rem', md: '2rem', lg: '2.2rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            wordBreak: 'break-word',
          }}>
            Welcome back, {user?.name || 'Trader'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Here&apos;s your EquaityWaves.ai dashboard
          </Typography>
        </Box>

        {/* Portfolio Summary Cards - Commented out: Portfolio Value, Total Returns, Invested Amount, Favorites */}
        {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Portfolio Value</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  ₹{_portfolioSummary.totalValue.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {_portfolioSummary.dayChange >= 0 ? <TrendingUpIcon color="success" fontSize="small" /> : <TrendingDownIcon color="error" fontSize="small" />}
                  <Typography variant="body2" color={_portfolioSummary.dayChange >= 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                    {_portfolioSummary.dayChange >= 0 ? '+' : ''}₹{_portfolioSummary.dayChange.toLocaleString()} ({_portfolioSummary.dayChangePercent >= 0 ? '+' : ''}{_portfolioSummary.dayChangePercent.toFixed(2)}%)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoneyIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Total Returns</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  ₹{_portfolioSummary.totalReturns.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  +{_portfolioSummary.returnPercentage.toFixed(2)}% overall
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ShowChartIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Invested Amount</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  ₹{_portfolioSummary.totalInvested.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total invested capital
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Favorites</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {favorites.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Watchlist stocks
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box> */}

        {/* Market Indices - Enhanced */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: { xs: 3, md: 4 }, overflow: 'hidden' }}>
          <CardHeader 
            title="Indian Market Indices" 
            subheader="Live market performance across major indices"
            sx={{
              flexWrap: 'wrap',
              '& .MuiCardHeader-title': { fontSize: { xs: '1rem', sm: '1.25rem' } },
              '& .MuiCardHeader-subheader': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
            }}
            action={
              <Tooltip title="Refresh Market Data">
                <IconButton
                  onClick={() => refetchMarketIndices()}
                  disabled={marketIndicesLoading}
                  aria-label="Refresh market indices"
                  sx={{ mt: { xs: -0.5, sm: 0 } }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent sx={{ pt: { xs: 0, sm: 1 }, px: { xs: 1.5, sm: 2, md: 3 }, pb: { xs: 2, sm: 3 } }}>
            {marketIndicesLoading && marketIndicesDisplay.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <LoadingSpinner />
              </Box>
            ) : marketIndicesError && marketIndicesDisplay.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="error.main" variant="body2">
                  {marketIndicesError.message}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
                {marketIndicesDisplay.map((index, _idx) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }} key={index.symbol}>
                    <Paper sx={{ 
                      p: { xs: 2, sm: 2.5, md: 3 }, 
                      border: 1, 
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.palette.mode === 'light' 
                          ? '0 8px 25px rgba(0,0,0,0.1)' 
                          : '0 8px 25px rgba(0,0,0,0.3)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {index.name}
                        </Typography>
                        <Chip 
                          label={index.symbol} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: { xs: 20, sm: 24 } }}
                        />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                        {index.value.toLocaleString('en-IN')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {index.change >= 0 ? 
                          <TrendingUpIcon color="success" fontSize="small" /> : 
                          <TrendingDownIcon color="error" fontSize="small" />
                        }
                        <Typography 
                          variant="body2" 
                          color={index.change >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Box sx={{ mb: { xs: 3, md: 4 }, overflow: 'hidden' }}>
          <Paper
            sx={{
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 2, md: 4 },
              border: `1px solid ${theme.palette.mode === 'light' 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)'}`,
              boxShadow: theme.palette.mode === 'light' 
                ? '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: { xs: 48, md: 64 },
                '& .MuiTab-root': {
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 2, md: 3 },
                  minHeight: { xs: 48, md: 64 },
                  fontWeight: 700,
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1.1rem' },
                  textTransform: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '12px 12px 0 0',
                  margin: '0 4px',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    borderBottom: '3px solid',
                    borderBottomColor: 'primary.main',
                  }
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                }
              }}
            >
              {/* <Tab label="Portfolio Overview" /> */}
              <Tab label="Real Time Analysis" />
              {/* <Tab label="Market Analysis" /> */}
            </Tabs>
          </Paper>
        </Box>

        {/* Tab Content - Portfolio Overview commented out (hidden via false &&) */}
        {false && tabValue === 0 && (
          <>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 4 }}>
              <CardHeader 
                title="Top Indian Stocks"
                action={
                  <Tooltip title="Refresh Data">
                    <IconButton>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {filteredStocks.slice(0, 4).map((stock) => (
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }} key={stock.symbol}>
                      <StockCard 
                        stock={stock}
                        onFavoriteToggle={handleFavoriteToggle}
                        isFavorite={favorites.includes(stock.symbol)}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

        {/* Simplified Stats Cards */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1, 
              p: 4, 
              background: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  background: theme.palette.success.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${theme.palette.success.main}40`,
                }}>
                  <Typography sx={{ fontSize: '1.2rem', color: 'white' }}>📈</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" color="success.main" sx={{ fontWeight: 800, mb: 0.5 }}>
                    +22%
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, opacity: 0.8 }}>
                    ↗️ Growth
            </Typography>
                </Box>
              </Box>
              <Typography variant="h2" color="text.primary" fontWeight={900} sx={{ 
                mb: 2, 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: theme.palette.mode === 'light' 
                  ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              ₹155k
            </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
              Total Investment
            </Typography>
              <Typography 
                component="div"
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  opacity: 0.8, 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: theme.palette.success.gradient,
                  boxShadow: `0 0 8px ${theme.palette.success.main}60`,
                }} />
            Last 4 Months
            </Typography>
            </Box>
          </Paper>
          
          
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1, 
              p: 4, 
              background: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  background: theme.palette.error.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${theme.palette.error.main}40`,
                }}>
                  <Typography sx={{ fontSize: '1.2rem', color: 'white' }}>📉</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" color="error.main" sx={{ fontWeight: 800, mb: 0.5 }}>
                    -18%
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 600, opacity: 0.8 }}>
                    ↘️ Decline
            </Typography>
                </Box>
              </Box>
              <Typography variant="h2" color="text.primary" fontWeight={900} sx={{ 
                mb: 2, 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: theme.palette.mode === 'light' 
                  ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                ₹88.5k
            </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
                Total Returns
            </Typography>
              <Typography 
                component="div"
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  opacity: 0.8, 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: theme.palette.error.gradient,
                  boxShadow: `0 0 8px ${theme.palette.error.main}60`,
                }} />
                Current Period
            </Typography>
            </Box>
          </Paper>
          
        </Stack>
        {/* Simplified Charts Section */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} mb={4}>
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1, 
              p: 3, 
              background: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 4, 
                  background: theme.palette.info.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 20px ${theme.palette.info.main}40`,
                }}>
                  <Typography sx={{ fontSize: '1.5rem', color: 'white' }}>📈</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="text.primary" fontWeight={800} sx={{ mb: 1 }}>
                    Market Performance
            </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                    Real-time Indian market analytics
            </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                height: 300, 
                width: '100%',
                borderRadius: 2,
                background: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                p: 2,
              }}>
                <Suspense fallback={<LoadingSpinner message="Loading chart..." />}>
                  <LineChart data={chartData} />
                </Suspense>
              </Box>
            </Box>
          </Paper>
          
          <Paper 
            elevation={2}
            sx={{ 
              flex: 1.5,
              p: 3, 
              background: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 4, 
                  background: theme.palette.warning.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 20px ${theme.palette.warning.main}40`,
                }}>
                  <Typography sx={{ fontSize: '1.5rem', color: 'white' }}>📊</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="text.primary" fontWeight={800} sx={{ mb: 1 }}>
                    Sector Analysis
            </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                    Indian market sector performance
            </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                height: 300, 
                width: '100%',
                borderRadius: 2,
                background: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                p: 2,
              }}>
                <Suspense fallback={<LoadingSpinner message="Loading chart..." />}>
                  <BarChart data={chartData} />
                </Suspense>
              </Box>
            </Box>
          </Paper>
        </Stack>

        {/* Simplified Stock Portfolio Section */}
        {/* <Box sx={{ mt: 3 }}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              background: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 4, 
                  background: theme.palette.primary.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                }}>
                  <Typography sx={{ fontSize: '1.5rem', color: 'white' }}>📋</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="text.primary" fontWeight={800} sx={{ mb: 1 }}>
                    Stock Portfolio
            </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                    Live market data and analytics
            </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                width: '100%', 
                overflowX: 'auto',
                borderRadius: 2,
                background: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}>
            <PrimeStockTable stocks={filteredStocks.map(stock => {
              const trend: 'up' | 'down' | 'neutral' = stock.trend === 'up' || stock.trend === 'down' || stock.trend === 'neutral' 
                ? stock.trend 
                : stock.changePercent > 0 ? 'up' : stock.changePercent < 0 ? 'down' : 'neutral';
              
              return {
                id: stock.symbol,
                name: stock.name,
                symbol: stock.symbol,
                currentPrice: stock.price,
                predictedPrice: stock.predictedPrice || stock.price * (1 + (stock.changePercent / 100) * 0.5),
                trend
              };
            })} />
              </Box>
            </Box>
          </Paper>
        </Box> */}
            <Modal open={open} onClose={() => setOpen(false)}>
              <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, m: 'auto', mt: 10, maxWidth: 400 }}>
                <Typography variant="h6" mb={2}>API Rate Limit Reached</Typography>
                <Typography mb={2}>Please <a href="/login">Log In</a> or <a href="/signup">Sign Up</a> to continue.</Typography>
                <CustomButton fullWidth onClick={() => setOpen(false)}>Close</CustomButton>
              </Box>
            </Modal>
          </>
        )}

        {/* AI Prediction Dashboard - only tab shown */}
        {tabValue === 0 && (
          <AIPredictionDashboard />
        )}

        {/* Market Analysis Tab - commented out (hidden via false &&) */}
        {false && tabValue === 2 && (
          <>
            {/* Market Analysis Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                Market Analysis Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive market insights and real-time analytics for informed trading decisions
              </Typography>
            </Box>

            {/* Market Overview Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">Market Sentiment</Typography>
                    </Box>
                    <Chip 
                      label="Bullish" 
                      color="success"
                      size="medium"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Overall market sentiment is positive, indicating investor confidence and upward price momentum.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ShowChartIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">Volatility</Typography>
                    </Box>
                    <Chip 
                      label="Medium" 
                      color="warning"
                      size="medium"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Market volatility is at moderate levels, suggesting balanced risk-reward opportunities.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">Volume</Typography>
                    </Box>
                    <Chip 
                      label="High" 
                      color="info"
                      size="medium"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Trading volume is elevated, indicating strong market participation and liquidity.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">Trend</Typography>
                    </Box>
                    <Chip 
                      label="Upward" 
                      color="success"
                      size="medium"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Market trend is upward, showing consistent positive momentum across major indices.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Market Analysis Charts */}
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} mb={4}>
              <Paper 
                elevation={2}
                sx={{ 
                  flex: 1, 
                  p: 3, 
                  background: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 4, 
                      background: theme.palette.primary.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                    }}>
                      <Typography sx={{ fontSize: '1.5rem', color: 'white' }}>📊</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" color="text.primary" fontWeight={800} sx={{ mb: 1 }}>
                        Market Performance
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                        Real-time market analysis and trends
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    height: 300, 
                    width: '100%',
                    borderRadius: 2,
                    background: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    p: 2,
                  }}>
                    <Suspense fallback={<LoadingSpinner message="Loading chart..." />}>
                      <LineChart data={chartData} />
                    </Suspense>
                  </Box>
                </Box>
              </Paper>
              
              <Paper 
                elevation={2}
                sx={{ 
                  flex: 1,
                  p: 3, 
                  background: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 4, 
                      background: theme.palette.success.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 20px ${theme.palette.success.main}40`,
                    }}>
                      <Typography sx={{ fontSize: '1.5rem', color: 'white' }}>📈</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" color="text.primary" fontWeight={800} sx={{ mb: 1 }}>
                        Sector Analysis
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                        Sector-wise performance breakdown
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    height: 300, 
                    width: '100%',
                    borderRadius: 2,
                    background: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    p: 2,
                  }}>
                    <Suspense fallback={<LoadingSpinner message="Loading chart..." />}>
                      <BarChart data={chartData} />
                    </Suspense>
                  </Box>
                </Box>
              </Paper>
            </Stack>

            {/* Trading Recommendations */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 4 }}>
              <CardHeader 
                title="Trading Recommendations"
                subheader="AI-powered equity recommendations based on market analysis"
                action={
                  <Tooltip title="Refresh Recommendations">
                    <IconButton>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    { stock: 'RELIANCE', action: 'Buy', confidence: 85, reason: 'Strong fundamentals and growth prospects' },
                    { stock: 'TCS', action: 'Hold', confidence: 72, reason: 'Stable performance, good for long term' },
                    { stock: 'HDFCBANK', action: 'Buy', confidence: 78, reason: 'Banking sector recovery expected' },
                    { stock: 'INFY', action: 'Sell', confidence: 65, reason: 'Valuation concerns, profit booking recommended' }
                  ].map((rec, idx) => (
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: 0 }} key={idx}>
                      <Paper sx={{ 
                        p: 3, 
                        border: 1, 
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.palette.mode === 'light' 
                            ? '0 8px 25px rgba(0,0,0,0.1)' 
                            : '0 8px 25px rgba(0,0,0,0.3)',
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                            {rec.stock}
                          </Typography>
                          <Chip 
                            label={rec.action} 
                            color={rec.action === 'Buy' ? 'success' : rec.action === 'Sell' ? 'error' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {rec.reason}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Confidence: {rec.confidence}%
                          </Typography>
                          <Box sx={{ 
                            width: '100%', 
                            height: 4, 
                            backgroundColor: 'divider', 
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${rec.confidence}%`, 
                              height: '100%', 
                              backgroundColor: rec.action === 'Buy' ? 'success.main' : rec.action === 'Sell' ? 'error.main' : 'warning.main',
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </>
        )}
        </Box>
      </NoSSR>
    </Layout>
  );
}

