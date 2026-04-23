import { Box, CircularProgress, Typography, alpha } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 48, 
  fullScreen = true 
}: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        gap: 3,
        background: fullScreen ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
        color: fullScreen ? 'white' : 'text.primary',
        position: fullScreen ? 'fixed' : 'relative',
        top: fullScreen ? 0 : 'auto',
        left: fullScreen ? 0 : 'auto',
        width: fullScreen ? '100%' : 'auto',
        zIndex: fullScreen ? 9999 : 'auto',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress 
          color="inherit" 
          size={size}
          thickness={3}
          sx={{
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
        {fullScreen && (
          <Box
            sx={{
              position: 'absolute',
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: '50%',
              background: alpha('#ffffff', 0.1),
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.8)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'scale(1.2)',
                  opacity: 0,
                },
              },
            }}
          />
        )}
      </Box>
      <Typography 
        variant="h6" 
        fontWeight="medium"
        sx={{
          textAlign: 'center',
          maxWidth: 300,
          lineHeight: 1.5,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};
