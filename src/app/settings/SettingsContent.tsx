'use client';

import { useState } from 'react';
import { 
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
  Button
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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

interface SettingsContentProps {
  onSave: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  onDelete: () => void;
  loading: boolean;
}

export default function SettingsContent({ onSave, onReset, onExport, onImport, onDelete, loading }: SettingsContentProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const handleSettingChange = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {/* Appearance Settings */}
      <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
          <CardHeader 
            title="Appearance"
            avatar={<PaletteIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={settings.appearance.fontSize}
                    onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                    label="Font Size"
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                    />
                  }
                  label="Compact Mode"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
          <CardHeader 
            title="Notifications"
            avatar={<NotificationsIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.marketUpdates}
                      onChange={(e) => handleSettingChange('notifications', 'marketUpdates', e.target.checked)}
                    />
                  }
                  label="Market Updates"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.priceAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'priceAlerts', e.target.checked)}
                    />
                  }
                  label="Price Alerts"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Data & Privacy Settings */}
      <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
          <CardHeader 
            title="Data & Localization"
            avatar={<DataUsageIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.data.currency}
                    onChange={(e) => handleSettingChange('data', 'currency', e.target.value)}
                    label="Currency"
                  >
                    <MenuItem value="INR">₹ INR</MenuItem>
                    <MenuItem value="USD">$ USD</MenuItem>
                    <MenuItem value="EUR">€ EUR</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.data.language}
                    onChange={(e) => handleSettingChange('data', 'language', e.target.value)}
                    label="Language"
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
          <CardHeader 
            title="Privacy & Security"
            avatar={<PrivacyIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    label="Profile Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.analytics}
                      onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                    />
                  }
                  label="Analytics"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.twoFactor}
                      onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Data Management */}
      <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <CardHeader 
            title="Data Management"
            avatar={<DataUsageIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={onExport}
                  fullWidth
                >
                  Export Data
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={onImport}
                  fullWidth
                >
                  Import Data
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={onReset}
                  fullWidth
                  color="warning"
                >
                  Reset Settings
                </Button>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  fullWidth
                  color="error"
                >
                  Delete Account
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>      
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size={20} /> : 'Save Settings'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
