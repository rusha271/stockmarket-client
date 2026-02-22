import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  InputAdornment, 
  IconButton,
  Link,
  Divider,
  Alert
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon, 
  Lock as LockIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { LoginCredentials } from '@/types/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

interface LoginFormProps {
  onSubmit: (data: LoginCredentials) => void;
  isLoading?: boolean;
}

export const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box>
      <Typography 
        variant="h4" 
        fontWeight="bold" 
        textAlign="center" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
          mb: 1
        }}
      >
        Welcome Back! 👋
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        textAlign="center" 
        sx={{ 
          mb: 4,
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }}
      >
        Sign in to your account to continue
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          autoFocus
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              '&.Mui-focused': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
              }
            }
          }}
        />
        
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePassword}
                  edge="end"
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              '&.Mui-focused': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
              }
            }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Link 
            href="#" 
            variant="body2" 
            color="primary"
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={isLoading ? <LoadingSpinner size={20} /> : <LoginIcon />}
          sx={{
            py: { xs: 1.5, sm: 2 },
            mb: 3,
            borderRadius: 2,
            background: isLoading 
              ? 'rgba(102, 126, 234, 0.7)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: isLoading 
              ? '0 2px 8px rgba(102, 126, 234, 0.2)' 
              : '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: isLoading 
                ? 'rgba(102, 126, 234, 0.7)' 
                : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: isLoading ? 'none' : 'translateY(-2px)',
              boxShadow: isLoading 
                ? '0 2px 8px rgba(102, 126, 234, 0.2)' 
                : '0 8px 25px rgba(102, 126, 234, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
            '&.Mui-disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            }
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Alert 
          severity="info" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
            }
          }}
        >
          <Typography variant="body2">
            Don't have an account? Use the <strong>"Sign Up"</strong> tab to create an account and receive temporary login credentials.
          </Typography>
        </Alert>

        {/* Quick Test Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // Auto-fill admin credentials
              const emailField = document.getElementById('email') as HTMLInputElement;
              const passwordField = document.getElementById('password') as HTMLInputElement;
              if (emailField) emailField.value = 'admin@gmail.com';
              if (passwordField) passwordField.value = 'Admin!1234';
            }}
            sx={{ flex: 1, fontSize: '0.75rem' }}
          >
            Test Admin
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // Auto-fill client credentials
              const emailField = document.getElementById('email') as HTMLInputElement;
              const passwordField = document.getElementById('password') as HTMLInputElement;
              if (emailField) emailField.value = 'rushabhnakum44@gmail.com';
              if (passwordField) passwordField.value = 'Rush@bh1206#2003';
            }}
            sx={{ flex: 1, fontSize: '0.75rem' }}
          >
            Test Client
          </Button>
        </Box>
      </Box>
    </Box>
  );
}; 