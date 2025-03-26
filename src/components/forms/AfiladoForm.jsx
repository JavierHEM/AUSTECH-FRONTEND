// src/components/forms/AfiladoForm.jsx
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
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';
import sierraService from '../../services/sierraService';
import catalogoService from '../../services/catalogoService';

// Esquema de validación para formulario de afilado
const afiladoSchema = yup.object().shape({
  sierra_id: yup
    .number()
    .required('La sierra es requerida')
    .typeError('Debe seleccionar una sierra'),
  tipo_afilado_id: yup
    .number()
    .required('El tipo de afilado es requerido')
    .typeError('Debe seleccionar un tipo de afilado'),
  observaciones: yup
    .string()
    .max(500, 'Las observaciones no deben exceder los 500 caracteres'),
  ultimo_afilado: yup
    .boolean()
});

const AfiladoForm = ({ afilado, onSubmit, onCancel, loading, error, sierraPreseleccionada }) => {
  const [success, setSuccess] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sierras, setSierras] = useState([]);
  const [tiposAfilado, setTiposAfilado] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingSierras, setLoadingSierras] = useState(false);
  const [codigoSierra, setCodigoSierra] = useState('');
  const [sierraSeleccionada, setSierraSeleccionada] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(afiladoSchema),
    defaultValues: afilado ? {
      sierra_id: afilado.sierra_id || '',
      tipo_afilado_id: afilado.tipo_afilado_id || '',
      observaciones: afilado.observaciones || '',
      ultimo_afilado: afilado.ultimo_afilado || false
    } : {
      sierra_id: sierraPreseleccionada?.id || '',
      tipo_afilado_id: '',
      observaciones: '',
      ultimo_afilado: false
    }
  });

  const watchSierraId = watch('sierra_id');

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
        
        // Cargar tipos de afilado
        const tiposAfiladoResponse = await catalogoService.getTiposAfilado();
        if (tiposAfiladoResponse.success) {
          setTiposAfilado(tiposAfiladoResponse.data);
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    fetchCatalogos();
  }, []);

  // Cargar sucursales cuando se selecciona un cliente
  useEffect(() => {
    const fetchSucursales = async () => {
      if (selectedCliente) {
        try {
          const response = await sucursalService.getSucursalesByCliente(selectedCliente);
          if (response.success) {
            setSucursales(response.data);
            // Si solo hay una sucursal, seleccionarla automáticamente
            if (response.data.length === 1) {
              setSelectedSucursal(response.data[0].id);
            } else {
              setSelectedSucursal('');
            }
          }
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        }
      } else {
        setSucursales([]);
        setSelectedSucursal('');
      }
    };

    fetchSucursales();
  }, [selectedCliente]);

  // Cargar sierras cuando se selecciona una sucursal
  useEffect(() => {
    const fetchSierras = async () => {
      if (selectedSucursal) {
        setLoadingSierras(true);
        try {
          const response = await sierraService.getSierrasBySucursal(selectedSucursal);
          if (response.success) {
            setSierras(response.data);
          }
        } catch (error) {
          console.error('Error al cargar sierras:', error);
        } finally {
          setLoadingSierras(false);
        }
      } else {
        setSierras([]);
      }
    };

    fetchSierras();
  }, [selectedSucursal]);

  // Actualizar sierra seleccionada cuando cambia el ID
  useEffect(() => {
    if (watchSierraId && sierras.length > 0) {
      const sierra = sierras.find(s => s.id === parseInt(watchSierraId));
      setSierraSeleccionada(sierra || null);
    } else {
      setSierraSeleccionada(null);
    }
  }, [watchSierraId, sierras]);

  // Si hay una sierra preseleccionada, buscar sus datos
  useEffect(() => {
    const loadPreseleccionada = async () => {
      if (sierraPreseleccionada?.id) {
        try {
          const response = await sierraService.searchSierraByCodigo(sierraPreseleccionada.codigo);
          if (response.success && response.data) {
            const sierra = response.data;
            setValue('sierra_id', sierra.id);
            setSierraSeleccionada(sierra);
            
            // Cargar cliente y sucursal
            if (sierra.sucursales?.cliente_id) {
              setSelectedCliente(sierra.sucursales.cliente_id);
            }
            if (sierra.sucursal_id) {
              setSelectedSucursal(sierra.sucursal_id);
            }
          }
        } catch (error) {
          console.error('Error al cargar sierra preseleccionada:', error);
        }
      }
    };
    
    loadPreseleccionada();
  }, [sierraPreseleccionada, setValue]);

  const handleFormSubmit = async (data) => {
    setSuccess(false);
    const result = await onSubmit(data);
    if (result && result.success) {
      setSuccess(true);
      if (!afilado) {
        reset();
        setSierraSeleccionada(null);
        setCodigoSierra('');
      }
    }
  };

  // Buscar sierra por código
  const handleBuscarSierra = async () => {
    if (!codigoSierra) return;
    
    setLoadingSierras(true);
    try {
      const response = await sierraService.searchSierraByCodigo(codigoSierra);
      if (response.success && response.data) {
        const sierra = response.data;
        setValue('sierra_id', sierra.id);
        setSierraSeleccionada(sierra);
        
        // Cargar cliente y sucursal
        if (sierra.sucursales?.cliente_id) {
          setSelectedCliente(sierra.sucursales.cliente_id);
        }
        if (sierra.sucursal_id) {
          setSelectedSucursal(sierra.sucursal_id);
        }
      } else {
        alert('Sierra no encontrada con el código proporcionado');
      }
    } catch (error) {
      console.error('Error al buscar sierra:', error);
      alert('Error al buscar sierra. Por favor, inténtelo de nuevo.');
    } finally {
      setLoadingSierras(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            {afilado ? 'Editar Afilado' : 'Nuevo Afilado'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Afilado {afilado ? 'actualizado' : 'registrado'} correctamente
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Sección para buscar sierra por código */}
            {!afilado && !sierraPreseleccionada && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Buscar Sierra por Código
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <TextField
                      fullWidth
                      label="Código de la Sierra"
                      value={codigoSierra}
                      onChange={(e) => setCodigoSierra(e.target.value)}
                      sx={{ mr: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <QrCodeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleBuscarSierra}
                      disabled={!codigoSierra || loadingSierras}
                      startIcon={loadingSierras ? <CircularProgress size={20} /> : <SearchIcon />}
                    >
                      Buscar
                    </Button>
                  </Box>
                </Card>
              </Grid>
            )}
            
            {/* Selección por filtros de cliente/sucursal */}
            {!afilado && !sierraPreseleccionada && !sierraSeleccionada && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="cliente-label">Cliente</InputLabel>
                    <Select
                      labelId="cliente-label"
                      value={selectedCliente}
                      onChange={(e) => setSelectedCliente(e.target.value)}
                      label="Cliente"
                      disabled={loadingCatalogos}
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
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={!selectedCliente}>
                    <InputLabel id="sucursal-label">Sucursal</InputLabel>
                    <Select
                      labelId="sucursal-label"
                      value={selectedSucursal}
                      onChange={(e) => setSelectedSucursal(e.target.value)}
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
                  </FormControl>
                </Grid>
              </>
            )}
            
            {/* Selección de sierra */}
            <Grid item xs={12}>
              <Controller
                name="sierra_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sierra_id} disabled={!selectedSucursal && !sierraSeleccionada}>
                    <InputLabel id="sierra-label" required>Sierra</InputLabel>
                    <Select
                      {...field}
                      labelId="sierra-label"
                      label="Sierra"
                      value={field.value || ''}
                    >
                      {loadingSierras ? (
                        <MenuItem value="" disabled>
                          Cargando sierras...
                        </MenuItem>
                      ) : sierras.length === 0 && !sierraSeleccionada ? (
                        <MenuItem value="" disabled>
                          No hay sierras disponibles
                        </MenuItem>
                      ) : (
                        <>
                          {sierraSeleccionada && (
                            <MenuItem key={sierraSeleccionada.id} value={sierraSeleccionada.id}>
                              {sierraSeleccionada.codigo_barra} - {sierraSeleccionada.tipos_sierra?.nombre}
                            </MenuItem>
                          )}
                          
                          {sierras
                            .filter(sierra => !sierraSeleccionada || sierra.id !== sierraSeleccionada.id)
                            .map((sierra) => (
                              <MenuItem key={sierra.id} value={sierra.id}>
                                {sierra.codigo_barra} - {sierra.tipos_sierra?.nombre}
                              </MenuItem>
                            ))
                          }
                        </>
                      )}
                    </Select>
                    {errors.sierra_id && (
                      <FormHelperText>{errors.sierra_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Tipo de afilado */}
            <Grid item xs={12} md={6}>
              <Controller
                name="tipo_afilado_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tipo_afilado_id}>
                    <InputLabel id="tipo-afilado-label" required>Tipo de Afilado</InputLabel>
                    <Select
                      {...field}
                      labelId="tipo-afilado-label"
                      label="Tipo de Afilado"
                      value={field.value || ''}
                    >
                      {loadingCatalogos ? (
                        <MenuItem value="" disabled>
                          Cargando tipos de afilado...
                        </MenuItem>
                      ) : tiposAfilado.length === 0 ? (
                        <MenuItem value="" disabled>
                          No hay tipos de afilado disponibles
                        </MenuItem>
                      ) : (
                        tiposAfilado.map((tipo) => (
                          <MenuItem key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.tipo_afilado_id && (
                      <FormHelperText>{errors.tipo_afilado_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Último afilado */}
            <Grid item xs={12} md={6}>
              <Controller
                name="ultimo_afilado"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Marcar como último afilado"
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
            disabled={loading || (!watchSierraId && !sierraSeleccionada)}
          >
            {afilado ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Card>
    </form>
  );
};

export default AfiladoForm;