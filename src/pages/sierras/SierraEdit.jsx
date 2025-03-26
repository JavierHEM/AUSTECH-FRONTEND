// src/pages/sierras/SierraEdit.jsx
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
import SierraForm from '../../components/forms/SierraForm';
import sierraService from '../../services/sierraService';

const SierraEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sierra, setSierra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSierra = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Usar el nuevo endpoint para obtener la sierra por ID
        const response = await sierraService.getSierraById(id);
        
        if (response.success) {
          setSierra(response.data);
        } else {
          setError(response.error || 'Error al cargar la sierra');
        }
      } catch (err) {
        console.error('Error al obtener sierra:', err);
        setError('Error al cargar la sierra. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSierra();
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await sierraService.updateSierra(id, data);
      
      if (response.success) {
        // Opcionalmente esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/sierras/${id}`, { 
            state: { message: 'Sierra actualizada correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        setError(response.error || 'Error al actualizar la sierra');
        return { success: false };
      }
    } catch (err) {
      console.error('Error al actualizar sierra:', err);
      setError('Error al actualizar la sierra. Por favor, inténtelo de nuevo.');
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/sierras/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !sierra) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/sierras')}
        >
          Volver a Sierras
        </Button>
      </Box>
    );
  }

  if (!sierra) {
    return (
      <Box mt={3}>
        <Alert severity="info">Sierra no encontrada</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/sierras')}
        >
          Volver a Sierras
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
        <MuiLink component={RouterLink} to="/sierras" underline="hover" color="inherit">
          Sierras
        </MuiLink>
        <MuiLink 
          component={RouterLink} 
          to={`/sierras/${id}`} 
          underline="hover" 
          color="inherit"
        >
          {sierra.codigo_barra || sierra.codigo}
        </MuiLink>
        <Typography color="text.primary">Editar</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Editar Sierra
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/sierras/${id}`)}
        >
          Volver al Detalle
        </Button>
      </Box>

      {/* Aviso */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Puede modificar los datos de la sierra. Tenga en cuenta que cambiar la sucursal puede 
        afectar a los registros de afilados asociados.
      </Alert>

      {/* Formulario */}
      <SierraForm 
        sierra={sierra}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={submitting} 
        error={error} 
      />
    </Box>
  );
};

export default SierraEdit;