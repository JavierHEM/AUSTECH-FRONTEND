// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, // Asegurarnos que Button está explícitamente importado
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  useMediaQuery, 
  useTheme,
  Badge,
  Collapse,
  ListItemButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications as NotificationsIcon,
  ExpandLess,
  ExpandMore,
  Category as CatalogIcon,
  AssessmentOutlined as ReportIcon,
  NotificationsNone as NotificationOffIcon,
  HelpOutline as HelpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import authService from '../../services/authService';
import afiladoService from '../../services/afiladoService';

// Ancho del sidebar
const drawerWidth = 280;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode(); // Obtener el estado del modo oscuro
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estado para manejar la apertura/cierre del sidebar en móviles
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Estado para el menú de usuario
  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);
  
  // Estado para el menú de notificaciones
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const openNotificationMenu = Boolean(notificationAnchorEl);
  
  // Estado para los submenús expandidos
  const [openSubMenus, setOpenSubMenus] = useState({
    catalogos: false,
    reportes: false
  });
  
  // Estado para notificaciones
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Estado para alertas/mensajes
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Comprobar si hay mensaje en la navegación (state)
  useEffect(() => {
    if (location.state?.message) {
      setAlert({
        open: true,
        message: location.state.message,
        severity: location.state.severity || 'success'
      });
      
      // Limpiar el mensaje después de mostrarlo
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Obtener afilados pendientes para notificaciones
  useEffect(() => {
    const fetchAfiladosPendientes = async () => {
      if (user) {
        try {
          const response = await afiladoService.getAfiladosPendientes();
          if (response.success) {
            const newNotifications = response.data.slice(0, 5).map(afilado => ({
              id: afilado.id,
              title: `Afilado pendiente`,
              description: `Sierra: ${afilado.sierras?.codigo || 'No especificada'}`,
              time: new Date(afilado.fecha_afilado).toLocaleString(),
              unread: true
            }));
            
            setNotifications(newNotifications);
            setNotificationCount(response.data.length);
          }
        } catch (error) {
          console.error('Error al obtener afilados pendientes:', error);
        }
      }
    };
    
    fetchAfiladosPendientes();
    
    // Configurar intervalo para actualizar notificaciones
    const interval = setInterval(fetchAfiladosPendientes, 300000); // Cada 5 minutos
    
    return () => clearInterval(interval);
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/perfil');
  };

  const handleSubMenuToggle = (menuName) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleAlertClose = () => {
    setAlert(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleNotificationClick = (notificationId) => {
    // Marcar como leída
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false } 
          : notification
      )
    );
    
    // Redirigir a la página correspondiente
    navigate(`/afilados/${notificationId}`);
    handleNotificationMenuClose();
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
    handleNotificationMenuClose();
  };

  // Items del menú lateral
  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      roles: ['Gerente', 'Administrador', 'Cliente'] 
    },
    { 
      text: 'Usuarios', 
      icon: <PersonIcon />, 
      path: '/usuarios',
      roles: ['Gerente', 'Administrador'] 
    },
    { 
      text: 'Clientes', 
      icon: <BusinessIcon />, 
      path: '/clientes',
      roles: ['Gerente', 'Administrador', 'Cliente'] 
    },
    { 
      text: 'Sucursales', 
      icon: <SucursalIcon />, 
      path: '/sucursales',
      roles: ['Gerente', 'Administrador', 'Cliente'] 
    },
    { 
      text: 'Sierras', 
      icon: <SierraIcon />, 
      path: '/sierras',
      roles: ['Gerente', 'Administrador', 'Cliente'] 
    },
    { 
      text: 'Afilados', 
      icon: <AfiladoIcon />, 
      path: '/afilados',
      roles: ['Gerente', 'Administrador', 'Cliente'] 
    },
    { 
      text: 'Catálogos',
      icon: <CatalogIcon />,
      submenu: true,
      roles: ['Gerente', 'Administrador'],
      items: [
        { text: 'Tipos de Sierra', path: '/catalogos/tipos-sierra' },
        { text: 'Tipos de Afilado', path: '/catalogos/tipos-afilado' },
        { text: 'Estados de Sierra', path: '/catalogos/estados-sierra' }
      ]
    },
    { 
      text: 'Reportes',
      icon: <ReportIcon />,
      submenu: true,
      roles: ['Gerente', 'Administrador'],
      items: [
        { text: 'Afilados por Cliente', path: '/reportes/afilados-cliente' },
        { text: 'Afilados por Sucursal', path: '/reportes/afilados-sucursal' },
        { text: 'Historial de Sierras', path: '/reportes/historial-sierras' }
      ]
    }
  ];

  // Filtrar menú según rol del usuario
  const filteredMenuItems = menuItems.filter(
    item => !item.roles || (user && item.roles.includes(user.rol))
  );

  const isActiveRoute = (path) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isActiveSubRoute = (item) => {
    return item.items && item.items.some(subItem => isActiveRoute(subItem.path));
  };

  const drawer = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 2,
          backgroundColor: darkMode ? 'primary.dark' : 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        {/* Logo o título del sistema */}
        <Box 
          sx={{ 
            height: 40, 
            width: 40,
            mb: 1,
            bgcolor: 'primary.contrastText',
            color: darkMode ? 'primary.dark' : 'primary.main',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          SA
        </Box>
        <Typography variant="h5" component="div" fontWeight="bold" sx={{ my: 1 }}>
          Sistema Afilado
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List>
          {filteredMenuItems.map((item) => (
            item.submenu ? (
              <React.Fragment key={item.text}>
                <ListItemButton
                  onClick={() => handleSubMenuToggle(item.text.toLowerCase())}
                  sx={{
                    borderRadius: '8px',
                    mx: 1,
                    mb: 0.5,
                    backgroundColor: isActiveSubRoute(item) ? 'rgba(21, 101, 192, 0.12)' : 'transparent',
                    color: isActiveSubRoute(item) ? 'primary.main' : 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(21, 101, 192, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActiveSubRoute(item) ? 'primary.main' : 'inherit'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {openSubMenus[item.text.toLowerCase()] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse 
                  in={openSubMenus[item.text.toLowerCase()]} 
                  timeout="auto" 
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.items.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        sx={{
                          pl: 4,
                          borderRadius: '8px',
                          mx: 1,
                          mb: 0.5,
                          backgroundColor: isActiveRoute(subItem.path) ? 'rgba(21, 101, 192, 0.12)' : 'transparent',
                          color: isActiveRoute(subItem.path) ? 'primary.main' : 'inherit',
                          '&:hover': {
                            backgroundColor: 'rgba(21, 101, 192, 0.08)',
                          },
                        }}
                        onClick={() => {
                          navigate(subItem.path);
                          if (isMobile) setMobileOpen(false);
                        }}
                      >
                        <ListItemText 
                          primary={subItem.text} 
                          primaryTypographyProps={{ 
                            fontSize: '0.9rem',
                            fontWeight: isActiveRoute(subItem.path) ? 'medium' : 'normal'
                          }} 
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItemButton
                key={item.text} 
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  mx: 1,
                  mb: 0.5,
                  backgroundColor: isActiveRoute(item.path) ? 'rgba(21, 101, 192, 0.12)' : 'transparent',
                  color: isActiveRoute(item.path) ? 'primary.main' : 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(21, 101, 192, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActiveRoute(item.path) ? 'primary.main' : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            )
          ))}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
          © {new Date().getFullYear()} Sistema Afilado
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          v1.0.0
        </Typography>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Barra superior */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.05)',
          bgcolor: darkMode ? 'background.paper' : 'background.paper',
          color: darkMode ? 'text.primary' : 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menú"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div">
              {filteredMenuItems.find(item => {
                if (item.submenu) {
                  return item.items.some(subItem => isActiveRoute(subItem.path));
                }
                return isActiveRoute(item.path);
              })?.text || 'Sistema Afilado'}
            </Typography>
          </Box>
          
          {/* Botón de modo oscuro/claro */}
          <Tooltip title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            <IconButton onClick={toggleDarkMode} color="inherit" sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          {/* Botón de ayuda */}
          <Tooltip title="Ayuda">
            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate('/ayuda')}
              sx={{ mr: 1 }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
          
          {/* Notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notificationAnchorEl}
            open={openNotificationMenu}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              elevation: 2,
              sx: { 
                width: 320,
                maxHeight: 400,
                overflow: 'auto'
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Notificaciones
              </Typography>
            </Box>
            
            {notifications.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <NotificationOffIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No hay notificaciones
                </Typography>
              </Box>
            ) : (
              <>
                {notifications.map(notification => (
                  <MenuItem 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification.id)}
                    sx={{ 
                      borderLeft: notification.unread ? '3px solid' : 'none',
                      borderColor: 'primary.main',
                      backgroundColor: notification.unread ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
                      py: 1.5
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight={notification.unread ? 'bold' : 'normal'}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {notification.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                  <Button 
                    size="small" 
                    onClick={handleClearAllNotifications}
                  >
                    Borrar todas
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => {
                      navigate('/afilados?pendientes=true');
                      handleNotificationMenuClose();
                    }}
                  >
                    Ver todas
                  </Button>
                </Box>
              </>
            )}
          </Menu>
          
          {/* Perfil de usuario */}
          <Box>
            <Tooltip title={user?.nombre || 'Usuario'}>
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                aria-controls={openUserMenu ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openUserMenu ? 'true' : undefined}
              >
                <Avatar sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}>
                  {user?.nombre?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={openUserMenu}
              onClose={handleUserMenuClose}
              MenuListProps={{
                'aria-labelledby': 'user-button',
              }}
              PaperProps={{
                elevation: 2,
                sx: { minWidth: 200 }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.nombre || 'Usuario'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'email@example.com'}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                  {user?.rol || 'Usuario'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mi Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                handleUserMenuClose();
                navigate('/configuracion');
              }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Configuración</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Menú lateral para pantallas móviles */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="menú de navegación"
      >
        {/* Versión móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móviles
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Versión escritorio */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
      
      {/* Alerta para mensajes del sistema */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alert.severity}
          variant="filled"
          elevation={6}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainLayout;