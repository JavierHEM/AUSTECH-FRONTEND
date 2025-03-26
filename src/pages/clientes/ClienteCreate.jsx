// src/pages/clientes/ClienteCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ClienteForm from '../../components/forms/ClienteForm';
import clienteService from '../../services/clienteService';

const ClienteCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clienteService.createCliente(data);
      
      if (response.success) {
        // Opcionalmente esperar un poco para mostrar mensaje de éxito
        setTimeout(() => {
          navigate(`/clientes/${response.data.id}`, { 
            state: { message: 'Cliente creado correctamente' } 
          });
        }, 1500);
        return { success: true };
      } else {
        setError(response.error || 'Error al crear el cliente');
        return { success: false };
      }
    } catch (err) {
      console.error('Error al crear cliente:', err);
      setError('Error al crear el cliente. Por favor, inténtelo de nuevo.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clientes');
  };

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
        <Typography color="text.primary">Nuevo Cliente</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Registrar Nuevo Cliente
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
      </Box>

      {/* Formulario */}
      <ClienteForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
        error={error} 
      />
    </Box>
  );
};

export default ClienteCreate;