import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import Divider from '@mui/material/Divider';
import { useAuth } from '@/context/AuthContext';
import { useTheme, useMediaQuery, alpha } from '@mui/material';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onSidebarToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle }) => {
  const { user: _user, logout } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [_anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const _handleLogout = () => {
    logout();
    handleProfileMenuClose();
    router.push('/login');
  };

  const handleSearch = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchValue.trim()) {
      // Handle search functionality
      console.log('Searching for:', searchValue);
    }
  };

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        backdropFilter: 'blur(10px)',
        background: theme.palette.background.paper,
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: 56, md: 70 }, 
        display: 'flex', 
        justifyContent: 'space-between', 
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 0.5, md: 0 }
      }}>
        <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
          <IconButton 
            onClick={onSidebarToggle} 
            aria-label="Toggle menu"
            sx={{ 
              mr: { xs: 0.5, sm: 1 }, 
              display: { xs: 'inline-flex', md: 'none' },
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              p: { xs: 1, sm: 1.25 },
              minWidth: 44,
              minHeight: 44,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
            <Box
              component="img"
              src="/Gemini_Generated_Image_o5gli0o5gli0o5gl.svg"
              alt="EquaityWaves.ai Logo"
              sx={{
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 },
                borderRadius: 2,
                objectFit: 'contain',
              }}
            />
            <Typography 
              variant="h6" 
              color="text.primary" 
              fontWeight={700} 
              sx={{ 
                letterSpacing: 1,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              EquaityWaves.ai
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {/* Search Bar */}
          <Box 
            sx={{ 
              position: 'relative', 
              borderRadius: 3, 
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              border: 1,
              borderColor: alpha(theme.palette.divider, 0.5),
              width: { xs: 'min(140px, 35vw)', sm: 200, md: 300 },
              minWidth: 0,
              transition: 'all 0.2s',
              '&:focus-within': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            }}
          >
            <Box sx={{ position: 'absolute', height: '100%', display: 'flex', alignItems: 'center', pl: { xs: 1.5, sm: 2 } }}>
              <SearchIcon color="action" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
            </Box>
            <InputBase
              placeholder={isMobile ? "Search..." : "Search stocks, companies..."}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleSearch}
              sx={{ 
                color: 'inherit', 
                pl: { xs: 4, sm: 5 }, 
                pr: { xs: 1, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                width: '100%',
                '& input': {
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                }
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>

          {/* Notifications */}
          <IconButton
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              p: { xs: 0.75, sm: 1 },
              '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 1),
              }
            }}
          >
            <NotificationsIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
          </IconButton>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile ? (
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  border: 1,
                  borderColor: alpha(theme.palette.divider, 0.5),
                  p: { xs: 0.5, sm: 0.75 },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 1),
                  }
                }}
              >
                <Avatar 
                  alt="User" 
                  sx={{ 
                    width: { xs: 24, sm: 28 }, 
                    height: { xs: 24, sm: 28 },
                    bgcolor: theme.palette.primary.main,
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            ) : (
              <Button
                onClick={handleProfileMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  border: 1,
                  borderColor: alpha(theme.palette.divider, 0.5),
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 1),
                  }
                }}
              >
                <Avatar 
                  alt="User" 
                  sx={{ 
                    width: { xs: 28, sm: 32 }, 
                    height: { xs: 28, sm: 32 },
                    bgcolor: theme.palette.primary.main,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  U
                </Avatar>
                <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    User
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    user@example.com
                  </Typography>
                </Box>
              </Button>
            )}

            {/* Profile / Settings dropdown - commented out for now
            <Menu
              anchorEl={_anchorEl}
              open={Boolean(_anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: { xs: 180, sm: 200 },
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={_handleLogout} 
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.contrastText'
                  }
                }}
              >
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
            */}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 