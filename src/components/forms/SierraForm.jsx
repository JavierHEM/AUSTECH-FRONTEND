// src/components/forms/SierraForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import { 
  InfoOutlined as InfoIcon,
  Business as BusinessIcon, 
  StorefrontOutlined as SucursalIcon 
} from '@mui/icons-material';
import catalogoService from '../../services/catalogoService';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';

// Esquema de validación
const validationSchema = yup.object().shape({
  codigo_barra: yup.string().required('El código es requerido'),
  tipo_sierra_id: yup.number().required('El tipo de sierra es requerido'),
  estado_id: yup.number().required('El estado es requerido'),
  sucursal_id: yup.number().required('La sucursal es requerida'),
  activo: yup.boolean(),
  ancho: yup.number().positive('El ancho debe ser un valor positivo').nullable().transform(value => (isNaN(value) ? null : value)),
  largo: yup.number().positive('El largo debe ser un valor positivo').nullable().transform(value => (isNaN(value) ? null : value)),
  alto: yup.number().positive('El alto debe ser un valor positivo').nullable().transform(value => (isNaN(value) ? null : value)),
  observaciones: yup.string().nullable()
});

const SierraForm = ({ 
  sierra = null, 
  onSubmit, 
  onCancel, 
  loading, 
  error, 
  clientePreseleccionado = null,
  sucursalPreseleccionada = null,
  disableClienteSucursal = false,
  clienteInfo = null,
  sucursalInfo = null
}) => {
  const [tiposSierra, setTiposSierra] = useState([]);
  const [estadosSierra, setEstadosSierra] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(clientePreseleccionado || (sierra?.sucursales?.cliente_id) || '');
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Configuración del formulario con valores por defecto
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      codigo_barra: sierra?.codigo_barra || '',
      tipo_sierra_id: sierra?.tipo_sierra_id || '',
      estado_id: sierra?.estado_id || '',
      sucursal_id: sierra?.sucursal_id || sucursalPreseleccionada || '',
      activo: sierra ? sierra.activo : true,
      ancho: sierra?.ancho || '',
      largo: sierra?.largo || '',
      alto: sierra?.alto || '',
      material: sierra?.material || '',
      observaciones: sierra?.observaciones || ''
    }
  });

  // Observar el valor de sucursal seleccionada
  const selectedSucursal = watch('sucursal_id');

  // Cargar catálogos y listas al iniciar
  useEffect(() => {
    const loadCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
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

        // Cargar clientes solo si no está en modo de edición o hay un cliente preseleccionado
        if (!disableClienteSucursal) {
          const clientesResponse = await clienteService.getAllClientes();
          if (clientesResponse.success) {
            setClientes(clientesResponse.data);
          }
        }

        // Si hay un cliente seleccionado, cargar sus sucursales
        if (selectedCliente) {
          loadSucursalesByCliente(selectedCliente);
        }
        
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    loadCatalogos();
  }, [disableClienteSucursal]);

  // Cargar sucursales cuando cambia el cliente seleccionado
  useEffect(() => {
    if (selectedCliente && !disableClienteSucursal) {
      loadSucursalesByCliente(selectedCliente);
    }
  }, [selectedCliente, disableClienteSucursal]);

  // Función para cargar sucursales por cliente
  const loadSucursalesByCliente = async (clienteId) => {
    try {
      const response = await sucursalService.getSucursalesByCliente(clienteId);
      if (response.success) {
        setSucursales(response.data);
        
        // Si hay una sola sucursal y no hay una preseleccionada, seleccionarla automáticamente
        if (response.data.length === 1 && !selectedSucursal && !sucursalPreseleccionada) {
          setValue('sucursal_id', response.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error al cargar sucursales por cliente:', err);
    }
  };

  // Manejar cambio de cliente
  const handleClienteChange = (event) => {
    const clienteId = event.target.value;
    setSelectedCliente(clienteId);
    setValue('sucursal_id', ''); // Resetear la sucursal seleccionada
  };

  // Función para enviar el formulario
  const onFormSubmit = async (data) => {
    const result = await onSubmit(data);
    return result;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
      {/* Sección de información de cliente y sucursal */}
      {disableClienteSucursal ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography>
              El cliente y la sucursal no pueden ser modificados después de crear la sierra.
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled variant="filled">
                <InputLabel id="cliente-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-label"
                  value={selectedCliente || ''}
                  label="Cliente"
                  startAdornment={
                    <BusinessIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />
                  }
                >
                  {clienteInfo ? (
                    <MenuItem value={clienteInfo.id}>
                      {clienteInfo.razon_social}
                    </MenuItem>
                  ) : sierra?.sucursales?.clientes ? (
                    <MenuItem value={sierra.sucursales.clientes.id}>
                      {sierra.sucursales.clientes.razon_social}
                    </MenuItem>
                  ) : (
                    <MenuItem value="">
                      <em>Cliente no disponible</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="sucursal_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled variant="filled" error={!!errors.sucursal_id}>
                    <InputLabel id="sucursal-label">Sucursal</InputLabel>
                    <Select
                      {...field}
                      labelId="sucursal-label"
                      label="Sucursal"
                      startAdornment={
                        <SucursalIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />
                      }
                    >
                      {sucursalInfo ? (
                        <MenuItem value={sucursalInfo.id}>
                          {sucursalInfo.nombre}
                        </MenuItem>
                      ) : sierra?.sucursales ? (
                        <MenuItem value={sierra.sucursales.id}>
                          {sierra.sucursales.nombre}
                        </MenuItem>
                      ) : (
                        <MenuItem value="">
                          <em>Sucursal no disponible</em>
                        </MenuItem>
                      )}
                    </Select>
                    {errors.sucursal_id && (
                      <FormHelperText>{errors.sucursal_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.sucursal_id} disabled={!!sucursalPreseleccionada}>
              <InputLabel id="cliente-label">Cliente</InputLabel>
              <Select
                labelId="cliente-label"
                value={selectedCliente || ''}
                onChange={handleClienteChange}
                label="Cliente"
                disabled={!!clientePreseleccionado || loadingCatalogos}
                startAdornment={
                  <BusinessIcon color="action" sx={{ mr: 1 }} />
                }
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
              {!selectedCliente && (
                <FormHelperText>Debe seleccionar un cliente primero</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="sucursal_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.sucursal_id} disabled={!selectedCliente || !!sucursalPreseleccionada}>
                  <InputLabel id="sucursal-label">Sucursal</InputLabel>
                  <Select
                    {...field}
                    labelId="sucursal-label"
                    label="Sucursal"
                    startAdornment={
                      <SucursalIcon color="action" sx={{ mr: 1 }} />
                    }
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
        </Grid>
      )}

      {/* Divider */}
      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
        Información de la Sierra
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Campos principales */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Controller
            name="codigo_barra"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Código de Sierra *"
                fullWidth
                error={!!errors.codigo_barra}
                helperText={errors.codigo_barra?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="tipo_sierra_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipo_sierra_id}>
                <InputLabel id="tipo-sierra-label">Tipo de Sierra *</InputLabel>
                <Select
                  {...field}
                  labelId="tipo-sierra-label"
                  label="Tipo de Sierra *"
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
        <Grid item xs={12} md={4}>
          <Controller
            name="estado_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.estado_id}>
                <InputLabel id="estado-sierra-label">Estado de Sierra *</InputLabel>
                <Select
                  {...field}
                  labelId="estado-sierra-label"
                  label="Estado de Sierra *"
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
      </Grid>

      {/* Especificaciones técnicas */}
      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 3, mb: 1 }}>
        Especificaciones Técnicas
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Controller
            name="ancho"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Ancho (mm)"
                type="number"
                fullWidth
                error={!!errors.ancho}
                helperText={errors.ancho?.message}
                InputProps={{ inputProps: { min: 0 } }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="largo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Largo (mm)"
                type="number"
                fullWidth
                error={!!errors.largo}
                helperText={errors.largo?.message}
                InputProps={{ inputProps: { min: 0 } }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="alto"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Alto (mm)"
                type="number"
                fullWidth
                error={!!errors.alto}
                helperText={errors.alto?.message}
                InputProps={{ inputProps: { min: 0 } }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="material"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Material"
                fullWidth
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Observaciones */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Controller
            name="observaciones"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Observaciones"
                fullWidth
                multiline
                rows={3}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Estado activo/inactivo */}
      <Box sx={{ mt: 2 }}>
        <Controller
          name="activo"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Typography>
                    {value ? 'Sierra Activa' : 'Sierra Inactiva'}
                  </Typography>
                  <Tooltip title="Una sierra inactiva no puede registrar nuevos afilados">
                    <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                  </Tooltip>
                </Box>
              }
            />
          )}
        />
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Botones de acción */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {sierra ? 'Actualizar Sierra' : 'Registrar Sierra'}
        </Button>
      </Box>
    </Box>
  );
};

export default SierraForm;