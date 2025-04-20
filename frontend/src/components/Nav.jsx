import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));


export default function Nav() {
  const [token, setToken] = React.useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  React.useEffect(() => {
    const updateToken = () => {
      setToken(localStorage.getItem('token'));
    };
  
    window.addEventListener('login', updateToken);
    window.addEventListener('storage', updateToken); // optional: for cross-tab sync
  
    return () => {
      window.removeEventListener('login', updateToken);
      window.removeEventListener('storage', updateToken);
    };
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login'); 
  };

  return (
    
    <AppBar 
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg" >
        <StyledToolbar variant="dense" disableGutters style={{backgroundColor:'#04101f'}}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }} style={{color: '#4876ee'}}>
            App Name
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            {!token?(
              <>
                <Link to='/login'>
                <Button color="primary" variant="text" size="small">
                  Sign in
                </Button>
              </Link>
              <Button color="primary" variant="contained" size="small">
                Sign up
              </Button>
              </>
            ):(
              <>
                <Link to='/login'>
                <Button color="primary" variant="text" size="small" onClick={handleLogout}>
                  LogOut
                </Button>
              </Link>
              </>
            ) 
            }
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
