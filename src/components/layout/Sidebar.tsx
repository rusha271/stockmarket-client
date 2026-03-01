import React /* , { useState } */ from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
// import ShowChartIcon from '@mui/icons-material/ShowChart';
// import InsightsIcon from '@mui/icons-material/Insights';
// import PersonIcon from '@mui/icons-material/Person';
// import SettingsIcon from '@mui/icons-material/Settings';
// import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme, useMediaQuery, alpha } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
  // { label: 'Indian Stocks', icon: <ShowChartIcon />, href: '/stocks' },
  // { label: 'AI Insights', icon: <InsightsIcon />, href: '/insights' },
  // { label: 'Profile', icon: <PersonIcon />, href: '/profile' },
  // { label: 'Settings', icon: <SettingsIcon />, href: '/settings' },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = open ? 280 : 80;

  const handleNavigation = (href: string) => {
    router.push(href);
    if (isMobile) {
      onToggle();
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === href;
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          borderRight: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#ffffff', 0.2),
            borderRadius: '3px',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'white' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {open && (
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
              EquityWave.ai
            </Typography>
          )}
          <IconButton 
            onClick={onToggle} 
            sx={{ 
              color: 'white',
              bgcolor: alpha('#ffffff', 0.1),
              '&:hover': {
                bgcolor: alpha('#ffffff', 0.2),
              },
              transition: 'all 0.2s',
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: alpha('#ffffff', 0.2), mx: 2 }} />

        {/* Navigation */}
        <List sx={{ flex: 1, px: 1, py: 2 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <ListItemButton
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  justifyContent: open ? 'flex-start' : 'center',
                  py: { xs: 1.75, sm: 1.5 },
                  px: 2,
                  minHeight: 48,
                  bgcolor: active ? alpha('#ffffff', 0.2) : 'transparent',
                  color: active ? 'white' : alpha('#ffffff', 0.8),
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: active ? alpha('#ffffff', 0.25) : alpha('#ffffff', 0.1),
                    color: 'white',
                    transform: 'translateX(4px)',
                  },
                  '&:before': active ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: 24,
                    bgcolor: 'white',
                    borderRadius: '0 2px 2px 0',
                  } : {},
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0, 
                    color: 'inherit',
                    justifyContent: 'center', 
                    mr: open ? 2 : 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      color: 'inherit',
                      '& .MuiListItemText-primary': {
                        fontWeight: active ? 600 : 400,
                        fontSize: '0.9rem',
                      }
                    }} 
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: alpha('#ffffff', 0.2) }}>
          {open && (
            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.6), textAlign: 'center', display: 'block' }}>
              EquityWave.ai Beta
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 