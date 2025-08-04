import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  IconButton,
  Tooltip,
  AppBar,
  Box,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ThemeSelector from '../components/ThemeSelector.jsx';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';

const navItems = [
  { label: 'Clientes', path: '/clients', icon: <GroupIcon /> },
  { label: 'Permisos', path: '/permissions', icon: <SecurityIcon /> },
  { label: 'Logística', path: '/logistics', icon: <LocalShippingIcon /> },
];

export default function DashboardLayout({ themeName, setThemeName }) {
  const [open, setOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Verifica token en cada render
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }

    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setNombreUsuario(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogoutClick = () => {
    setConfirmLogoutOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.clear();
    navigate("/login"); // Usamos navigate, más limpio que window.location.href
  };

  const handleLogoutCancel = () => {
    setConfirmLogoutOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SIG – Gestión
          </Typography>

          <Typography variant="body1" sx={{ mr: 2 }}>
            {nombreUsuario}
          </Typography>

          <ThemeSelector themeName={themeName} setThemeName={setThemeName} />

          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={handleLogoutClick}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>

          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 40, ml: 2, opacity: 0.9 }}
          />
        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" open={open}>
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={pathname.startsWith(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Toolbar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>

      <Dialog open={confirmLogoutOpen} onClose={handleLogoutCancel}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vas a cerrar tu sesión actual. ¿Estás seguro?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" autoFocus>
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
