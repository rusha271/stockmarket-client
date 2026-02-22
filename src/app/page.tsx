'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HomePage() {
  const { isInitialized } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }
  }, []);

  useEffect(() => {
    if (isClient && isInitialized) {
      // Skip login for now: always go to dashboard
      // if (isAuthenticated) {
      router.push('/dashboard');
      // } else {
      //   router.push('/login');
      // }
    }
  }, [isInitialized, router, isClient]);

  // Always show loading state to prevent hydration mismatch
  // The actual navigation will happen in useEffect
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
        Loading...
      </Typography>
    </Box>
  );
}
