// src/components/navigation/SidebarMenu.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccountCircle as AccountIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  Assignment as AssignmentIcon,
  ReceiptLong as ReceiptIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material/styles';

const SidebarMenu = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Estado para menús expandibles
  const [openMenus, setOpenMenus] = React.useState({
    administracion: false,
    cliente: false,
    sistema: false,
  });

  // Handle para navegar a una ruta
  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  // Handle para expandir/colapsar menús
  const handleToggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Verificar si una ruta está activa
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/dashboard';
  };

  // Estilo para el ítem activo
  const activeStyle = {
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
    color: 'primary.main',
    '& .MuiListItemIcon-root': {
      color: 'primary.main',
    },
    '&:hover': {
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
    }
  };

  // Determinar el rol del usuario
  const isGerente = user?.rol === 'Gerente';
  const isAdmin = user?.rol === 'Administrador';
  const isCliente = user?.rol === 'Cliente';
  
  return (
    <List component="nav">
      {/* Dashboard - todos los usuarios */}
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => handleNavigate('/dashboard')}
          sx={isActive('/dashboard') ? activeStyle : {}}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Opciones específicas para Gerente y Administrador */}
      {(isGerente || isAdmin) && (
        <>
          {/* Gestión de Clientes */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/clientes')}
              sx={isActive('/clientes') ? activeStyle : {}}
            >
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItemButton>
          </ListItem>
          
          {/* Gestión de Sucursales */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/sucursales')}
              sx={isActive('/sucursales') ? activeStyle : {}}
            >
              <ListItemIcon>
                <SucursalIcon />
              </ListItemIcon>
              <ListItemText primary="Sucursales" />
            </ListItemButton>
          </ListItem>
          
          {/* Gestión de Sierras */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/sierras')}
              sx={isActive('/sierras') ? activeStyle : {}}
            >
              <ListItemIcon>
                <SierraIcon />
              </ListItemIcon>
              <ListItemText primary="Sierras" />
            </ListItemButton>
          </ListItem>
          
          {/* Gestión de Afilados */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/afilados')}
              sx={isActive('/afilados') ? activeStyle : {}}
            >
              <ListItemIcon>
                <AfiladoIcon />
              </ListItemIcon>
              <ListItemText primary="Afilados" />
            </ListItemButton>
          </ListItem>
          
          {/* Reportes */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/reportes')}
              sx={isActive('/reportes') ? activeStyle : {}}
            >
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Reportes" />
            </ListItemButton>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
        </>
      )}
      
      {/* Menú de administración - solo para Gerente */}
      {isGerente && (
        <>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleMenu('administracion')}>
              <ListItemIcon>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText primary="Administración" />
              {openMenus.administracion ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={openMenus.administracion} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Gestión de Usuarios */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate('/usuarios')}
                  sx={{
                    pl: 4,
                    ...(isActive('/usuarios') ? activeStyle : {})
                  }}
                >
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Usuarios" />
                </ListItemButton>
              </ListItem>
              
              {/* Permisos */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate('/permisos')}
                  sx={{
                    pl: 4,
                    ...(isActive('/permisos') ? activeStyle : {})
                  }}
                >
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Permisos" />
                </ListItemButton>
              </ListItem>
              
              {/* Catálogos */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate('/catalogos')}
                  sx={{
                    pl: 4,
                    ...(isActive('/catalogos') ? activeStyle : {})
                  }}
                >
                  <ListItemIcon>
                    <InventoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Catálogos" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          
          <Divider sx={{ my: 1 }} />
        </>
      )}
      
      {/* Opciones específicas para Clientes */}
      {isCliente && (
        <>
          {/* Mis Sierras */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/mis-sierras')}
              sx={isActive('/mis-sierras') ? activeStyle : {}}
            >
              <ListItemIcon>
                <SierraIcon />
              </ListItemIcon>
              <ListItemText primary="Mis Sierras" />
            </ListItemButton>
          </ListItem>
          
          {/* Mis Afilados */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/mis-afilados')}
              sx={isActive('/mis-afilados') ? activeStyle : {}}
            >
              <ListItemIcon>
                <AfiladoIcon />
              </ListItemIcon>
              <ListItemText primary="Mis Afilados" />
            </ListItemButton>
          </ListItem>
          
          {/* Mis Sucursales */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/mis-sucursales')}
              sx={isActive('/mis-sucursales') ? activeStyle : {}}
            >
              <ListItemIcon>
                <SucursalIcon />
              </ListItemIcon>
              <ListItemText primary="Mis Sucursales" />
            </ListItemButton>
          </ListItem>
          
          {/* Mis Reportes */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/mis-reportes')}
              sx={isActive('/mis-reportes') ? activeStyle : {}}
            >
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Mis Reportes" />
            </ListItemButton>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
        </>
      )}
      
      {/* Configuración de Perfil - todos los usuarios */}
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => handleNavigate('/perfil')}
          sx={isActive('/perfil') ? activeStyle : {}}
        >
          <ListItemIcon>
            <AccountIcon />
          </ListItemIcon>
          <ListItemText primary="Mi Perfil" />
        </ListItemButton>
      </ListItem>
      
      {/* Configuración - todos los usuarios */}
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => handleToggleMenu('sistema')}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
          {openMenus.sistema ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      
      <Collapse in={openMenus.sistema} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* Cambiar Contraseña */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/perfil/cambiar-password')}
              sx={{
                pl: 4,
                ...(isActive('/perfil/cambiar-password') ? activeStyle : {})
              }}
            >
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary="Cambiar Contraseña" />
            </ListItemButton>
          </ListItem>
        </List>
      </Collapse>
    </List>
  );
};

export default SidebarMenu;