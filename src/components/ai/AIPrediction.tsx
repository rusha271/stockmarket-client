'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  alpha,
  Fade,
  Zoom,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
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
  stock: any;
  /** Optional current price (e.g. quote.close) for frontend direction calculation. If not provided, uses stock.price / stock.currentPrice. */
  currentPrice?: number;
  onPredictionComplete?: (result: PredictionResult) => void;
}

const predictionSteps = [
  'Analyzing market data...',
  'Processing technical indicators...',
  'Evaluating market sentiment...',
  'Running AI prediction models...',
  'Generating insights...',
  'Finalizing prediction...',
];

export const AIPrediction: React.FC<AIPredictionProps> = ({ stock, currentPrice: currentPriceProp, onPredictionComplete }) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Reset card to "Generate AI Prediction" state when user selects a different stock
  useEffect(() => {
    setPredictionResult(null);
    setError(null);
    setIsPredicting(false);
    setCurrentStep(0);
    setProgress(0);
  }, [stock?.symbol]);

  const generateMockPrediction = (stockData: any): PredictionResult => {
    const currentPrice = stockData.currentPrice;
    const changePercent = stockData.changePercent;
    
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
        const next = Math.min(s + 1, predictionSteps.length - 1);
        setProgress((next / predictionSteps.length) * 100);
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
      const currentPrice = currentPriceProp ?? stock?.price ?? stock?.currentPrice ?? 0;
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
      setCurrentStep(predictionSteps.length - 1);
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
        <AIIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          AI Prediction Ready
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a stock to get AI-powered predictions
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
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
            <AIIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              AI Stock Prediction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced machine learning analysis for {stock.symbol}
            </Typography>
          </Box>
        </Box>

        {/* Prediction Button */}
        {!predictionResult && !isPredicting && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handlePredict}
              startIcon={<AIIcon />}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
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
              Generate AI Prediction
            </Button>
          </Box>
        )}

        {/* Prediction Progress */}
        {isPredicting && (
          <Fade in timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CircularProgress size={24} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  AI is analyzing...
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
                {predictionSteps[currentStep]}
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
                startIcon={<AIIcon />}
              >
                Try Again
              </Button>
            </Box>
          </Fade>
        )}

        {/* Prediction Results */}
        {predictionResult && (
          <Fade in timeout={500}>
            <Box>
              {/* Main Prediction */}
              <Card
                sx={{
                  mb: 4,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha(getDirectionColor(predictionResult.direction), 0.3)}`,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      AI Prediction Result
                    </Typography>
                    <Chip
                      icon={getDirectionIcon(predictionResult.direction)}
                      label={predictionResult.direction.toUpperCase()}
                      sx={{
                        backgroundColor: getDirectionColor(predictionResult.direction),
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Predicted Price
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="text.primary">
                        ₹{predictionResult.predictedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Confidence
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="text.primary">
                        {(predictionResult.confidence * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Timeframe
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="text.primary">
                        {predictionResult.timeframe}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Risk Level
                      </Typography>
                      <Chip
                        label={predictionResult.riskLevel.toUpperCase()}
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
                      <AIIcon sx={{ fontSize: '2rem', color: 'secondary.main', mb: 1 }} />
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

              {/* Reasoning */}
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 3 }}>
                    AI Reasoning
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {predictionResult.reasoning.map((reason, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                        <Typography variant="body1" color="text.primary">
                          {reason}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Regenerate Button */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handlePredict}
                  startIcon={<AIIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                  }}
                >
                  Regenerate Prediction
                </Button>
              </Box>
            </Box>
          </Fade>
        )}
      </Box>
    </Paper>
  );
};
