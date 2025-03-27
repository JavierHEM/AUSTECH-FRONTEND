// src/pages/usuarios/UserDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  AccountCircle as UserIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const theme = useTheme();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(!!location.state?.message);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Mapeo de IDs de rol a nombres
  const rolMapping = {
    1: 'Gerente',
    2: 'Administrador',
    3: 'Cliente'
  };

  // Determinar si el usuario actual puede gestionar este usuario
  const isAdmin = currentUser?.rol === 'Gerente' || currentUser?.rol === 'Administrador';
  const canManageUser = isAdmin && user && user.rol !== 'Administrador';
  const isSelfAccount = currentUser?.id === Number(id);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await userService.getUserById(id);
        
        if (response.success) {
          // Agregar el nombre del rol basado en rol_id
          const userData = {
            ...response.data,
            rol: response.data.rol_id ? rolMapping[response.data.rol_id] : response.data.rol || 'Desconocido'
          };
          setUser(userData);
        } else {
          setError(response.error || 'Error al cargar el usuario');
        }
      } catch (err) {
        console.error('Error al obtener usuario:', err);
        setError('Error al cargar la información del usuario. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
    
    // Limpiar el mensaje de éxito después de unos segundos
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [id, showSuccessMessage]);

  const handleDelete = async () => {
    setConfirmDelete(false);
    setLoading(true);
    
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        navigate('/usuarios', { 
          state: { 
            message: 'Usuario eliminado correctamente',
            severity: 'success'
          } 
        });
      } else {
        setError(response.error || 'Error al eliminar el usuario');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setError('Error al eliminar el usuario. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  // Función para obtener el icono de rol
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrador':
        return <AdminIcon fontSize="large" color="error" />;
      case 'Gerente':
        return <SupervisorIcon fontSize="large" color="warning" />;
      case 'Cliente':
        return <UserIcon fontSize="large" color="info" />;
      default:
        return <PersonIcon fontSize="large" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/usuarios')}
        >
          Volver a Usuarios
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box mt={3}>
        <Alert severity="info">Usuario no encontrado</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/usuarios')}
        >
          Volver a Usuarios
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={RouterLink} to="/usuarios" underline="hover" color="inherit">
          Usuarios
        </MuiLink>
        <Typography color="text.primary">{user.nombre}</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Detalle de Usuario
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/usuarios')}
            sx={{ mr: 1 }}
          >
            Volver a Usuarios
          </Button>
          
          {(canManageUser || isSelfAccount) && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/usuarios/${id}/editar`)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
          )}
          
          {canManageUser && (
            <Tooltip title="Eliminar usuario">
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setConfirmDelete(true)}
                  disabled={user.rol === 'Administrador'}
                >
                  Eliminar
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Información principal del usuario */}
      <Grid container spacing={3}>
        {/* Card de perfil */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: user.activo ? 'primary.main' : 'text.disabled',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.nombre} {user.apellido}
              </Typography>
              
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                sx={{ mb: 2 }}
              >
                <Chip 
                  icon={getRoleIcon(user.rol)} 
                  label={user.rol}
                  color={
                    user.rol === 'Administrador' ? 'error' : 
                    user.rol === 'Gerente' ? 'warning' : 'info'
                  }
                  sx={{ mx: 1 }}
                />
                
                <Chip 
                  icon={user.activo ? <CheckIcon /> : <BlockIcon />}
                  label={user.activo ? 'Activo' : 'Inactivo'}
                  color={user.activo ? 'success' : 'default'}
                  variant={user.activo ? 'filled' : 'outlined'}
                  sx={{ mx: 1 }}
                />
              </Box>
              
              <Box 
                display="flex" 
                alignItems="center" 
                sx={{ mb: 2, justifyContent: 'center' }}
              >
                <EmailIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {user.email}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Acciones de perfil */}
              <Grid container spacing={1}>
                {(canManageUser || isSelfAccount) && (
                  <Grid item xs={12}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<KeyIcon />}
                      onClick={() => navigate(`/usuarios/${id}/cambiar-password`)}
                    >
                      Cambiar Contraseña
                    </Button>
                  </Grid>
                )}
                
                {canManageUser && (
                  <>
                    <Grid item xs={12}>
                      <Tooltip title={user.activo ? "Desactivar usuario" : "Activar usuario"}>
                        <span>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            color={user.activo ? 'error' : 'success'} 
                            startIcon={user.activo ? <BlockIcon /> : <CheckIcon />}
                            onClick={() => alert('Cambiar estado no implementado')}
                          >
                            {user.activo ? 'Desactivar Usuario' : 'Activar Usuario'}
                          </Button>
                        </span>
                      </Tooltip>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Card de información */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de Usuario
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, height: '100%' }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Datos Personales
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Nombre" 
                          secondary={`${user.nombre} ${user.apellido}`} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={user.email} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Rol" 
                          secondary={user.rol} 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                
                {/* Información adicional para Clientes */}
                {user.rol === 'Cliente' && (
                  <Grid item xs={12} md={6}>
                    <Paper 
                      variant="outlined" 
                      sx={{ p: 2, height: '100%' }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Asociación Cliente
                      </Typography>
                      
                      {user.cliente ? (
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <BusinessIcon color="secondary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Cliente Asociado" 
                              secondary={user.cliente.razon_social} 
                            />
                          </ListItem>
                          
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Typography variant="subtitle2" color="text.secondary">
                                  Sucursales Asignadas
                                </Typography>
                              } 
                            />
                          </ListItem>
                          
                          {user.sucursales && user.sucursales.length > 0 ? (
                            user.sucursales.map(sucursal => (
                              <ListItem key={sucursal.id} sx={{ pl: 4 }}>
                                <ListItemIcon>
                                  <SucursalIcon color="info" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={sucursal.nombre} />
                              </ListItem>
                            ))
                          ) : (
                            <ListItem sx={{ pl: 4 }}>
                              <ListItemText 
                                secondary="No hay sucursales asignadas" 
                              />
                            </ListItem>
                          )}
                        </List>
                      ) : (
                        <Typography color="text.secondary">
                          No hay cliente asociado
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}
                
                {/* Estadísticas o actividad reciente para todos los usuarios */}
                <Grid item xs={12}>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2 }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Estadísticas de Usuario
                    </Typography>
                    
                    <Typography color="text.secondary" variant="body2">
                      Sección para mostrar estadísticas o actividad reciente del usuario.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ¿Eliminar usuario?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar el usuario "{user.nombre} {user.apellido}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetail;