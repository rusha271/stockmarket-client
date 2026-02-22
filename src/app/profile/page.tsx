'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Snackbar,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  History as HistoryIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import Layout from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { NoSSR } from '@/components/common/NoSSR';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  totalInvestments: number;
  portfolioValue: number;
  totalReturns: number;
  returnPercentage: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketUpdates: boolean;
    priceAlerts: boolean;
    newsUpdates: boolean;
  };
  preferences: {
    currency: 'INR' | 'USD';
    language: 'en' | 'hi';
    timezone: string;
  };
}

const mockProfile: UserProfile = {
  id: 1,
  name: 'Rushabh Nakum',
  email: 'rushabhnakum44@gmail.com',
  phone: '+91 9876543210',
  location: 'Mumbai, India',
  joinDate: '2024-01-15',
  totalInvestments: 250000,
  portfolioValue: 287500,
  totalReturns: 37500,
  returnPercentage: 15.0,
  riskProfile: 'Moderate',
  notifications: {
    email: true,
    sms: false,
    push: true,
    marketUpdates: true,
    priceAlerts: true,
    newsUpdates: false
  },
  preferences: {
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata'
  }
};

const recentActivities = [
  {
    id: 1,
    action: 'Bought 10 shares of RELIANCE',
    timestamp: '2 hours ago',
    amount: 24565.00,
    type: 'buy'
  },
  {
    id: 2,
    action: 'Sold 5 shares of TCS',
    timestamp: '1 day ago',
    amount: 19228.75,
    type: 'sell'
  },
  {
    id: 3,
    action: 'Added to watchlist: HDFCBANK',
    timestamp: '2 days ago',
    amount: 0,
    type: 'watchlist'
  },
  {
    id: 4,
    action: 'Price alert triggered: INFY',
    timestamp: '3 days ago',
    amount: 0,
    type: 'alert'
  }
];

export default function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [editForm, setEditForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location
    });
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        ...editForm
      }));
      setIsEditing(false);
      setLoading(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location
    });
  };

  const handleNotificationChange = (key: keyof UserProfile['notifications']) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUpIcon color="success" />;
      case 'sell': return <TrendingUpIcon color="error" sx={{ transform: 'rotate(180deg)' }} />;
      case 'watchlist': return <StarIcon color="warning" />;
      case 'alert': return <NotificationsIcon color="info" />;
      default: return <HistoryIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'buy': return 'success.main';
      case 'sell': return 'error.main';
      case 'watchlist': return 'warning.main';
      case 'alert': return 'info.main';
      default: return 'text.secondary';
    }
  };

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
              Profile & Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account settings and preferences
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Profile Overview */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {profile.name.charAt(0)}
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {profile.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {profile.email}
                  </Typography>
                  
                  <Chip 
                    label={profile.riskProfile} 
                    color={profile.riskProfile === 'Aggressive' ? 'error' : profile.riskProfile === 'Moderate' ? 'warning' : 'success'}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    Member since {new Date(profile.joinDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>

              {/* Portfolio Summary */}
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardHeader title="Portfolio Summary" />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Investments
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ₹{profile.totalInvestments.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Value
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ₹{profile.portfolioValue.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Returns
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ₹{profile.totalReturns.toLocaleString()} ({profile.returnPercentage >= 0 ? '+' : ''}{profile.returnPercentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Profile Details */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.666% - 16px)' }, minWidth: 0 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
                <CardHeader 
                  title="Personal Information"
                  action={
                    !isEditing ? (
                      <Button startIcon={<EditIcon />} onClick={handleEdit}>
                        Edit
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          startIcon={<SaveIcon />} 
                          onClick={handleSave}
                          disabled={loading}
                          color="primary"
                        >
                          Save
                        </Button>
                        <Button 
                          startIcon={<CancelIcon />} 
                          onClick={handleCancel}
                          color="secondary"
                        >
                          Cancel
                        </Button>
                      </Box>
                    )
                  }
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                      <TextField
                        label="Full Name"
                        value={isEditing ? editForm.name : profile.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                      <TextField
                        label="Email"
                        value={isEditing ? editForm.email : profile.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                      <TextField
                        label="Phone"
                        value={isEditing ? editForm.phone : profile.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                      <TextField
                        label="Location"
                        value={isEditing ? editForm.location : profile.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        fullWidth
                        InputProps={{
                          startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
                <CardHeader 
                  title="Notification Settings"
                  avatar={<NotificationsIcon />}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifications.email}
                            onChange={() => handleNotificationChange('email')}
                          />
                        }
                        label="Email Notifications"
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifications.sms}
                            onChange={() => handleNotificationChange('sms')}
                          />
                        }
                        label="SMS Notifications"
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifications.push}
                            onChange={() => handleNotificationChange('push')}
                          />
                        }
                        label="Push Notifications"
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifications.marketUpdates}
                            onChange={() => handleNotificationChange('marketUpdates')}
                          />
                        }
                        label="Market Updates"
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifications.priceAlerts}
                            onChange={() => handleNotificationChange('priceAlerts')}
                          />
                        }
                        label="Price Alerts"
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>   
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.notifications.newsUpdates}
                            onChange={() => handleNotificationChange('newsUpdates')}
                          />
                        }
                        label="News Updates"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardHeader 
                  title="Recent Activity"
                  avatar={<HistoryIcon />}
                />
                <CardContent>
                  <List>
                    {recentActivities.map((activity) => (
                      <ListItem key={activity.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1">
                                {activity.action}
                              </Typography>
                              {activity.amount > 0 && (
                                <Typography 
                                  variant="body2" 
                                  color={getActivityColor(activity.type)}
                                  fontWeight="bold"
                                >
                                  ₹{activity.amount.toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={activity.timestamp}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

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
