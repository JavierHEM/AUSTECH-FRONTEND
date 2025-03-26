// src/components/forms/ClienteForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

// Esquema de validación para formulario de cliente
const clienteSchema = yup.object().shape({
  razon_social: yup
    .string()
    .required('La razón social es requerida')
    .min(3, 'La razón social debe tener al menos 3 caracteres')
    .max(100, 'La razón social no debe exceder los 100 caracteres'),
  rut: yup
    .string()
    .required('El RUT es requerido')
    .matches(
      /^[0-9]{1,8}-[0-9Kk]{1}$/,
      'El RUT debe tener un formato válido (ej: 12345678-9)'
    ),
  direccion: yup
    .string()
    .required('La dirección es requerida')
    .max(200, 'La dirección no debe exceder los 200 caracteres'),
  telefono: yup
    .string()
    .required('El teléfono es requerido')
    .matches(
      /^[0-9]{8,12}$/,
      'El teléfono debe contener entre 8 y 12 dígitos numéricos'
    ),
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido')
});

const ClienteForm = ({ cliente, onSubmit, onCancel, loading, error }) => {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(clienteSchema),
    defaultValues: cliente ? {
      razon_social: cliente.razon_social || '',
      rut: cliente.rut || '',
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      email: cliente.email || ''
    } : {}
  });

  const handleFormSubmit = async (data) => {
    setSuccess(false);
    const result = await onSubmit(data);
    if (result && result.success) {
      setSuccess(true);
      if (!cliente) {
        reset();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Cliente {cliente ? 'actualizado' : 'creado'} correctamente
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Razón Social"
                {...register('razon_social')}
                error={!!errors.razon_social}
                helperText={errors.razon_social?.message}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RUT"
                {...register('rut')}
                error={!!errors.rut}
                helperText={errors.rut?.message || 'Formato: 12345678-9'}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                {...register('direccion')}
                error={!!errors.direccion}
                helperText={errors.direccion?.message}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                {...register('telefono')}
                error={!!errors.telefono}
                helperText={errors.telefono?.message}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                required
              />
            </Grid>
          </Grid>
        </CardContent>
        
        <Divider />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            startIcon={<CancelIcon />}
            sx={{ mr: 1 }}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            {cliente ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Card>
    </form>
  );
};

export default ClienteForm;