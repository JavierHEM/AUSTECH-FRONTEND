// src/components/forms/SierraForm.jsx
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
  FormHelperText,
  FormControlLabel,
  Switch,
  Autocomplete
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon 
} from '@mui/icons-material';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';
import catalogoService from '../../services/catalogoService';

// Esquema de validación para formulario de sierra
const sierraSchema = yup.object().shape({
  codigo_barra: yup
    .string()
    .required('El código de barra es requerido')
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no debe exceder los 50 caracteres'),
  tipo_sierra_id: yup
    .number()
    .required('El tipo de sierra es requerido')
    .typeError('Debe seleccionar un tipo de sierra'),
  estado_id: yup
    .number()
    .required('El estado de sierra es requerido')
    .typeError('Debe seleccionar un estado'),
  sucursal_id: yup
    .number()
    .required('La sucursal es requerida')
    .typeError('Debe seleccionar una sucursal'),
  ancho: yup
    .number()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
    .typeError('El ancho debe ser un número'),
  largo: yup
    .number()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
    .typeError('El largo debe ser un número'),
  alto: yup
    .number()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
    .typeError('El alto debe ser un número'),
  material: yup
    .string()
    .nullable(),
  observaciones: yup
    .string()
    .nullable()
    .max(500, 'Las observaciones no deben exceder los 500 caracteres'),
  activo: yup
    .boolean()
});

const SierraForm = ({ sierra, onSubmit, onCancel, loading, error, sucursalPreseleccionada, clientePreseleccionado }) => {
  const [success, setSuccess] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [tiposSierra, setTiposSierra] = useState([]);
  const [estadosSierra, setEstadosSierra] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(sierraSchema),
    defaultValues: sierra ? {
      codigo_barra: sierra.codigo_barra || '',
      tipo_sierra_id: sierra.tipo_sierra_id || '',
      estado_id: sierra.estado_id || '',
      sucursal_id: sierra.sucursal_id || '',
      ancho: sierra.ancho || '',
      largo: sierra.largo || '',
      alto: sierra.alto || '',
      material: sierra.material || '',
      observaciones: sierra.observaciones || '',
      activo: sierra.activo !== undefined ? sierra.activo : true
    } : {
      codigo_barra: '',
      tipo_sierra_id: '',
      estado_id: '',
      sucursal_id: sucursalPreseleccionada || '',
      ancho: '',
      largo: '',
      alto: '',
      material: '',
      observaciones: '',
      activo: true
    }
  });

  const watchSucursalId = watch('sucursal_id');

  // Cargar catálogos
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
        
        // Cargar estados de sierra
        const estadosSierraResponse = await catalogoService.getEstadosSierra();
        if (estadosSierraResponse.success) {
          setEstadosSierra(estadosSierraResponse.data);
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    fetchCatalogos();
  }, []);

  // Si hay un cliente preseleccionado, establecerlo
  useEffect(() => {
    if (clientePreseleccionado) {
      setSelectedCliente(clientePreseleccionado);
      
      // Cargar las sucursales para este cliente
      const fetchSucursales = async () => {
        try {
          const response = await sucursalService.getSucursalesByCliente(clientePreseleccionado);
          if (response.success) {
            setSucursales(response.data);
            
            // Si solo hay una sucursal, seleccionarla automáticamente
            if (response.data.length === 1 && !sierra) {
              setValue('sucursal_id', response.data[0].id);
            }
          }
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        }
      };
      
      fetchSucursales();
    }
  }, [clientePreseleccionado, setValue, sierra]);

  // Si hay una sierra existente, obtener su cliente y sucursales
  useEffect(() => {
    if (sierra && sierra.sucursal_id) {
      const fetchSucursalData = async () => {
        try {
          const response = await sucursalService.getSucursalById(sierra.sucursal_id);
          if (response.success && response.data) {
            // Establecer el cliente seleccionado
            setSelectedCliente(response.data.cliente_id);
            
            // Cargar todas las sucursales de este cliente
            const sucursalesResponse = await sucursalService.getSucursalesByCliente(response.data.cliente_id);
            if (sucursalesResponse.success) {
              setSucursales(sucursalesResponse.data);
            }
          }
        } catch (error) {
          console.error('Error al cargar datos de la sucursal:', error);
        }
      };
      
      fetchSucursalData();
    }
  }, [sierra]);

  // Cuando cambia el cliente seleccionado, cargar sus sucursales
  useEffect(() => {
    const fetchSucursales = async () => {
      if (selectedCliente) {
        try {
          const response = await sucursalService.getSucursalesByCliente(selectedCliente);
          if (response.success) {
            setSucursales(response.data);
            
            // Limpiar el campo de sucursal si el cliente cambia
            if (!sucursalPreseleccionada) {
              setValue('sucursal_id', '');
            }
          }
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        }
      } else {
        setSucursales([]);
        setValue('sucursal_id', '');
      }
    };

    fetchSucursales();
  }, [selectedCliente, setValue, sucursalPreseleccionada]);

  const handleFormSubmit = async (data) => {
    setSuccess(false);
    const result = await onSubmit(data);
    if (result && result.success) {
      setSuccess(true);
      if (!sierra) {
        reset();
      }
    }
  };

  // Encontrar la sucursal seleccionada
  const sucursalSeleccionada = sucursales.find(s => s.id === parseInt(watchSucursalId));
  
  // Si cambia la sucursal, actualizar el cliente seleccionado
  useEffect(() => {
    if (sucursalSeleccionada && sucursalSeleccionada.cliente_id !== selectedCliente) {
      setSelectedCliente(sucursalSeleccionada.cliente_id);
    }
  }, [sucursalSeleccionada, selectedCliente]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            {sierra ? 'Editar Sierra' : 'Nueva Sierra'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Sierra {sierra ? 'actualizada' : 'creada'} correctamente
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Código de barra */}
            <Grid item xs={12} md={6}>
              <Controller
                name="codigo_barra"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Código de Barra"
                    error={!!errors.codigo_barra}
                    helperText={errors.codigo_barra?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            {/* Tipo de sierra */}
            <Grid item xs={12} md={6}>
              <Controller
                name="tipo_sierra_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tipo_sierra_id}>
                    <InputLabel id="tipo-sierra-label" required>Tipo de Sierra</InputLabel>
                    <Select
                      {...field}
                      labelId="tipo-sierra-label"
                      label="Tipo de Sierra"
                      value={field.value || ''}
                      disabled={loadingCatalogos}
                    >
                      <MenuItem value="">
                        <em>Seleccione un tipo</em>
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
            
            {/* Cliente (para seleccionar sucursal) */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={sucursalPreseleccionada || (sierra && sierra.sucursal_id)}>
                <InputLabel id="cliente-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-label"
                  value={selectedCliente || ''}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                  label="Cliente"
                  disabled={loadingCatalogos || sucursalPreseleccionada || (sierra && sierra.sucursal_id)}
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
              </FormControl>
            </Grid>
            
            {/* Sucursal */}
            <Grid item xs={12} md={6}>
              <Controller
                name="sucursal_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sucursal_id}>
                    <InputLabel id="sucursal-label" required>Sucursal</InputLabel>
                    <Select
                      {...field}
                      labelId="sucursal-label"
                      label="Sucursal"
                      value={field.value || ''}
                      disabled={loadingCatalogos || !selectedCliente || sucursalPreseleccionada}
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
            
            {/* Estado de sierra */}
            <Grid item xs={12} md={6}>
              <Controller
                name="estado_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.estado_id}>
                    <InputLabel id="estado-sierra-label" required>Estado de Sierra</InputLabel>
                    <Select
                      {...field}
                      labelId="estado-sierra-label"
                      label="Estado de Sierra"
                      value={field.value || ''}
                      disabled={loadingCatalogos}
                    >
                      <MenuItem value="">
                        <em>Seleccione un estado</em>
                      </MenuItem>
                      {estadosSierra.map((estado) => (
                        <MenuItem key={estado.id} value={estado.id}>
                          {estado.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.estado_id && (
                      <FormHelperText>{errors.estado_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Activo */}
            <Grid item xs={12} md={6}>
              <Controller
                name="activo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Sierra Activa"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Especificaciones Técnicas
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            {/* Ancho */}
            <Grid item xs={12} md={4}>
              <Controller
                name="ancho"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Ancho (mm)"
                    type="number"
                    error={!!errors.ancho}
                    helperText={errors.ancho?.message}
                  />
                )}
              />
            </Grid>
            
            {/* Largo */}
            <Grid item xs={12} md={4}>
              <Controller
                name="largo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Largo (mm)"
                    type="number"
                    error={!!errors.largo}
                    helperText={errors.largo?.message}
                  />
                )}
              />
            </Grid>
            
            {/* Alto */}
            <Grid item xs={12} md={4}>
              <Controller
                name="alto"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Alto (mm)"
                    type="number"
                    error={!!errors.alto}
                    helperText={errors.alto?.message}
                  />
                )}
              />
            </Grid>
            
            {/* Material */}
            <Grid item xs={12} md={6}>
              <Controller
                name="material"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Material"
                    error={!!errors.material}
                    helperText={errors.material?.message}
                  />
                )}
              />
            </Grid>
            
            {/* Observaciones */}
            <Grid item xs={12}>
              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={4}
                    error={!!errors.observaciones}
                    helperText={errors.observaciones?.message}
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
            {sierra ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Card>
    </form>
  );
};

export default SierraForm;