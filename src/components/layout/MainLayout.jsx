// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button,
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
  Alert,
  Paper,
  InputBase,
  Fade,
  Zoom,
  alpha
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
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  ChevronLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import authService from '../../services/authService';
import afiladoService from '../../services/afiladoService';
import HelpCenter from '../help/HelpCenter';
import UserProfileModal from '../user/UserProfileModal';
import { motion } from 'framer-motion';

// Logo
import logo2 from '../../assets/logo2.png';
import logoR from '../../assets/logo_a.png';

// Ancho del sidebar
const drawerWidth = 280;
const drawerCollapsedWidth = 80;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estado para manejar la apertura/cierre del sidebar en móviles
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Estado para colapsar el sidebar en escritorio
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  const [helpOpen, setHelpOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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

  const handleHelpClick = () => {
    setHelpOpen(true);
  };

  const toggleDrawerCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busqueda?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
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

  const getMenuItemLabel = () => {
    // Buscar en items normales
    const activeItem = filteredMenuItems.find(item => {
      if (item.submenu) {
        return item.items.some(subItem => isActiveRoute(subItem.path));
      }
      return isActiveRoute(item.path);
    });

    if (activeItem) {
      if (activeItem.submenu) {
        // Si es un submenú, buscar cual subitem está activo
        const activeSubItem = activeItem.items.find(subItem => isActiveRoute(subItem.path));
        if (activeSubItem) {
          return activeSubItem.text;
        }
      }
      return activeItem.text;
    }
    
    return 'Sistema Afilado';
  };

  const drawer = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: isCollapsed ? 'center' : 'flex-start',
          p: isCollapsed ? 1 : 2,
          background: darkMode 
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
          color: 'primary.contrastText',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Logo y título con botón de expansión/contracción integrado */}
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            overflow: 'hidden'  // Añadido para controlar desbordamiento
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Box
                component="img"
                src={isMobile || isCollapsed ? logo_a : logo2}
                alt="Logo Sistema Afilado"
                sx={{
                  height: isCollapsed ? 30 : 40,  // Reducido un poco
                  maxWidth: isCollapsed ? drawerCollapsedWidth - 20 : 'auto',  // Control de ancho máximo
                  objectFit: isCollapsed ? 'cover' : 'contain',  // Ajuste de imagen
                  objectPosition: isCollapsed ? 'left center' : 'center',  // Posición del recorte
                  transition: 'all 0.3s ease',
                }}
              />
            </Zoom>
            {!isCollapsed && (
              <Fade in={true} timeout={800}>
                <Typography 
                  variant="h6" 
                  component="div" 
                  fontWeight="bold" 
                  sx={{ 
                    ml: 1,
                    whiteSpace: 'nowrap',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.15)'
                  }}
                >
                  Sistema Afilado
                </Typography>
              </Fade>
            )}
          </Box>
          
          {/* Botón de contracción integrado en el header */}
          {!isMobile && !isCollapsed && (
            <IconButton
              onClick={toggleDrawerCollapse}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                }
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}
        </Box>
        
        {/* Si está colapsado, mostrar botón para expandir en la parte inferior */}
        {!isMobile && isCollapsed && (
          <IconButton
            onClick={toggleDrawerCollapse}
            size="small"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 16,
              color: 'white',
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.2),
              },
              zIndex: 1100,
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
        )}
        
        {/* Información del usuario en el drawer */}
        {!isCollapsed && (
          <Box 
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{ 
              mt: 4, 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {user?.nombre?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
              <Typography 
                variant="subtitle2" 
                noWrap
                fontWeight="bold"
              >
                {user?.nombre || 'Usuario'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: alpha(theme.palette.common.white, 0.8),
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 'medium'
                }}
              >
                {user?.rol || 'Usuario'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <Box 
        sx={{ 
          overflow: 'auto', 
          flexGrow: 1,
          px: isCollapsed ? 0 : 1,
          py: 1,
          transition: 'all 0.3s ease'
        }}
      >
        <List component="nav">
          {filteredMenuItems.map((item, index) => (
            item.submenu ? (
              <React.Fragment key={item.text || index}>
                <ListItemButton
                  onClick={() => handleSubMenuToggle(item.text.toLowerCase())}
                  sx={{
                    borderRadius: '10px',
                    mb: 0.5,
                    py: 1.2,
                    px: isCollapsed ? 1 : 2,
                    minHeight: 48,
                    backgroundColor: isActiveSubRoute(item) ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: isActiveSubRoute(item) ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActiveSubRoute(item) ? 'primary.main' : 'inherit',
                    minWidth: isCollapsed ? 0 : 40,
                    mr: isCollapsed ? 0 : 2,
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  
                  {!isCollapsed && (
                    <>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          fontSize: '0.95rem',
                          fontWeight: isActiveSubRoute(item) ? 'medium' : 'normal'
                        }}
                      />
                      {openSubMenus[item.text.toLowerCase()] ? <ExpandLess /> : <ExpandMore />}
                    </>
                  )}
                </ListItemButton>
                
                {/* Submenús (solo visible cuando no está colapsado) */}
                {!isCollapsed && (
                  <Collapse 
                    in={openSubMenus[item.text.toLowerCase()]} 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.items.map((subItem, subIndex) => (
                        <ListItemButton
                          key={subItem.text || `subitem-${subIndex}`}
                          sx={{
                            pl: 4,
                            py: 1,
                            borderRadius: '10px',
                            mb: 0.5,
                            backgroundColor: isActiveRoute(subItem.path) ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                            color: isActiveRoute(subItem.path) ? 'primary.main' : 'text.primary',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            },
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={() => {
                            navigate(subItem.path);
                            if (isMobile) setMobileOpen(false);
                          }}
                        >
                          <ListItemText 
                            primary={subItem.text} 
                            primaryTypographyProps={{ 
                              fontSize: '0.85rem',
                              fontWeight: isActiveRoute(subItem.path) ? 'medium' : 'normal'
                            }} 
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ) : (
              <Tooltip 
                key={item.text || `item-${index}`}
                title={isCollapsed ? item.text : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: '10px',
                    mb: 0.5,
                    py: 1.2,
                    px: isCollapsed ? 1 : 2,
                    minHeight: 48,
                    backgroundColor: isActiveRoute(item.path) ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: isActiveRoute(item.path) ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActiveRoute(item.path) ? 'primary.main' : 'inherit',
                    minWidth: isCollapsed ? 0 : 40,
                    mr: isCollapsed ? 0 : 2,
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  
                  {!isCollapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontSize: '0.95rem',
                        fontWeight: isActiveRoute(item.path) ? 'medium' : 'normal'
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            )
          ))}
        </List>
      </Box>
      
      <Divider />
      
      {!isCollapsed && (
        <Box 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            backgroundColor: darkMode ? 'background.paper' : alpha(theme.palette.grey[100], 0.7)
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            © {new Date().getFullYear()} Sistema Afilado
          </Typography>
          <Typography variant="caption" color="text.secondary">
            v1.0.0
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <CssBaseline />
      
      {/* Barra superior */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { 
            xs: '100%',
            md: isCollapsed 
              ? `calc(100% - ${drawerCollapsedWidth}px)` 
              : `calc(100% - ${drawerWidth}px)` 
          },
          ml: { 
            xs: 0, 
            md: isCollapsed ? drawerCollapsedWidth : drawerWidth 
          },
          bgcolor: darkMode ? 'background.paper' : 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="abrir menú"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {getMenuItemLabel()}
            </Typography>
          </Box>
          
          {/* Barra de búsqueda */}
          <Box 
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: { xs: 'none', sm: 'block' },
              position: 'relative',
              ml: 3,
              mr: 'auto',
              width: '40%',
              maxWidth: '500px'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '100px',
                px: 2,
                height: 40,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
                },
                transition: 'all 0.2s ease'
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  flex: 1,
                  fontSize: '0.9rem'
                }}
              />
            </Paper>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>  
            {/* Botón de modo oscuro/claro */}
            <Tooltip title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
              <IconButton 
                onClick={toggleDarkMode} 
                color="inherit" 
                sx={{ 
                  mr: 1,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* Botón de ayuda */}
            <Tooltip title="Ayuda">
              <IconButton
                color="inherit"
                onClick={handleHelpClick}
                sx={{ 
                  mr: 1,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
            
            {/* Notificaciones */}
            <Tooltip title="Notificaciones">
              <IconButton
                color="inherit"
                onClick={handleNotificationMenuOpen}
                sx={{ 
                  mr: 1.5,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Badge 
                  badgeContent={notificationCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      transform: 'scale(0.9) translate(50%, -50%)',
                    }
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Menú de notificaciones */}
            <Menu
              anchorEl={notificationAnchorEl}
              open={openNotificationMenu}
              onClose={handleNotificationMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { 
                  width: 320,
                  maxHeight: 440,
                  overflow: 'auto',
                  borderRadius: 2,
                  mt: 1,
                  pt: 1
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Notificaciones
                </Typography>
                <Badge 
                  badgeContent={notificationCount} 
                  color="error"
                  sx={{ transform: 'scale(0.8)' }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </Box>
              
              {notifications.length === 0 ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    py: 4 
                  }}
                >
                  <NotificationOffIcon 
                    color="disabled" 
                    sx={{ 
                      fontSize: 48, 
                      mb: 1.5,
                      opacity: 0.7 
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    No tienes notificaciones
                  </Typography>
                </Box>
              ) : (
                <>
                  <List sx={{ py: 0 }}>
                    {notifications.map((notification, index) => (
                      <ListItem 
                        key={notification.id || `notification-${index}`}
                        component={motion.div}
                        whileHover={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          x: 2
                        }}
                        button
                        onClick={() => handleNotificationClick(notification.id)}
                        sx={{ 
                          borderLeft: notification.unread ? '3px solid' : 'none',
                          borderColor: 'primary.main',
                          backgroundColor: notification.unread ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          py: 1.5,
                          px: 2
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight={notification.unread ? 'bold' : 'normal'}
                            sx={{ mb: 0.5 }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            noWrap
                            sx={{ mb: 0.5 }}
                          >
                            {notification.description}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              display: 'block',
                              textAlign: 'right',
                              fontStyle: 'italic'
                            }}
                          >
                            {notification.time}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider />
                  
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      display: 'flex', 
                      justifyContent: 'space-between'
                    }}
                  >
                    <Button 
                      size="small" 
                      color="inherit"
                      onClick={handleClearAllNotifications}
                      sx={{ fontSize: '0.8rem' }}
                    >
                      Borrar todas
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        navigate('/afilados?pendientes=true');
                        handleNotificationMenuClose();
                      }}
                      sx={{ fontSize: '0.8rem' }}
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
                  sx={{ 
                    p: 0.5,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Avatar sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                    color: 'white',
                    fontWeight: 'bold'
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
                  elevation: 3,
                  sx: { 
                    minWidth: 220,
                    borderRadius: 2,
                    mt: 1,
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box 
                  sx={{ 
                    px: 2.5, 
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.7)
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.nombre || 'Usuario'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'email@example.com'}
                  </Typography>
                  <Box 
                    sx={{
                      display: 'inline-block',
                      mt: 1,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '100px',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      fontSize: '0.7rem',
                      fontWeight: 'medium',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {user?.rol || 'Usuario'}
                  </Box>
                </Box>
                
                <MenuItem 
                  onClick={handleProfileClick}
                  sx={{ 
                    py: 1.5,
                    pl: 2.5,
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Mi Perfil" />
                </MenuItem>
                
                <MenuItem 
                  onClick={() => {
                    handleUserMenuClose();
                    navigate('/configuracion');
                  }}
                  sx={{ 
                    py: 1.5,
                    pl: 2.5,
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Configuración" />
                </MenuItem>
                
                <Divider />
                
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5,
                    pl: 2.5,
                    color: theme.palette.error.main,
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.08)
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Menú lateral para pantallas móviles */}
      <Box
        component="nav"
        sx={{ 
          width: { 
            xs: 0, 
            md: isCollapsed ? drawerCollapsedWidth : drawerWidth 
          }, 
          flexShrink: { md: 0 },
          transition: 'width 0.3s ease'
        }}
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRadius: '0 16px 16px 0'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Versión escritorio */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: isCollapsed ? drawerCollapsedWidth : drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: 'width 0.3s ease',
              overflowX: 'hidden'
            },
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
          p: { xs: 2, sm: 3 },
          width: { 
            xs: '100%', 
            md: isCollapsed 
              ? `calc(100% - ${drawerCollapsedWidth}px)` 
              : `calc(100% - ${drawerWidth}px)` 
          },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          transition: 'all 0.3s ease'
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
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      <HelpCenter open={helpOpen} onClose={() => setHelpOpen(false)} />

      <UserProfileModal 
        open={profileModalOpen} 
        onClose={handleCloseProfileModal} 
        user={user} 
        onUpdateProfile={(updatedUserData) => {
          // Llamada real a tu servicio de actualización
          authService.updateProfile(user.id, updatedUserData)
            .then((response) => {
              if (response.success) {
                // Actualizar el estado local o el contexto
                setUser(response.data.usuario);
                // Mostrar mensaje de éxito
                setAlert({
                  open: true,
                  message: 'Perfil actualizado correctamente',
                  severity: 'success'
                });
              }
            })
            .catch((error) => {
              // Manejar errores
              setAlert({
                open: true,
                message: 'Error al actualizar el perfil',
                severity: 'error'
              });
            });
        }}
      />  
    </Box>
  );
};

export default MainLayout;