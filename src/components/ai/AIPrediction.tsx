'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  // Grid,
  Card,
  CardContent,
  alpha,
  Fade,
  // Zoom,
  CircularProgress,
  // Stepper,
  // Step,
  // StepLabel,
  // StepContent,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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

/** Neutral when difference is 1 rupee or points. 2–3 rupees show UP/DOWN. */
const DIRECTION_NEUTRAL_THRESHOLD_RUPEES = 1.5;

function computeDirection(currentPrice: number, predictedPrice: number): 'up' | 'down' | 'neutral' {
  if (currentPrice <= 0) return 'neutral';
  const diff = predictedPrice - currentPrice; // positive = predicted higher → UP, negative → DOWN
  const absDiff = Math.abs(diff);
  if (absDiff <= DIRECTION_NEUTRAL_THRESHOLD_RUPEES) return 'neutral'; // 1 rupee or points → neutral
  if (diff > 0) return 'up';   // predicted > current → price expected to go up
  if (diff < 0) return 'down'; // predicted < current → price expected to go down
  return 'neutral';
}

interface AIPredictionProps {
  stock: (Record<string, unknown> | { symbol?: string; price?: number; currentPrice?: number; changePercent?: number }) | null;
  /** Optional current price (e.g. quote.close) for frontend direction calculation. If not provided, uses stock.price / stock.currentPrice. */
  currentPrice?: number;
  onPredictionComplete?: (result: PredictionResult) => void;
}

const analysisSteps = [
  'Analyzing market data...',
  'Processing technical indicators...',
  'Evaluating price action...',
  'Computing risk metrics...',
  'Generating analysis...',
  'Finalizing results...',
];

export const AIPrediction: React.FC<AIPredictionProps> = ({ stock, currentPrice: currentPriceProp, onPredictionComplete }) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Reset card when user selects a different stock
  useEffect(() => {
    setPredictionResult(null);
    setError(null);
    setIsPredicting(false);
    setCurrentStep(0);
    setProgress(0);
  }, [stock?.symbol]);

  const _generateMockPrediction = (stockData: Record<string, unknown>): PredictionResult => {
    const currentPrice = Number(stockData.currentPrice) || 0;
    const changePercent = Number(stockData.changePercent) || 0;
    
    // Simulate AI prediction logic
    const volatility = Math.random() * 0.1 + 0.05; // 5-15% volatility
    const trend = changePercent > 0 ? 1 : -1;
    const randomFactor = (Math.random() - 0.5) * 0.2; // -10% to +10% random factor
    
    const predictedChange = (trend * volatility + randomFactor) * currentPrice;
    const predictedPrice = currentPrice + predictedChange;
    
    const confidence = Math.random() * 0.3 + 0.6; // 60-90% confidence
    const direction = predictedChange > 0 ? 'up' : predictedChange < -currentPrice * 0.02 ? 'down' : 'neutral';
    
    const reasoning = [
      'Technical analysis shows strong momentum indicators',
      'Volume patterns suggest institutional interest',
      'Market sentiment is positive based on news analysis',
      'Historical patterns indicate favorable conditions',
    ];
    
    const riskLevel = confidence > 0.8 ? 'low' : confidence > 0.6 ? 'medium' : 'high';
    
    return {
      predictedPrice: Number(predictedPrice.toFixed(2)),
      confidence: Number(confidence.toFixed(2)),
      direction,
      timeframe: '7 days',
      reasoning,
      riskLevel,
      factors: {
        technical: Number((Math.random() * 0.4 + 0.3).toFixed(2)),
        fundamental: Number((Math.random() * 0.4 + 0.3).toFixed(2)),
        sentiment: Number((Math.random() * 0.4 + 0.3).toFixed(2)),
      },
    };
  };

  const handlePredict = async () => {
    if (!stock?.symbol) return;

    setIsPredicting(true);
    setCurrentStep(0);
    setProgress(0);
    setPredictionResult(null);
    setError(null);

    const stepsInterval = setInterval(() => {
      setCurrentStep((s) => {
        const next = Math.min(s + 1, analysisSteps.length - 1);
        setProgress((next / analysisSteps.length) * 100);
        return next;
      });
    }, 900);

    try {
      const res = await fetch('/api/ai-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stock.symbol }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = data?.error;
        const errStr =
          typeof err === 'string'
            ? err
            : Array.isArray(err)
              ? err.map((e: unknown) => (e && typeof e === 'object' && 'msg' in e ? (e as { msg: string }).msg : String(e))).join('. ')
              : err && typeof err === 'object' && 'msg' in err
                ? String((err as { msg: unknown }).msg)
                : `Request failed (${res.status}). Ensure the AI backend is running.`;
        setError(errStr);
        return;
      }

      const factors = data.factors ?? {};
      const rawReasoning = data.reasoning;
      const reasoning: string[] = Array.isArray(rawReasoning)
        ? rawReasoning.map((r: unknown) => (typeof r === 'string' ? r : r && typeof r === 'object' && 'msg' in r ? String((r as { msg: unknown }).msg) : String(r)))
        : [];
      const predictedPrice = Number(data.predictedPrice) || 0;
      const rawCurrent = currentPriceProp ?? (stock && typeof stock === 'object' && 'price' in stock ? (stock as { price?: number }).price : undefined) ?? (stock && typeof stock === 'object' && 'currentPrice' in stock ? (stock as { currentPrice?: number }).currentPrice : undefined);
      const currentPrice = Number(rawCurrent) || 0;
      const direction = computeDirection(currentPrice, predictedPrice);
      const result: PredictionResult = {
        predictedPrice,
        confidence: Number(data.confidence) || 0,
        direction,
        timeframe: typeof data.timeframe === 'string' ? data.timeframe : '7 days',
        reasoning,
        riskLevel: ['low', 'medium', 'high'].includes(data.riskLevel) ? data.riskLevel : 'medium',
        factors: {
          technical: Number(factors.technical) || 0,
          fundamental: Number(factors.fundamental) || 0,
          sentiment: Number(factors.sentiment) || 0,
        },
      };

      setProgress(100);
      setCurrentStep(analysisSteps.length - 1);
      setPredictionResult(result);
      onPredictionComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prediction. Please try again.');
    } finally {
      clearInterval(stepsInterval);
      setIsPredicting(false);
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'up': return theme.palette.success.main;
      case 'down': return theme.palette.error.main;
      default: return theme.palette.warning.main;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUpIcon />;
      case 'down': return <TrendingDownIcon />;
      default: return <TimelineIcon />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'high': return theme.palette.error.main;
    }
  };

  if (!stock) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <TimelineIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Real Time Analysis Ready
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a stock to run real-time analysis
        </Typography>
      </Paper>
    );
  }

  return (
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
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: 3,
              background: theme.palette.primary.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <TimelineIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, color: 'white' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Real Time Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              Live market analysis for {stock && typeof stock === 'object' && 'symbol' in stock ? String((stock as { symbol?: string }).symbol ?? '') : ''}
            </Typography>
          </Box>
        </Box>

        {/* Analysis Button */}
        {!predictionResult && !isPredicting && (
          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
            <Button
              variant="contained"
              size="large"
              onClick={handlePredict}
              startIcon={<TimelineIcon />}
              sx={{
                px: { xs: 3, sm: 4, md: 6 },
                py: { xs: 1.5, md: 2 },
                minHeight: 48,
                borderRadius: 3,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                fontWeight: 700,
                background: theme.palette.primary.gradient,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Run Real Time Analysis
            </Button>
          </Box>
        )}

        {/* Analysis Progress */}
        {isPredicting && (
          <Fade in timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CircularProgress size={24} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Analyzing market data...
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 3,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: theme.palette.primary.gradient,
                  },
                }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {analysisSteps[currentStep]}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}% complete
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Error State */}
        {error && (
          <Fade in timeout={300}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <ErrorIcon sx={{ fontSize: '3rem', color: 'error.main', mb: 2 }} />
              <Typography variant="h6" color="error.main" gutterBottom>
                Prediction Failed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {error}
              </Typography>
              <Button
                variant="outlined"
                onClick={handlePredict}
                startIcon={<TimelineIcon />}
              >
                Try Again
              </Button>
            </Box>
          </Fade>
        )}

        {/* Analysis Results */}
        {predictionResult && (
          <Fade in timeout={500}>
            <Box>
              {/* Main Result Card */}
              <Card
                sx={{
                  mb: 3,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha(getDirectionColor(predictionResult.direction), 0.3)}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      Real Time Analysis Result
                    </Typography>
                    <Chip
                      icon={getDirectionIcon(predictionResult.direction)}
                      label={predictionResult.direction.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: getDirectionColor(predictionResult.direction),
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2.5 }}>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1, sm: 0 } }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                        Predicted Price
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        ₹{predictionResult.predictedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1, sm: 0 } }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                        Confidence
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        {(predictionResult.confidence * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1, sm: 0 }, gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                        Timeframe
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                        {predictionResult.timeframe}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1, sm: 0 } }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                        Risk Level
                      </Typography>
                      <Chip
                        label={predictionResult.riskLevel.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getRiskColor(predictionResult.riskLevel),
                          color: 'white',
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6, fontSize: '0.7rem' }}>
                  <strong>Disclaimer:</strong> This analysis is for informational and educational purposes only and does not constitute investment advice, financial advice, or a recommendation to buy or sell any security. Past performance and real-time analysis do not guarantee future results. Markets are subject to risk; you may lose capital. Always do your own research and consider consulting a qualified financial advisor before making investment decisions.
                </Typography>
              </Paper>

              {/* Analysis Factors - commented out
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 3 }}>
                    Analysis Factors
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
                      <SpeedIcon sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Technical Analysis
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="text.primary">
                        {(predictionResult.factors.technical * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
                      <TimelineIcon sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Fundamental Analysis
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="text.primary">
                        {(predictionResult.factors.fundamental * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
                      <TimelineIcon sx={{ fontSize: '2rem', color: 'secondary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Sentiment Analysis
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="text.primary">
                        {(predictionResult.factors.sentiment * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              */}

              {/* Run Again Button */}
              <Box sx={{ textAlign: 'center', mt: { xs: 2, md: 3 } }}>
                <Button
                  variant="outlined"
                  onClick={handlePredict}
                  startIcon={<RefreshIcon />}
                  sx={{
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 1.5 },
                    minHeight: 48,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  }}
                >
                  Run Analysis Again
                </Button>
              </Box>
            </Box>
          </Fade>
        )}
      </Box>
    </Paper>
  );
};
