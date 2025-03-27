// src/pages/sucursales/SucursalEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import SucursalForm from '../../components/forms/SucursalForm';
import sucursalService from '../../services/sucursalService';

const SucursalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sucursal, setSucursal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSucursal = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await sucursalService.getSucursalById(id);
        
        if (response.success) {
          setSucursal(response.data);
        } else {
          setError(response.error || 'Error al cargar la sucursal');
        }
      } catch (err) {
        console.error('Error al obtener sucursal:', err);
        setError('Error al cargar la sucursal. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSucursal();
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await sucursalService.updateSucursal(id, data);
      
      if (response.success) {
        // Opcionalmente esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/sucursales/${id}`, { 
            state: { message: 'Sucursal actualizada correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        setError(response.error || 'Error al actualizar la sucursal');
        return { success: false };
      }
    } catch (err) {
      console.error('Error al actualizar sucursal:', err);
      setError('Error al actualizar la sucursal. Por favor, inténtelo de nuevo.');
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/sucursales/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !sucursal) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/sucursales')}
        >
          Volver a Sucursales
        </Button>
      </Box>
    );
  }

  if (!sucursal) {
    return (
      <Box mt={3}>
        <Alert severity="info">Sucursal no encontrada</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/sucursales')}
        >
          Volver a Sucursales
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/sucursales" underline="hover" color="inherit">
          Sucursales
        </MuiLink>
        <MuiLink 
          component={Link} 
          to={`/sucursales/${id}`} 
          underline="hover" 
          color="inherit"
        >
          {sucursal.nombre}
        </MuiLink>
        <Typography color="text.primary">Editar</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Editar Sucursal
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/sucursales/${id}`)}
        >
          Volver al Detalle
        </Button>
      </Box>

      {/* Formulario */}
      <SucursalForm 
        sucursal={sucursal}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={submitting} 
        error={error} 
      />
    </Box>
  );
};

export default SucursalEdit;