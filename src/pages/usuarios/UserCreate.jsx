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
      // Primero creamos el usuario base
      const response = await userService.createUser(data);
      
      if (response.success) {
        // Si el usuario es tipo Cliente (rol_id = 3) y tiene sucursales seleccionadas
        if (data.rol_id == 3 && data.sucursales && data.sucursales.length > 0) {
          // Extraer los IDs de las sucursales si es un array de objetos
          const sucursalIds = Array.isArray(data.sucursales) 
            ? data.sucursales.map(s => typeof s === 'object' ? s.id : s) 
            : data.sucursales;
          
          console.log("Asignando sucursales al usuario:", response.data.id, sucursalIds);
          
          // Asignar sucursales al usuario recién creado
          const sucursalResponse = await userService.assignSucursalesToUser(
            response.data.id, 
            sucursalIds
          );
          
          if (!sucursalResponse.success) {
            console.error("Error al asignar sucursales:", sucursalResponse.error);
            setError("Usuario creado pero hubo un error al asignar sucursales. Por favor, asigne las sucursales manualmente.");
            return { success: false };
          }
        }
        
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