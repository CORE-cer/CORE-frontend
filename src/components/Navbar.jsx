import { useTheme } from '@emotion/react';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMemo, useState } from 'react';
import { matchPath, useLocation } from 'react-router';
import { useDarkModeContext } from '../context/DarkModeContext';
import { DRAWER_WIDTH } from '../MUIThemes';
import Main from './Main';

const Logo = () => {
  return (
    <Typography variant="h6" noWrap>
      <Link
        href="/"
        sx={{
          mr: 4,
          display: 'flex',
          fontWeight: 700,
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        CORE
      </Link>
    </Typography>
  );
};

const DrawerListItem = ({ text, href }) => {
  const { pathname } = useLocation();

  const isActive = useMemo(() => {
    return !!matchPath(pathname, href);
  }, [pathname, href]);

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton component={Link} href={href} disabled={isActive}>
          <ListItemText primary={text} />
        </ListItemButton>
      </ListItem>
    </>
  );
};

export default function Navbar({ children }) {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const darkModeContext = useDarkModeContext();

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar
        position="fixed"
        variant="outlined"
        elevation={0}
        color="transparent"
        components={{}}
        sx={{
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : theme.palette.background.paper,
          zIndex: (theme) =>
            isBelowMd ? theme.zIndex.appBar : theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar variant="dense">
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            edge="start"
            sx={{
              mr: 1,
              display: {
                xs: 'flex',
                md: 'none',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Logo />
          <Box sx={{ flexGrow: 1, display: 'flex' }} />
          <Tooltip title="Toggle Dark Mode" sx={{ flexGrow: 0 }}>
            <IconButton edge="end" onClick={darkModeContext.toggleDarkMode}>
              {theme.palette.mode === 'dark' ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Toolbar variant="dense" />
      <Drawer
        open={isBelowMd ? drawerOpen : false}
        onClose={() => setDrawerOpen(false)}
        variant={isBelowMd ? 'temporary' : 'permanent'}
        anchor="left"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar variant="dense">
          <Logo />
        </Toolbar>
        <Divider />
        <List dense>
          <DrawerListItem text="Query" href="/" />
          <DrawerListItem text="Watch" href="/watch" />
          <DrawerListItem text="About" href="/about" />
        </List>
      </Drawer>
      <Main permanentDrawer={!isBelowMd}>{children}</Main>
    </>
  );
}
