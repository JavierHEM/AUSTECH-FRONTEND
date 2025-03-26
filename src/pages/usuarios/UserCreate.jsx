// src/pages/usuarios/UserCreate.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import UserForm from '../../components/forms/UserForm';
import userService from '../../services/userService';

const UserCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.createUser(data);
      
      if (response.success) {
        // Esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/usuarios/${response.data.id}`, { 
            state: { message: 'Usuario creado correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        setError(response.error || 'Error al crear el usuario');
        return { success: false };
      }
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setError('Error al crear el usuario. Por favor, inténtelo de nuevo.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

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
        <Typography color="text.primary">Nuevo Usuario</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Crear Nuevo Usuario
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/usuarios')}
        >
          Volver a Usuarios
        </Button>
      </Box>

      {/* Información adicional */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Complete el formulario para crear un nuevo usuario en el sistema. Los usuarios del tipo "Cliente" requieren 
        asignar un cliente y sus sucursales correspondientes. Las contraseñas deben tener al menos 6 caracteres.
      </Alert>

      {/* Formulario */}
      <UserForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
        error={error} 
      />
    </Box>
  );
};

export default UserCreate;