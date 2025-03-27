// src/pages/afilados/AfiladoCreate.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AfiladoForm from '../../components/forms/AfiladoForm';
import afiladoService from '../../services/afiladoService';

const AfiladoCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si hay una sierra preseleccionada (pasado a través de location.state)
  const sierraPreseleccionada = location.state?.sierraId 
    ? { 
        id: location.state.sierraId, 
        codigo: location.state.sierraCodigo || 'No especificado' 
      } 
    : null;

    const handleSubmit = async (data) => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Enviando datos de afilado:', data);
        const response = await afiladoService.createAfilado(data);
        
        if (response.success) {
          console.log('Afilado creado exitosamente:', response.data);
          
          // Esperamos un momento antes de redirigir para asegurar que el afilado
          // esté disponible en la base de datos
          setTimeout(() => {
            // Asegurarnos de que tenemos un ID válido antes de redirigir
            if (response.data && response.data.id) {
              // Redirigir con state para mostrar mensaje de éxito
              navigate(`/afilados/${response.data.id}`, { 
                state: { 
                  message: 'Afilado registrado correctamente',
                  severity: 'success'
                } 
              });
            } else {
              // Si no hay ID, redirigir a la lista de afilados
              navigate('/afilados', { 
                state: { 
                  message: 'Afilado registrado correctamente, pero no se pudo obtener su ID',
                  severity: 'warning'
                } 
              });
            }
          }, 1000); // Esperar 1 segundo antes de redirigir
          
          return { success: true };
        } else {
          setError(response.error || 'Error al registrar el afilado');
          return { success: false };
        }
      } catch (err) {
        console.error('Error al crear afilado:', err);
        setError('Error al registrar el afilado. Por favor, inténtelo de nuevo.');
        return { success: false };
      } finally {
        setLoading(false);
      }
    };

  const handleCancel = () => {
    if (sierraPreseleccionada) {
      navigate(`/sierras/${sierraPreseleccionada.id}`);
    } else {
      navigate('/afilados');
    }
  };

  return (
    <Box>
      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/afilados" underline="hover" color="inherit">
          Afilados
        </MuiLink>
        {sierraPreseleccionada && (
          <MuiLink 
            component={Link} 
            to={`/sierras/${sierraPreseleccionada.id}`} 
            underline="hover" 
            color="inherit"
          >
            Sierra: {sierraPreseleccionada.codigo}
          </MuiLink>
        )}
        <Typography color="text.primary">Nuevo Afilado</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {sierraPreseleccionada 
            ? `Nuevo Afilado para Sierra ${sierraPreseleccionada.codigo}` 
            : 'Registrar Nuevo Afilado'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          {sierraPreseleccionada 
            ? 'Volver a la Sierra' 
            : 'Volver a Afilados'}
        </Button>
      </Box>

      {/* Información adicional si viene desde una sierra */}
      {sierraPreseleccionada && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Está registrando un nuevo afilado para la sierra <strong>{sierraPreseleccionada.codigo}</strong>. 
          La sierra ya está seleccionada en el formulario.
        </Alert>
      )}

      {/* Formulario */}
      <AfiladoForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
        error={error} 
        sierraPreseleccionada={sierraPreseleccionada}
      />
    </Box>
  );
};

export default AfiladoCreate;