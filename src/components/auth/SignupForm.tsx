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
  Divider,
  Alert
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon, 
  Lock as LockIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { RegisterCredentials } from '@/types/auth';

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface SignupFormProps {
  onSubmit: (data: RegisterCredentials) => void;
  isLoading?: boolean;
}

export const SignupForm = ({ onSubmit, isLoading = false }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    resolver: yupResolver(schema),
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        Create Account 🚀
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
        Join EquityWave.ai and start tracking your investments
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          id="name"
          label="Full Name"
          autoComplete="name"
          autoFocus
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
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
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
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
          autoComplete="new-password"
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
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleToggleConfirmPassword}
                  edge="end"
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={<PersonAddIcon />}
          sx={{
            py: { xs: 1.5, sm: 2 },
            mb: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
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
            Already have an account? Use the <strong>&quot;Login&quot;</strong> tab to sign in.
          </Typography>
        </Alert>

        <Alert 
          severity="success"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
            }
          }}
        >
          <Typography variant="body2">
            <strong>Note:</strong> After creating your account, you&apos;ll receive both a verification email and temporary login credentials. This allows you to start using the dashboard immediately while your account is being verified.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};
