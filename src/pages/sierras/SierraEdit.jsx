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
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import SierraForm from '../../components/forms/SierraForm';
import sierraService from '../../services/sierraService';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';

const SierraEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sierra, setSierra] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSierra = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Usar el endpoint para obtener la sierra por ID
        const response = await sierraService.getSierraById(id);
        
        if (response.success) {
          setSierra(response.data);
          
          // Cargar información de la sucursal
          if (response.data.sucursal_id) {
            try {
              const sucursalResponse = await sucursalService.getSucursalById(response.data.sucursal_id);
              if (sucursalResponse.success) {
                setSucursal(sucursalResponse.data);
                
                // Cargar información del cliente
                if (sucursalResponse.data.cliente_id) {
                  const clienteResponse = await clienteService.getClienteById(sucursalResponse.data.cliente_id);
                  if (clienteResponse.success) {
                    setCliente(clienteResponse.data);
                  }
                }
              }
            } catch (err) {
              console.error('Error al obtener sucursal o cliente:', err);
              // No interrumpimos el flujo principal si hay error al cargar sucursal/cliente
            }
          }
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
      // Mantenemos la misma sucursal y cliente
      const updatedData = {
        ...data,
        sucursal_id: sierra.sucursal_id // Aseguramos que no se cambie la sucursal
      };
      
      const response = await sierraService.updateSierra(id, updatedData);
      
      if (response.success) {
        // Esperar un poco para mostrar mensaje de éxito
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

  // Obtener el nombre del cliente
  const getClienteNombre = () => {
    if (cliente?.razon_social) {
      return cliente.razon_social;
    }
    
    if (sierra.sucursales?.clientes?.razon_social) {
      return sierra.sucursales.clientes.razon_social;
    }
    
    return 'Cliente no especificado';
  };

  // Obtener el nombre de la sucursal
  const getSucursalNombre = () => {
    if (sucursal?.nombre) {
      return sucursal.nombre;
    }
    
    if (sierra.sucursales?.nombre) {
      return sierra.sucursales.nombre;
    }
    
    return 'Sucursal no especificada';
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

      {/* Información del cliente y sucursal (no modificable) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Información del Cliente y Sucursal
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            La información del cliente y sucursal no puede ser modificada una vez registrada la sierra.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Cliente
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {getClienteNombre()}
                </Typography>
                {cliente && (
                  <Box mt={1}>
                    <Chip 
                      label={`ID: ${cliente.id}`}
                      size="small" 
                      variant="outlined" 
                      sx={{ mr: 1 }}
                    />
                    {cliente.activo && (
                      <Chip 
                        label="Activo"
                        size="small" 
                        color="success"
                      />
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <SucursalIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Sucursal
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {getSucursalNombre()}
                </Typography>
                {sucursal && (
                  <Box mt={1}>
                    <Chip 
                      label={`ID: ${sucursal.id}`}
                      size="small" 
                      variant="outlined" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={sucursal.direccion}
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={sucursal.telefono}
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Formulario */}
      <SierraForm 
        sierra={sierra}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={submitting} 
        error={error}
        disableClienteSucursal={true} // Parámetro para deshabilitar campos cliente/sucursal
        clienteInfo={cliente}
        sucursalInfo={sucursal}
      />
    </Box>
  );
};

export default SierraEdit;