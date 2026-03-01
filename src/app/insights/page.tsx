'use client';

import { useState /* , useEffect */ } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Chip,
  LinearProgress,
  // Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  // Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  // PieChart as PieChartIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import Layout from '@/components/layout/Layout';
// import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
// import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { NoSSR } from '@/components/common/NoSSR';

// Mock data for insights
const marketInsights = {
  overallSentiment: 'Bullish',
  marketTrend: 'Upward',
  volatility: 'Medium',
  volume: 'High',
  recommendations: [
    { stock: 'RELIANCE', action: 'Buy', confidence: 85, reason: 'Strong fundamentals and growth prospects' },
    { stock: 'TCS', action: 'Hold', confidence: 72, reason: 'Stable performance, good for long term' },
    { stock: 'HDFCBANK', action: 'Buy', confidence: 78, reason: 'Banking sector recovery expected' },
    { stock: 'INFY', action: 'Sell', confidence: 65, reason: 'Valuation concerns, profit booking recommended' }
  ],
  sectorPerformance: [
    { sector: 'IT', performance: 12.5, trend: 'up' },
    { sector: 'Banking', performance: 8.2, trend: 'up' },
    { sector: 'Energy', performance: -2.1, trend: 'down' },
    { sector: 'FMCG', performance: 5.8, trend: 'up' },
    { sector: 'Telecom', performance: 15.3, trend: 'up' }
  ],
  marketIndices: [
    { name: 'Nifty 50', value: 19845.30, change: 125.50, changePercent: 0.64 },
    { name: 'Sensex', value: 66408.39, change: 412.20, changePercent: 0.62 },
    { name: 'Nifty Bank', value: 45678.90, change: 234.10, changePercent: 0.52 },
    { name: 'Nifty IT', value: 32156.78, change: -45.30, changePercent: -0.14 }
  ]
};

const aiPredictions = [
  {
    id: 1,
    stock: 'RELIANCE',
    prediction: 'Bullish',
    confidence: 78,
    timeframe: '1 Week',
    reasoning: 'Strong Q4 results expected, oil prices stabilizing',
    accuracy: 82
  },
  {
    id: 2,
    stock: 'TCS',
    prediction: 'Neutral',
    confidence: 65,
    timeframe: '2 Weeks',
    reasoning: 'IT sector facing headwinds, but strong fundamentals',
    accuracy: 75
  },
  {
    id: 3,
    stock: 'HDFCBANK',
    prediction: 'Bullish',
    confidence: 72,
    timeframe: '1 Month',
    reasoning: 'Banking sector recovery, credit growth improving',
    accuracy: 80
  }
];

const newsInsights = [
  {
    id: 1,
    title: 'RBI maintains repo rate at 6.5%',
    impact: 'Positive',
    stocks: ['HDFCBANK', 'ICICIBANK', 'SBIN'],
    summary: 'RBI keeps interest rates unchanged, supporting banking sector growth',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    title: 'IT companies report mixed Q4 results',
    impact: 'Neutral',
    stocks: ['TCS', 'INFY', 'WIPRO'],
    summary: 'Some IT majors beat expectations while others miss targets',
    timestamp: '4 hours ago'
  },
  {
    id: 3,
    title: 'Oil prices stabilize after OPEC+ decision',
    impact: 'Positive',
    stocks: ['RELIANCE', 'ONGC', 'IOC'],
    summary: 'Crude oil prices find support, benefiting energy stocks',
    timestamp: '6 hours ago'
  }
];

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

export default function InsightsPage() {
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return 'success';
      case 'bearish': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <NoSSR>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Market Insights & AI Predictions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  AI-powered analysis and market intelligence
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download Report">
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share Insights">
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
          </Box>

          {/* Market Overview Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Market Sentiment</Typography>
                  </Box>
                  <Chip 
                    label={marketInsights.overallSentiment} 
                    color={getSentimentColor(marketInsights.overallSentiment)}
                    size="medium"
                    sx={{ fontWeight: 'bold' }}
                  />
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimelineIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Market Trend</Typography>
                  </Box>
                  <Chip 
                    label={marketInsights.marketTrend} 
                    color="success"
                    size="medium"
                    sx={{ fontWeight: 'bold' }}
                  />
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BarChartIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Volatility</Typography>
                  </Box>
                  <Chip 
                    label={marketInsights.volatility} 
                    color="warning"
                    size="medium"
                    sx={{ fontWeight: 'bold' }}
                  />
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Volume</Typography>
                  </Box>
                  <Chip 
                    label={marketInsights.volume} 
                    color="info"
                    size="medium"
                    sx={{ fontWeight: 'bold' }}
                  />
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<PsychologyIcon />} label="AI Predictions" />
              <Tab icon={<AssessmentIcon />} label="Market Analysis" />
              <Tab icon={<TimelineIcon />} label="News & Events" />
              <Tab icon={<BarChartIcon />} label="Sector Performance" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {aiPredictions.map((prediction) => (
                <Box key={prediction.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
                  <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                    <CardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {prediction.stock}
                          </Typography>
                          <Chip 
                            label={prediction.prediction} 
                            color={getSentimentColor(prediction.prediction)}
                            size="small"
                          />
                        </Box>
                      }
                      subheader={`Timeframe: ${prediction.timeframe}`}
                    />
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Confidence Level
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={prediction.confidence} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {prediction.confidence}%
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {prediction.reasoning}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Accuracy: {prediction.accuracy}%
                        </Typography>
                        <IconButton size="small">
                          <StarIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.666% - 12px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
                  <CardHeader title="Market Indices" />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {marketInsights.marketIndices.map((index, idx) => (
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }} key={idx}>
                          <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              {index.name}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {index.value.toLocaleString()}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {index.change >= 0 ? <TrendingUpIcon color="success" fontSize="small" /> : <TrendingDownIcon color="error" fontSize="small" />}
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
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardHeader title="Trading Recommendations" />
                  <CardContent>
                    <List>
                      {marketInsights.recommendations.map((rec, idx) => (
                        <ListItem key={idx} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ 
                              bgcolor: rec.action === 'Buy' ? 'success.main' : rec.action === 'Sell' ? 'error.main' : 'warning.main',
                              width: 32,
                              height: 32
                            }}>
                              {rec.action.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {rec.stock}
                                </Typography>
                                <Chip label={rec.action} color={rec.action === 'Buy' ? 'success' : rec.action === 'Sell' ? 'error' : 'warning'} size="small" />
                                <Chip label={`${rec.confidence}%`} variant="outlined" size="small" />
                              </Box>
                            }
                            secondary={rec.reason}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.333% - 12px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardHeader title="Sector Performance" />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      <PieChart data={{
                        labels: ['IT', 'Banking', 'Energy', 'FMCG', 'Telecom'],
                        datasets: [{
                          label: 'Sector Performance',
                          data: [30, 25, 20, 15, 10],
                          backgroundColor: '#6366f1'
                        }]
                      }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {newsInsights.map((news) => (
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }} key={news.id}>
                  <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, mr: 2 }}>
                          {news.title}
                        </Typography>
                        <Chip 
                          label={news.impact} 
                          color={getImpactColor(news.impact)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {news.summary}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {news.stocks.map((stock) => (
                            <Chip key={stock} label={stock} size="small" variant="outlined" />
                          ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {news.timestamp}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.666% - 12px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardHeader title="Sector Performance Chart" />
                  <CardContent>
                    <Box sx={{ height: 400 }}>
                      <BarChart data={{
                        labels: ['IT', 'Banking', 'Energy', 'FMCG', 'Telecom'],
                        datasets: [{
                          label: 'Performance %',
                          data: [12.5, 8.2, -2.1, 5.8, 15.3],
                          backgroundColor: '#6366f1'
                        }]
                      }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.333% - 12px)' } }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardHeader title="Sector Rankings" />
                  <CardContent>
                    <List>
                      {marketInsights.sectorPerformance
                        .sort((a, b) => b.performance - a.performance)
                        .map((sector, idx) => (
                        <ListItem key={sector.sector} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ 
                              bgcolor: sector.trend === 'up' ? 'success.main' : 'error.main',
                              width: 32,
                              height: 32
                            }}>
                              {idx + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {sector.sector}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {sector.trend === 'up' ? <TrendingUpIcon color="success" fontSize="small" /> : <TrendingDownIcon color="error" fontSize="small" />}
                                  <Typography 
                                    variant="body2" 
                                    color={sector.trend === 'up' ? 'success.main' : 'error.main'}
                                    fontWeight="bold"
                                  >
                                    {sector.performance >= 0 ? '+' : ''}{sector.performance.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>
        </Container>
      </NoSSR>
    </Layout>
  );
}
