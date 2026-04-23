'use client';

import { useState /* , useEffect */ } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  // Card,
  // CardContent,
  Chip, 
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Search as SearchIcon, 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  // FilterList as FilterIcon,
  ViewList as ListIcon,
  GridView as GridIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import Layout from '@/components/layout/Layout';
import StockCard from '@/components/stocks/StockCard';
// import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { NoSSR } from '@/components/common/NoSSR';

// Indian Equity Market Data
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
    dividend: 2.1
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
    dividend: 1.8
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
    dividend: 1.2
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
    dividend: 2.5
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
    dividend: 1.5
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd',
    price: 892.15,
    change: 22.35,
    changePercent: 2.57,
    volume: '1.5M',
    marketCap: '4.9L Cr',
    sector: 'Telecom',
    exchange: 'NSE',
    isFavorite: false,
    high52w: 950.00,
    low52w: 700.00,
    pe: 15.2,
    dividend: 0.8
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd',
    price: 456.80,
    change: -5.20,
    changePercent: -1.13,
    volume: '2.8M',
    marketCap: '5.7L Cr',
    sector: 'FMCG',
    exchange: 'NSE',
    isFavorite: true,
    high52w: 500.00,
    low52w: 380.00,
    pe: 24.3,
    dividend: 3.2
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 567.25,
    change: 8.90,
    changePercent: 1.59,
    volume: '4.2M',
    marketCap: '5.1L Cr',
    sector: 'Banking',
    exchange: 'NSE',
    isFavorite: false,
    high52w: 650.00,
    low52w: 480.00,
    pe: 12.5,
    dividend: 1.8
  }
];

const sectors = ['All', 'IT', 'Banking', 'Energy', 'FMCG', 'Telecom'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StocksPage() {
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [viewMode, setViewMode] = useState(0); // 0: Grid, 1: List
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Filter stocks based on search and sector
  const filteredStocks = indianStocks.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const handleFavoriteToggle = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
    setSnackbar({ 
      open: true, 
      message: favorites.includes(symbol) ? 'Removed from favorites' : 'Added to favorites' 
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedStocks = filteredStocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Layout>
      <NoSSR>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Indian Equity Market
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Track and analyze Indian stocks from NSE and BSE
            </Typography>

            {/* Search and Filters */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: 2, 
              mb: 3,
              alignItems: { xs: 'stretch', md: 'center' }
            }}>
              <TextField
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  minWidth: { xs: '100%', md: '300px' }
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {sectors.map((sector) => (
                  <Chip
                    key={sector}
                    label={sector}
                    onClick={() => setSelectedSector(sector)}
                    color={selectedSector === sector ? 'primary' : 'default'}
                    variant={selectedSector === sector ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
                <IconButton onClick={() => setViewMode(0)} color={viewMode === 0 ? 'primary' : 'default'}>
                  <GridIcon />
                </IconButton>
                <IconButton onClick={() => setViewMode(1)} color={viewMode === 1 ? 'primary' : 'default'}>
                  <ListIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All Stocks" />
              <Tab label="Favorites" />
              <Tab label="Gainers" />
              <Tab label="Losers" />
            </Tabs>
          </Box>

          {/* Content */}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <TabPanel value={tabValue} index={0}>
            {viewMode === 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {paginatedStocks.map((stock) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' }, minWidth: 0 }} key={stock.symbol}>
                    <StockCard 
                      stock={stock}
                      onFavoriteToggle={handleFavoriteToggle}
                      isFavorite={favorites.includes(stock.symbol)}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stock</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Change</TableCell>
                      <TableCell align="right">Volume</TableCell>
                      <TableCell align="right">Market Cap</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedStocks.map((stock) => (
                      <TableRow key={stock.symbol} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: stock.change >= 0 ? 'success.main' : 'error.main',
                              width: 32, 
                              height: 32,
                              fontSize: '0.8rem'
                            }}>
                              {stock.symbol.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {stock.symbol}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {stock.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold">
                            ₹{stock.price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {stock.change >= 0 ? <TrendingUpIcon color="success" fontSize="small" /> : <TrendingDownIcon color="error" fontSize="small" />}
                            <Typography 
                              variant="subtitle2" 
                              color={stock.change >= 0 ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{stock.volume}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{stock.marketCap}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            onClick={() => handleFavoriteToggle(stock.symbol)}
                            color={favorites.includes(stock.symbol) ? 'warning' : 'default'}
                          >
                            {favorites.includes(stock.symbol) ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredStocks.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {indianStocks.filter(stock => favorites.includes(stock.symbol)).map((stock) => (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' }, minWidth: 0 }} key={stock.symbol}>
                  <StockCard 
                    stock={stock}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={true}
                  />
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {indianStocks.filter(stock => stock.change >= 0).map((stock) => (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' }, minWidth: 0 }} key={stock.symbol}>
                  <StockCard 
                    stock={stock}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favorites.includes(stock.symbol)}
                  />
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {indianStocks.filter(stock => stock.change < 0).map((stock) => (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' }, minWidth: 0 }} key={stock.symbol}>
                  <StockCard 
                    stock={stock}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favorites.includes(stock.symbol)}
                  />
                </Box>
              ))}
            </Box>
          </TabPanel>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={2000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </NoSSR>
    </Layout>
  );
}
