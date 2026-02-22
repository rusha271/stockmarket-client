import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Avatar,
  Tooltip,
  LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useTheme } from '@mui/material';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  sector: string;
  exchange: string;
  isFavorite: boolean;
  high52w: number;
  low52w: number;
  pe: number;
  dividend: number;
}

interface StockCardProps {
  stock: StockData;
  onFavoriteToggle: (symbol: string) => void;
  isFavorite: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onFavoriteToggle, isFavorite }) => {
  const theme = useTheme();
  
  const getChangeColor = (change: number) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      'IT': 'primary.main',
      'Banking': 'success.main',
      'Energy': 'warning.main',
      'FMCG': 'info.main',
      'Telecom': 'secondary.main'
    };
    return colors[sector] || 'default';
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        border: 1, 
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          borderColor: theme.palette.primary.main,
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem', mb: 0.5 }}>
              {stock.symbol}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.2
            }}>
              {stock.name}
            </Typography>
          </Box>
          <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton 
              size="small" 
              onClick={() => onFavoriteToggle(stock.symbol)}
              sx={{ 
                color: isFavorite ? 'warning.main' : 'text.secondary',
                '&:hover': {
                  color: 'warning.main',
                  bgcolor: 'warning.light',
                }
              }}
            >
              {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Price and Change */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              ₹{stock.price.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {stock.change >= 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography 
                variant="body2" 
                fontWeight="bold"
                color={getChangeColor(stock.change)}
              >
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="caption" 
            color={getChangeColor(stock.change)}
            fontWeight="bold"
          >
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </Typography>
        </Box>

        {/* Sector and Exchange */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={stock.sector} 
            size="small" 
            sx={{ 
              bgcolor: getSectorColor(stock.sector),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          />
          <Chip 
            label={stock.exchange} 
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        {/* Market Data */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Volume</Typography>
            <Typography variant="caption" fontWeight="bold">{stock.volume}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Market Cap</Typography>
            <Typography variant="caption" fontWeight="bold">{stock.marketCap}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">P/E Ratio</Typography>
            <Typography variant="caption" fontWeight="bold">{stock.pe}</Typography>
          </Box>
        </Box>

        {/* 52W Range */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            52W Range
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Low: ₹{stock.low52w.toFixed(2)}</Typography>
            <Typography variant="caption">High: ₹{stock.high52w.toFixed(2)}</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100}
            sx={{ 
              height: 4, 
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: stock.price > (stock.high52w + stock.low52w) / 2 ? 'success.main' : 'warning.main'
              }
            }}
          />
        </Box>

        {/* Dividend */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">Dividend Yield</Typography>
          <Typography variant="caption" fontWeight="bold" color="success.main">
            {stock.dividend}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockCard; 