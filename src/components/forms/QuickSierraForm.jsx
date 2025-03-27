// src/components/forms/QuickSierraForm.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon
} from '@mui/icons-material';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';
import catalogoService from '../../services/catalogoService';
import sierraService from '../../services/sierraService';

// Esquema de validación simplificado para registro rápido de sierra
const quickSierraSchema = yup.object().shape({
  codigo_barra: yup
    .string()
    .required('El código de barras es requerido')
    .max(50, 'El código de barras no debe exceder los 50 caracteres'),
  tipo_sierra_id: yup
    .number()
    .required('El tipo de sierra es requerido')
    .typeError('Debe seleccionar un tipo de sierra'),
  cliente_id: yup
    .number()
    .required('El cliente es requerido')
    .typeError('Debe seleccionar un cliente'),
  sucursal_id: yup
    .number()
    .required('La sucursal es requerida')
    .typeError('Debe seleccionar una sucursal')
});

const QuickSierraForm = ({ codigoEscaneado, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [tiposSierra, setTiposSierra] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(quickSierraSchema),
    defaultValues: {
      codigo_barra: codigoEscaneado || '',
      tipo_sierra_id: '',
      cliente_id: '',
      sucursal_id: ''
    }
  });

  const watchClienteId = watch('cliente_id');

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        // Cargar clientes
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
        }
        
        // Cargar tipos de sierra
        const tiposSierraResponse = await catalogoService.getTiposSierra();
        if (tiposSierraResponse.success) {
          setTiposSierra(tiposSierraResponse.data);
        }
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
        setError('Error al cargar los datos necesarios. Por favor, inténtelo de nuevo.');
      } finally {
        setLoadingCatalogos(false);
      }
    };

    fetchCatalogos();
  }, []);

  // Cargar sucursales cuando cambia el cliente seleccionado
  useEffect(() => {
    const fetchSucursales = async () => {
      if (watchClienteId) {
        try {
          const response = await sucursalService.getSucursalesByCliente(watchClienteId);
          if (response.success) {
            setSucursales(response.data);
          }
        } catch (err) {
          console.error('Error al cargar sucursales:', err);
        }
      } else {
        setSucursales([]);
      }
    };

    fetchSucursales();
  }, [watchClienteId]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Crear objeto de sierra con datos mínimos
      const sierraData = {
        codigo_barra: data.codigo_barra,
        tipo_sierra_id: data.tipo_sierra_id,
        sucursal_id: data.sucursal_id,
        activo: true, // Por defecto, una nueva sierra está activa
        estado_sierra_id: 1, // Asumir un ID de estado "En uso" o el que corresponda como predeterminado
        observaciones: 'Sierra registrada mediante proceso rápido'
      };
      
      const response = await sierraService.createSierra(sierraData);
      
      if (response.success) {
        setSuccess(true);
        reset(); // Limpiar formulario
        
        // Llamar al callback con la sierra creada
        if (onSubmit) {
          onSubmit(response.data);
        }
      } else {
        setError(response.error || 'Error al registrar la sierra');
      }
    } catch (err) {
      console.error('Error al crear sierra:', err);
      setError('Error al procesar la solicitud. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Registro Rápido de Sierra
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Sierra registrada correctamente
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="codigo_barra"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código de Barras"
                    fullWidth
                    required
                    error={!!errors.codigo_barra}
                    helperText={errors.codigo_barra?.message}
                    disabled={loadingCatalogos}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="cliente_id"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.cliente_id}
                    disabled={loadingCatalogos}
                  >
                    <InputLabel id="cliente-label" required>Cliente</InputLabel>
                    <Select
                      {...field}
                      labelId="cliente-label"
                      label="Cliente"
                    >
                      <MenuItem value="">
                        <em>Seleccione un cliente</em>
                      </MenuItem>
                      {clientes.map((cliente) => (
                        <MenuItem key={cliente.id} value={cliente.id}>
                          {cliente.razon_social}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.cliente_id && (
                      <FormHelperText>{errors.cliente_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="sucursal_id"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.sucursal_id}
                    disabled={!watchClienteId || loadingCatalogos}
                  >
                    <InputLabel id="sucursal-label" required>Sucursal</InputLabel>
                    <Select
                      {...field}
                      labelId="sucursal-label"
                      label="Sucursal"
                    >
                      <MenuItem value="">
                        <em>Seleccione una sucursal</em>
                      </MenuItem>
                      {sucursales.map((sucursal) => (
                        <MenuItem key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sucursal_id && (
                      <FormHelperText>{errors.sucursal_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="tipo_sierra_id"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.tipo_sierra_id}
                    disabled={loadingCatalogos}
                  >
                    <InputLabel id="tipo-sierra-label" required>Tipo de Sierra</InputLabel>
                    <Select
                      {...field}
                      labelId="tipo-sierra-label"
                      label="Tipo de Sierra"
                    >
                      <MenuItem value="">
                        <em>Seleccione un tipo de sierra</em>
                      </MenuItem>
                      {tiposSierra.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.tipo_sierra_id && (
                      <FormHelperText>{errors.tipo_sierra_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onCancel}
              startIcon={<CancelIcon />}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
              disabled={loading || loadingCatalogos}
            >
              Registrar Sierra
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickSierraForm;