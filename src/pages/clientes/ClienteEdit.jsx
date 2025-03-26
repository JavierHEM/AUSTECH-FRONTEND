// src/pages/clientes/ClienteEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ClienteForm from '../../components/forms/ClienteForm';
import clienteService from '../../services/clienteService';

const ClienteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCliente = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await clienteService.getClienteById(id);
        
        if (response.success) {
          setCliente(response.data);
        } else {
          setError(response.error || 'Error al cargar el cliente');
        }
      } catch (err) {
        console.error('Error al obtener cliente:', err);
        setError('Error al cargar el cliente. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCliente();
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await clienteService.updateCliente(id, data);
      
      if (response.success) {
        // Opcionalmente esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/clientes/${id}`, { 
            state: { message: 'Cliente actualizado correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        setError(response.error || 'Error al actualizar el cliente');
        return { success: false };
      }
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
      setError('Error al actualizar el cliente. Por favor, inténtelo de nuevo.');
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/clientes/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !cliente) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
      </Box>
    );
  }

  if (!cliente) {
    return (
      <Box mt={3}>
        <Alert severity="info">Cliente no encontrado</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
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
        <MuiLink component={Link} to="/clientes" underline="hover" color="inherit">
          Clientes
        </MuiLink>
        <MuiLink 
          component={Link} 
          to={`/clientes/${id}`} 
          underline="hover" 
          color="inherit"
        >
          {cliente.razon_social}
        </MuiLink>
        <Typography color="text.primary">Editar</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Editar Cliente
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/clientes/${id}`)}
        >
          Volver al Detalle
        </Button>
      </Box>

      {/* Formulario */}
      <ClienteForm 
        cliente={cliente}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={submitting} 
        error={error} 
      />
    </Box>
  );
};

export default ClienteEdit;