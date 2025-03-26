// src/pages/usuarios/UserEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import UserForm from '../../components/forms/UserForm';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Determinar si el usuario actual puede gestionar este usuario
  const isAdmin = currentUser?.rol === 'Gerente' || currentUser?.rol === 'Administrador';
  const isSelfAccount = currentUser?.id === Number(id);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await userService.getUserById(id);
        
        if (response.success) {
          setUser(response.data);
          // Verificar permisos
          const canEdit = isAdmin || isSelfAccount;
          if (!canEdit) {
            setError('No tienes permisos para editar este usuario');
          }
        } else {
          setError(response.error || 'Error al cargar el usuario');
        }
      } catch (err) {
        console.error('Error al obtener usuario:', err);
        setError('Error al cargar el usuario. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [id, isAdmin, isSelfAccount]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Si la contraseña está vacía, eliminarla del objeto
      if (!data.password) {
        delete data.password;
        delete data.password_confirmation;
      }
      
      const response = await userService.updateUser(id, data);
      
      if (response.success) {
        // Esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/usuarios/${id}`, { 
            state: { message: 'Usuario actualizado correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        setError(response.error || 'Error al actualizar el usuario');
        return { success: false };
      }
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      setError('Error al actualizar el usuario. Por favor, inténtelo de nuevo.');
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/usuarios/${id}`);
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
        <Typography color="text.primary">Editar</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Editar Usuario
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/usuarios/${id}`)}
        >
          Volver al Detalle
        </Button>
      </Box>

      {/* Aviso */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Modifique los datos del usuario. Si no desea cambiar la contraseña, deje esos campos en blanco.
        {isSelfAccount && currentUser?.rol !== 'Administrador' && (
          <Typography variant="body2" component="span" sx={{ display: 'block', mt: 1, fontWeight: 'medium' }}>
            Nota: No puedes cambiar tu propio rol o estado.
          </Typography>
        )}
      </Alert>

      {/* Formulario */}
      <UserForm 
        user={user}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={submitting} 
        error={error} 
        isSelfAccount={isSelfAccount}
      />
    </Box>
  );
};

export default UserEdit;