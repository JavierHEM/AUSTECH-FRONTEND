// src/components/user/UserProfileModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Avatar,
  Divider,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

const UserProfileModal = ({ open, onClose, user, onUpdateProfile }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados para los campos editables
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Estado para mensajes de alerta
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estado para modo de edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambio de contraseña
  const handlePasswordChange = () => {
    // Validación simple
    if (formData.newPassword !== formData.confirmPassword) {
      setAlert({
        open: true,
        message: 'Las contraseñas no coinciden',
        severity: 'error'
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setAlert({
        open: true,
        message: 'La contraseña debe tener al menos 6 caracteres',
        severity: 'error'
      });
      return;
    }
    
    // Aquí iría la lógica para cambiar la contraseña
    setAlert({
      open: true,
      message: 'Contraseña actualizada correctamente',
      severity: 'success'
    });
    
    // Limpiar campos
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };
  
  // Cerrar alerta
  const handleCloseAlert = () => {
    setAlert(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          elevation: 3,
          sx: { 
            borderRadius: { xs: 0, sm: 2 },
            minHeight: { xs: '100%', sm: 'auto' },
            width: '100%',
            maxWidth: { sm: 800 }
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon />
            <Typography variant="h6">Mi Perfil</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent 
          sx={{ 
            py: 4, 
            px: { xs: 2, sm: 4 },
            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'
          }}
        >
          <Grid container spacing={4}>
            {/* Columna izquierda - Perfil y contacto */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                py: 4,
                px: 2,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '3rem',
                      border: '4px solid white',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user?.nombre?.charAt(0) || 'U'}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 5,
                      right: -5,
                      backgroundColor: theme.palette.primary.light,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {user?.nombre || 'Usuario'}
                </Typography>
                
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    mb: 3,
                    borderRadius: '100px',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontSize: '0.85rem',
                    fontWeight: 'medium'
                  }}
                >
                  {user?.rol || 'Usuario'}
                </Box>
                
                <Divider sx={{ width: '100%', my: 2 }} />
                
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Información de contacto
                  </Typography>
                  
                  <Grid container spacing={2}> {/* Aumentar el spacing del contenedor */}
                    <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                        Email:
                        </Typography>
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {user?.email || 'email@example.com'}
                        </Typography>
                    </Grid>
                    
                    {/* Añadimos más margen vertical entre filas */}
                    <Grid item xs={12} sx={{ my: 1 }}>
                        <Divider sx={{ opacity: 0.6 }} />
                    </Grid>
                    
                    <Grid item xs={3} sx={{ 
                        py: 1 // Padding vertical dentro del grid item
                    }}>
                        <Typography variant="body2" color="text.secondary">
                        Teléfono:
                        </Typography>
                    </Grid>
                    <Grid item xs={9} sx={{ 
                        py: 1 // Padding vertical dentro del grid item 
                    }}>
                        <Typography variant="body2">
                        {user?.telefono || 'No disponible'}
                        </Typography>
                    </Grid>
                    </Grid>
                </Box>
              </Box>
            </Grid>
            
            {/* Columna derecha - Información y contraseña */}
            <Grid item xs={12} md={8}>
              {/* Sección de información personal */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Información Personal
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(!isEditing)}
                    color="primary"
                  >
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nombre"
                      fullWidth
                      variant="outlined"
                      value={user?.nombre || ''}
                      size="small"
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      fullWidth
                      variant="outlined"
                      value={user?.email || ''}
                      size="small"
                      InputProps={{
                        readOnly: !isEditing
                      }}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Rol"
                      fullWidth
                      variant="outlined"
                      value={user?.rol || ''}
                      size="small"
                      InputProps={{
                        readOnly: true
                      }}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Última conexión"
                      fullWidth
                      variant="outlined"
                      value={new Date().toLocaleString()}
                      size="small"
                      InputProps={{
                        readOnly: true
                      }}
                      disabled
                    />
                  </Grid>
                </Grid>
                
                {isEditing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setIsEditing(false);
                        setAlert({
                          open: true,
                          message: 'Perfil actualizado correctamente',
                          severity: 'success'
                        });
                        if (onUpdateProfile) {
                          onUpdateProfile();
                        }
                      }}
                    >
                      Guardar Cambios
                    </Button>
                  </Box>
                )}
              </Box>
              
              {/* Sección de cambio de contraseña */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Cambiar Contraseña
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="currentPassword"
                      label="Contraseña actual"
                      fullWidth
                      variant="outlined"
                      type="password"
                      size="small"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="newPassword"
                      label="Nueva contraseña"
                      fullWidth
                      variant="outlined"
                      type="password"
                      size="small"
                      value={formData.newPassword}
                      onChange={handleChange}
                      helperText="Mínimo 6 caracteres"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="confirmPassword"
                      label="Confirmar contraseña"
                      fullWidth
                      variant="outlined"
                      type="password"
                      size="small"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handlePasswordChange}
                      disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    >
                      Actualizar Contraseña
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Sección de preferencias */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Preferencias
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Las preferencias del sistema se pueden configurar en la sección de Configuración.
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={onClose}
                >
                  Ir a Configuración
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseAlert}
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
    </>
  );
};

export default UserProfileModal;