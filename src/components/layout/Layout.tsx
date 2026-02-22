import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Track client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  // Set initial sidebar state based on screen size only after client mount
  useEffect(() => {
    if (isClient) {
      setSidebarOpen(!isMobile);
    }
  }, [isMobile, isClient]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ml: { xs: 0, md: sidebarOpen ? 0 : 0 }, // No margin adjustment needed with proper drawer
          width: { xs: '100%', md: sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 80px)' },
        }}
      >
        <Navbar onSidebarToggle={handleSidebarToggle} />
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            p: { xs: 1.5, sm: 2, md: 3 },
            bgcolor: 'background.default',
            minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 70px)' },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 