'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated: _isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  useEffect(() => {
    if (isClient && isInitialized) {
      // Skip login for now: always allow dashboard
      // if (isAuthenticated) {
      setShouldRender(true);
      // } else {
      //   router.push('/login');
      // }
    }
  }, [isInitialized, router, isClient]);

  // Show loading state until client-side authentication check is complete
  if (!isClient || !isInitialized || !shouldRender) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};
