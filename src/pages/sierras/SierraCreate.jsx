// src/pages/sierras/SierraCreate.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Snackbar
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import SierraForm from '../../components/forms/SierraForm';
import sierraService from '../../services/sierraService';

const SierraCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null); // Para depuración

  // Verificar si hay cliente/sucursal preseleccionados (pasados a través de location.state)
  const clientePreseleccionado = location.state?.clienteId || null;
  const clienteNombre = location.state?.clienteNombre || null;
  const sucursalPreseleccionada = location.state?.sucursalId || null;
  const sucursalNombre = location.state?.sucursalNombre || null;

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    // Verificar que los campos obligatorios estén presentes
    if (!data.codigo_barra || data.codigo_barra.trim() === '') {
      setError('El código de la sierra es requerido');
      setLoading(false);
      return { success: false };
    }
    
    if (!data.tipo_sierra_id) {
      setError('Debe seleccionar un tipo de sierra');
      setLoading(false);
      return { success: false };
    }
    
    if (!data.estado_id) {
      setError('Debe seleccionar un estado de sierra');
      setLoading(false);
      return { success: false };
    }
    
    if (!data.sucursal_id) {
      setError('Debe seleccionar una sucursal');
      setLoading(false);
      return { success: false };
    }
    
    try {
      console.log('Enviando datos de sierra:', data);
      const response = await sierraService.createSierra(data);
      
      if (response.success) {
        console.log('Sierra creada exitosamente:', response.data);
        // Opcionalmente esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/sierras/${response.data.id}`, { 
            state: { message: 'Sierra creada correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        console.error('Error desde el servicio:', response.error);
        
        // Comprobar si el error indica que el código ya existe
        if (response.error && response.error.toLowerCase().includes('ya existe')) {
          setError(`El código de sierra '${data.codigo_barra}' ya existe en el sistema. Por favor, utilice otro código.`);
        } else {
          setError(response.error || 'Error al crear la sierra');
        }
        
        return { success: false };
      }
    } catch (err) {
      console.error('Error al crear sierra:', err);
      
      // Comprobar si el error es de código duplicado (esto depende de cómo esté configurado tu backend)
      if (err.response && err.response.status === 409) {
        setError(`El código de sierra '${data.codigo_barra}' ya existe en el sistema. Por favor, utilice otro código.`);
      } else {
        setError('Error al crear la sierra. Por favor, inténtelo de nuevo.');
      }
      
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (sucursalPreseleccionada) {
      navigate(`/sucursales/${sucursalPreseleccionada}`);
    } else if (clientePreseleccionado) {
      navigate(`/clientes/${clientePreseleccionado}`);
    } else {
      navigate('/sierras');
    }
  };

  return (
    <Box>
      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={RouterLink} to="/sierras" underline="hover" color="inherit">
          Sierras
        </MuiLink>
        {clientePreseleccionado && (
          <MuiLink 
            component={RouterLink} 
            to={`/clientes/${clientePreseleccionado}`} 
            underline="hover" 
            color="inherit"
          >
            {clienteNombre || 'Cliente'}
          </MuiLink>
        )}
        {sucursalPreseleccionada && (
          <MuiLink 
            component={RouterLink} 
            to={`/sucursales/${sucursalPreseleccionada}`} 
            underline="hover" 
            color="inherit"
          >
            {sucursalNombre || 'Sucursal'}
          </MuiLink>
        )}
        <Typography color="text.primary">Nueva Sierra</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {sucursalPreseleccionada 
            ? `Nueva Sierra para ${sucursalNombre || 'Sucursal'}` 
            : clientePreseleccionado 
            ? `Nueva Sierra para ${clienteNombre || 'Cliente'}`
            : 'Registrar Nueva Sierra'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          {sucursalPreseleccionada 
            ? 'Volver a la Sucursal' 
            : clientePreseleccionado
            ? 'Volver al Cliente'
            : 'Volver a Sierras'}
        </Button>
      </Box>

      {/* Información adicional si viene desde un cliente/sucursal */}
      {(clientePreseleccionado || sucursalPreseleccionada) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Está registrando una nueva sierra para 
          {sucursalPreseleccionada 
            ? ` la sucursal ${sucursalNombre || 'seleccionada'}`
            : ` el cliente ${clienteNombre || 'seleccionado'}`
          }. 
          {sucursalPreseleccionada && ' La sucursal ya está seleccionada en el formulario.'}
        </Alert>
      )}

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Formulario */}
      <SierraForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
        error={error} 
        sucursalPreseleccionada={sucursalPreseleccionada}
        clientePreseleccionado={clientePreseleccionado}
      />
    </Box>
  );
};

export default SierraCreate;