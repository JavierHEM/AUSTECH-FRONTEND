// src/pages/sucursales/SucursalCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import SucursalForm from '../../components/forms/SucursalForm';
import sucursalService from '../../services/sucursalService';

const SucursalCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si hay un cliente preseleccionado (pasado a través de location.state)
  const clientePreseleccionado = location.state?.clienteId || null;
  const clienteNombre = location.state?.clienteNombre || null;

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sucursalService.createSucursal(data);
      
      if (response.success) {
        // Opcionalmente esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/sucursales/${response.data.id}`, { 
            state: { message: 'Sucursal creada correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        setError(response.error || 'Error al crear la sucursal');
        return { success: false };
      }
    } catch (err) {
      console.error('Error al crear sucursal:', err);
      setError('Error al crear la sucursal. Por favor, inténtelo de nuevo.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (clientePreseleccionado) {
      navigate(`/clientes/${clientePreseleccionado}`);
    } else {
      navigate('/sucursales');
    }
  };

  return (
    <Box>
      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        {clientePreseleccionado ? (
          <>
            <MuiLink component={RouterLink} to="/clientes" underline="hover" color="inherit">
              Clientes
            </MuiLink>
            <MuiLink 
              component={RouterLink} 
              to={`/clientes/${clientePreseleccionado}`} 
              underline="hover" 
              color="inherit"
            >
              {clienteNombre || 'Cliente'}
            </MuiLink>
          </>
        ) : (
          <MuiLink component={RouterLink} to="/sucursales" underline="hover" color="inherit">
            Sucursales
          </MuiLink>
        )}
        <Typography color="text.primary">Nueva Sucursal</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {clientePreseleccionado 
            ? `Nueva Sucursal para ${clienteNombre || 'Cliente'}` 
            : 'Registrar Nueva Sucursal'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          {clientePreseleccionado 
            ? 'Volver al Cliente' 
            : 'Volver a Sucursales'}
        </Button>
      </Box>

      {/* Información adicional si viene desde un cliente */}
      {clientePreseleccionado && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Está registrando una nueva sucursal para el cliente <strong>{clienteNombre}</strong>. 
          El cliente ya está seleccionado en el formulario.
        </Alert>
      )}

      {/* Formulario */}
      <SucursalForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
        error={error} 
        clientePreseleccionado={clientePreseleccionado}
      />
    </Box>
  );
};

export default SucursalCreate;