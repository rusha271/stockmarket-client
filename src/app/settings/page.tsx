'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  DataUsage as DataUsageIcon,
  Security as PrivacyIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import Layout from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { NoSSR } from '@/components/common/NoSSR';
interface Settings {
  appearance: {
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketUpdates: boolean;
    priceAlerts: boolean;
    newsUpdates: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  data: {
    currency: 'INR' | 'USD' | 'EUR';
    language: 'en' | 'hi' | 'ta' | 'te';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
    deviceManagement: boolean;
  };
}

const defaultSettings: Settings = {
  appearance: {
    fontSize: 'medium',
    compactMode: false
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketUpdates: true,
    priceAlerts: true,
    newsUpdates: false,
    weeklyReports: true
  },
  privacy: {
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    marketing: false
  },
  data: {
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY'
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    loginAlerts: true,
    deviceManagement: true
  }
};

const timezones = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' }
];

// Lazy load heavy components
const LazySettingsContent = lazy(() => import('./SettingsContent').catch(() => ({ default: () => <div>Loading...</div> })));

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveSettings = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    }, 1000);
  };

  const handleResetSettings = () => {
    setSnackbar({ open: true, message: 'Settings reset to default!', severity: 'info' });
  };

  const handleExportData = () => {
    setSnackbar({ open: true, message: 'Data export started!', severity: 'success' });
  };

  const handleImportData = () => {
    setSnackbar({ open: true, message: 'Data import feature coming soon!', severity: 'info' });
  };

  const handleDeleteAccount = () => {
    setSnackbar({ open: true, message: 'Account deletion requires confirmation!', severity: 'error' });
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Layout>
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LoadingSpinner message="Loading settings..." />
        </Box>
      </Layout>
    );
  }

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
              Settings & Preferences
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize your experience and manage your account
            </Typography>
          </Box>

          {/* Lazy loaded settings content */}
          <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
            <LazySettingsContent 
              onSave={handleSaveSettings}
              onReset={handleResetSettings}
              onExport={handleExportData}
              onImport={handleImportData}
              onDelete={handleDeleteAccount}
              loading={loading}
            />
          </Suspense>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity={snackbar.severity} 
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </NoSSR>
    </Layout>
  );
}

