// src/components/forms/SucursalForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import clienteService from '../../services/clienteService';

// Esquema de validación para formulario de sucursal
const sucursalSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no debe exceder los 100 caracteres'),
  cliente_id: yup
    .number()
    .required('El cliente es requerido')
    .typeError('Debe seleccionar un cliente'),
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
    )
});

const SucursalForm = ({ sucursal, onSubmit, onCancel, loading, error, clientePreseleccionado }) => {
  const [success, setSuccess] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(sucursalSchema),
    defaultValues: sucursal ? {
      nombre: sucursal.nombre || '',
      cliente_id: sucursal.cliente_id || '',
      direccion: sucursal.direccion || '',
      telefono: sucursal.telefono || ''
    } : {
      nombre: '',
      cliente_id: clientePreseleccionado || '',
      direccion: '',
      telefono: ''
    }
  });

  // Cargar lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      setLoadingClientes(true);
      try {
        const response = await clienteService.getAllClientes();
        if (response.success) {
          setClientes(response.data);
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoadingClientes(false);
      }
    };

    fetchClientes();
  }, []);

  // Actualizar formulario si cambia el cliente preseleccionado
  useEffect(() => {
    if (clientePreseleccionado && !sucursal) {
      setValue('cliente_id', clientePreseleccionado);
    }
  }, [clientePreseleccionado, setValue, sucursal]);

  const handleFormSubmit = async (data) => {
    setSuccess(false);
    const result = await onSubmit(data);
    if (result && result.success) {
      setSuccess(true);
      if (!sucursal) {
        reset();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            {sucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Sucursal {sucursal ? 'actualizada' : 'creada'} correctamente
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nombre de la Sucursal"
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="cliente_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.cliente_id}>
                    <InputLabel id="cliente-label" required>Cliente</InputLabel>
                    <Select
                      {...field}
                      labelId="cliente-label"
                      label="Cliente"
                      disabled={loadingClientes || !!clientePreseleccionado}
                      value={field.value || ''}
                    >
                      {loadingClientes ? (
                        <MenuItem value="" disabled>
                          Cargando clientes...
                        </MenuItem>
                      ) : clientes.length === 0 ? (
                        <MenuItem value="" disabled>
                          No hay clientes disponibles
                        </MenuItem>
                      ) : (
                        clientes.map((cliente) => (
                          <MenuItem key={cliente.id} value={cliente.id}>
                            {cliente.razon_social}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.cliente_id && (
                      <FormHelperText>{errors.cliente_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="direccion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Dirección"
                    error={!!errors.direccion}
                    helperText={errors.direccion?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Teléfono"
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                    required
                  />
                )}
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
            {sucursal ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Card>
    </form>
  );
};

export default SucursalForm;