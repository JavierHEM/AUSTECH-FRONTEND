// src/pages/usuarios/ChangePassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

// Esquema de validación
const passwordSchema = yup.object().shape({
  current_password: yup
    .string()
    .required('La contraseña actual es requerida'),
  password: yup
    .string()
    .required('La nueva contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  password_confirmation: yup
    .string()
    .required('La confirmación de contraseña es requerida')
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
});

const ChangePassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  // Determinar si el usuario actual puede cambiar esta contraseña
  const isAdmin = currentUser?.rol === 'Gerente' || currentUser?.rol === 'Administrador';
  const isSelfAccount = currentUser?.id === Number(id);
  const canChangePassword = isAdmin || isSelfAccount;

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await userService.getUserById(id);
        
        if (response.success) {
          setUser(response.data);
          // Verificar permisos
          if (!canChangePassword) {
            setError('No tienes permisos para cambiar la contraseña de este usuario');
          }
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
  }, [id, canChangePassword]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await userService.changePassword(id, {
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation
      });
      
      if (response.success) {
        setSuccess(true);
        reset(); // Limpiar formulario
        
        // Después de 2 segundos, redirigir al detalle del usuario
        setTimeout(() => {
          navigate(`/usuarios/${id}`, { 
            state: { message: 'Contraseña actualizada correctamente' } 
          });
        }, 2000);
      } else {
        setError(response.error || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setError('Error al cambiar la contraseña. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
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
      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={RouterLink} to="/usuarios" underline="hover" color="inherit">
          Usuarios
        </MuiLink>
        <MuiLink 
          component={RouterLink} 
          to={`/usuarios/${id}`} 
          underline="hover" 
          color="inherit"
        >
          {user.nombre}
        </MuiLink>
        <Typography color="text.primary">Cambiar Contraseña</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Cambiar Contraseña
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/usuarios/${id}`)}
        >
          Volver al Usuario
        </Button>
      </Box>

      {/* Información del usuario */}
      <Box mb={3} display="flex" alignItems="center">
        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          {user.nombre} ({user.email})
        </Typography>
      </Box>

      {/* Formulario de cambio de contraseña */}
      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Contraseña actualizada correctamente
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña Actual"
                  type={showPassword.current ? 'text' : 'password'}
                  {...register('current_password')}
                  error={!!errors.current_password}
                  helperText={errors.current_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => handleTogglePassword('current')}
                          edge="end"
                        >
                          {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  type={showPassword.new ? 'text' : 'password'}
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => handleTogglePassword('new')}
                          edge="end"
                        >
                          {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  type={showPassword.confirm ? 'text' : 'password'}
                  {...register('password_confirmation')}
                  error={!!errors.password_confirmation}
                  helperText={errors.password_confirmation?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => handleTogglePassword('confirm')}
                          edge="end"
                        >
                          {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={() => navigate(`/usuarios/${id}`)}
                sx={{ mr: 2 }}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                disabled={submitting}
              >
                Actualizar Contraseña
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;