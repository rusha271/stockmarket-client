'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Alert,
  Snackbar,
  Fade,
  Card,
  CardContent,
  Divider,
  Link,
  LinearProgress
} from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginCredentials, RegisterCredentials } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { emailService } from '@/services/emailService';
import { 
  Login as LoginIcon, 
  PersonAdd as SignupIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AuthPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Handle client-side mounting and preload dashboard components
  useEffect(() => {
    setIsClient(true);
    
    // Preload dashboard components for faster navigation
    const preloadDashboard = () => {
      // Preload the dashboard page components
      import('@/components/charts/LineChart');
      import('@/components/charts/BarChart');
      import('@/components/charts/PieChart');
      import('@/components/layout/Layout');
      import('@/components/common/PrimeStockTable');
    };
    
    // Preload after a short delay to not block initial render
    setTimeout(preloadDashboard, 1000);
  }, []);

  // Handle URL parameters for tab switching
  useEffect(() => {
    if (isClient) {
      const tab = searchParams.get('tab');
      if (tab) {
        const tabIndex = parseInt(tab, 10);
        if (tabIndex >= 0 && tabIndex <= 1) {
          setTabValue(tabIndex);
        }
      }
    }
  }, [searchParams, isClient]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage(null);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
  };

  const handleLogin = async (data: LoginCredentials) => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      setIsLoading(true);
      setLoginProgress(0);
      
      // Simulate progress
      progressInterval = setInterval(() => {
        setLoginProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 50);
      
      // Debug logging
      console.log('Login attempt:', { email: data.email, password: data.password });
      
      // Check for predefined temporary credentials
      const predefinedCredentials = [
        {
          email: 'admin@gmail.com',
          password: 'Admin!1234',
          user: {
            id: 1,
            name: 'Admin User',
            email: 'admin@gmail.com',
            isEmailVerified: true,
            role: 'admin' as const
          }
        },
        {
          email: 'rushabhnakum440@gmail.com',
          password: 'Rush@bh1206#2003',
          user: {
            id: 2,
            name: 'Rushabh Nakum',
            email: 'rushabhnakum440@gmail.com',
            isEmailVerified: true,
            role: 'client' as const
          }
        },
        // Alternative email format
        {
          email: 'rushabhnakum44@gmail.com',
          password: 'Rush@bh1206#2003',
          user: {
            id: 2,
            name: 'Rushabh Nakum',
            email: 'rushabhnakum44@gmail.com',
            isEmailVerified: true,
            role: 'client' as const
          }
        }
      ];

      // Check if using predefined credentials (case-insensitive email matching)
      const matchedCredential = predefinedCredentials.find(
        cred => cred.email.toLowerCase() === data.email.toLowerCase() && cred.password === data.password
      );

      if (matchedCredential) {
        const mockTokens = {
          access_token: 'mock_access_token_' + Date.now(),
          refresh_token: 'mock_refresh_token_' + Date.now(),
        };
        
        // Complete progress
        setLoginProgress(100);
        if (progressInterval) clearInterval(progressInterval);
        
        // Set authentication state immediately for faster navigation
        login(matchedCredential.user, mockTokens.access_token, mockTokens.refresh_token);
        
        // Show success message briefly then navigate
        showMessage('success', `Welcome back, ${matchedCredential.user.name}!`);
        
        // Navigate immediately without waiting for message
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
        return;
      }
      
      // Check if using temporary credentials from email
      const tempCredentials = JSON.parse(localStorage.getItem('tempCredentials') || 'null');
      if (tempCredentials && tempCredentials.email === data.email) {
        if (data.password === tempCredentials.password) {
          // Successful login with temporary credentials
          const mockUser = {
            id: 3,
            name: 'Temporary User',
            email: data.email,
            isEmailVerified: false,
            role: 'temporary' as const
          };
          
          const mockTokens = {
            access_token: 'mock_access_token_' + Date.now(),
            refresh_token: 'mock_refresh_token_' + Date.now(),
          };
          
          // Complete progress
          setLoginProgress(100);
          if (progressInterval) clearInterval(progressInterval);
          
          login(mockUser, mockTokens.access_token, mockTokens.refresh_token);
          localStorage.removeItem('tempCredentials');
          
          // Navigate immediately for temporary credentials too
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
          return;
        }
      }
      
      // If no credentials match, show error with helpful information
      showMessage('error', 'Invalid email or password. Please check your credentials and try again. Make sure you\'re using the correct email format and password.');
    } catch (error) {
      console.error('Login failed:', error);
      showMessage('error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
      setLoginProgress(0);
      if (progressInterval) clearInterval(progressInterval);
    }
  };

  const handleSignup = async (data: RegisterCredentials) => {
    try {
      setIsLoading(true);
      
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send both verification email and temporary credentials
      const [verificationResult, tempCredentialsResult] = await Promise.all([
        emailService.sendVerificationEmail(data.email, 'verification_token_' + Date.now()),
        emailService.sendTemporaryCredentials(data.email)
      ]);
      
      if (verificationResult.success && tempCredentialsResult.success) {
        showMessage('success', `Account created successfully! You've received both verification email and temporary login credentials. Check your email to get started immediately!`);
      } else if (verificationResult.success) {
        showMessage('success', `Account created successfully! ${verificationResult.message}`);
      } else {
        showMessage('success', 'Account created successfully! Please check your email for verification.');
      }
      
      // Switch to login tab
      setTimeout(() => {
        setTabValue(0);
      }, 2000);
    } catch (error) {
      console.error('Signup failed:', error);
      showMessage('error', 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return <LoadingSpinner message="Initializing..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2, md: 3 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      }}
    >
      <Container 
        maxWidth="md" 
        sx={{ 
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in timeout={800}>
          <Card
            elevation={0}
            sx={{
              borderRadius: { xs: 2, sm: 3, md: 4 },
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              maxWidth: { xs: '100%', sm: '500px', md: '600px' },
              mx: 'auto',
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: { xs: 3, sm: 4, md: 5 },
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  animation: 'rotate 20s linear infinite',
                },
                '@keyframes rotate': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  component="img"
                  src="/Gemini_Generated_Image_o5gli0o5gli0o5gl.svg"
                  alt="EquaityWaves.ai Logo"
                  sx={{ 
                    width: { xs: 40, sm: 48, md: 56 }, 
                    height: { xs: 40, sm: 48, md: 56 },
                    mb: 2 
                  }}
                />
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    mb: 1
                  }}
                >
                  EquaityWaves.ai
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                  }}
                >
                  Your AI-powered equity analysis platform
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {/* Tab Navigation */}
              <Box 
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  background: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      py: { xs: 2, sm: 2.5 },
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 126, 234, 0.08)',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }
                  }}
                >
                  <Tab 
                    icon={<LoginIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />} 
                    label="Login" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<SignupIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />} 
                    label="Sign Up" 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Progress Bar */}
              {isLoading && (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={loginProgress} 
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }
                    }}
                  />
                </Box>
              )}

              {/* Form Content */}
              <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <TabPanel value={tabValue} index={0}>
                  <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <SignupForm onSubmit={handleSignup} isLoading={isLoading} />
                </TabPanel>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Demo Credentials Info */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🚀 Demo Credentials
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            Use these credentials to test the application:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" fontWeight="bold">Admin Account:</Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>admin@gmail.com</Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>Admin!1234</Typography>
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" fontWeight="bold">Client Account:</Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>rushabhnakum44@gmail.com</Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>Rush@bh1206#2003</Typography>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={!!message}
          autoHideDuration={6000}
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setMessage(null)} 
            severity={message?.type}
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {message?.text}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
} 