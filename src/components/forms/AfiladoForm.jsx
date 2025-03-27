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
  FormControlLabel,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  InfoOutlined as InfoIcon
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

const AfiladoForm = ({ afilado, onSubmit, onCancel, loading, error: propError, sierraPreseleccionada }) => {
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
  const [error, setError] = useState(propError || null);
  const [warning, setWarning] = useState(null);
  const [showUltimoAfiladoDialog, setShowUltimoAfiladoDialog] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Convertir a booleanos para evitar problemas con disabled
  const isLoading = !!loading || formSubmitting;
  const isLoadingCatalogos = !!loadingCatalogos;
  const isLoadingSierras = !!loadingSierras;
  const hasSelectedCliente = !!selectedCliente;
  const hasSelectedSucursal = !!selectedSucursal;
  const hasSierraSeleccionada = !!sierraSeleccionada;
  const hasSierraPreseleccionada = !!sierraPreseleccionada;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues
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
  const watchUltimoAfilado = watch('ultimo_afilado');

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
        setError('Error al cargar catálogos. Por favor, inténtelo de nuevo.');
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
          setError('Error al cargar sucursales. Por favor, inténtelo de nuevo.');
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
            // Filtrar sierras inactivas (marcadas como último afilado)
            const sierrasActivas = response.data.filter(sierra => sierra.activo);
            setSierras(sierrasActivas);
          }
        } catch (error) {
          console.error('Error al cargar sierras:', error);
          setError('Error al cargar sierras. Por favor, inténtelo de nuevo.');
        } finally {
          setLoadingSierras(false);
        }
      } else {
        setSierras([]);
      }
    };

    fetchSierras();
  }, [selectedSucursal]);

  // Actualizar sierra seleccionada cuando cambia el ID y validar su estado
  useEffect(() => {
    const validateSierra = async () => {
      if (watchSierraId && sierras.length > 0) {
        const sierra = sierras.find(s => s.id === parseInt(watchSierraId));
        setSierraSeleccionada(sierra || null);
        
        // Limpiar estados
        setError(null);
        setWarning(null);
        
        // Si encontramos la sierra, validarla
        if (sierra) {
          // Verificar si la sierra está marcada como "último afilado"
          if (!sierra.activo) {
            setError('Esta sierra ha sido marcada como "último afilado" y no puede recibir nuevos afilados.');
            return;
          }
          
          try {
            // Verificar si tiene afilados pendientes
            const validacionResponse = await sierraService.validarSierraParaAfilado(sierra.id);
            
            if (!validacionResponse.success) {
              setError(validacionResponse.error || 'Error al validar la sierra');
              return;
            }
            
            if (!validacionResponse.puede_afilar) {
              setWarning(validacionResponse.mensaje || 'Esta sierra no puede recibir nuevos afilados por un problema no especificado.');
              return;
            }
          } catch (err) {
            console.error('Error al validar sierra:', err);
            setWarning('No se pudo validar completamente el estado de la sierra. Proceda con precaución.');
          }
        } else {
          // No encontramos la sierra en la lista
          setSierraSeleccionada(null);
        }
      } else {
        setSierraSeleccionada(null);
      }
    };
    
    validateSierra();
  }, [watchSierraId, sierras]);

  // Actualizar advertencia cuando cambia el estado de último afilado
  useEffect(() => {
    if (watchUltimoAfilado) {
      setWarning('Está marcando esta sierra como "último afilado". Esto indicará que la sierra ha llegado al final de su vida útil.');
    } else {
      setWarning(null);
    }
  }, [watchUltimoAfilado]);

  // Si hay una sierra preseleccionada, buscar sus datos
  useEffect(() => {
    const loadPreseleccionada = async () => {
      if (sierraPreseleccionada?.id) {
        try {
          // Buscar la sierra completa
          const response = await sierraService.getSierraById(sierraPreseleccionada.id);
          
          if (response.success && response.data) {
            const sierra = response.data;
            
            // Verificar si la sierra está activa
            if (!sierra.activo) {
              setError('Esta sierra ha sido marcada como "último afilado" y no puede recibir nuevos afilados.');
              return;
            }
            
            // Verificar si tiene afilados pendientes
            const validacionResponse = await sierraService.validarSierraParaAfilado(sierra.id);
            
            if (!validacionResponse.success || !validacionResponse.puede_afilar) {
              setWarning(validacionResponse.mensaje || 'Esta sierra puede tener problemas para recibir un nuevo afilado');
            }
            
            // Establecer datos en el formulario
            setValue('sierra_id', sierra.id);
            setSierraSeleccionada(sierra);
            
            // Cargar cliente y sucursal
            if (sierra.sucursal?.cliente_id) {
              setSelectedCliente(sierra.sucursal.cliente_id);
            }
            
            if (sierra.sucursal_id) {
              setSelectedSucursal(sierra.sucursal_id);
            }
          }
        } catch (error) {
          console.error('Error al cargar sierra preseleccionada:', error);
          setError('Error al cargar la sierra preseleccionada. Por favor, inténtelo de nuevo.');
        }
      }
    };
    
    loadPreseleccionada();
  }, [sierraPreseleccionada, setValue]);

  // Manejar el cambio en el switch de último afilado
  const handleUltimoAfiladoChange = (checked) => {
    if (checked) {
      // Mostrar diálogo de confirmación
      setShowUltimoAfiladoDialog(true);
    } else {
      setValue('ultimo_afilado', false);
      setWarning(null);
    }
  };

  // Confirmar marcado como último afilado
  const handleConfirmUltimoAfilado = () => {
    setValue('ultimo_afilado', true);
    setShowUltimoAfiladoDialog(false);
    setWarning('Está marcando esta sierra como "último afilado". Esto indicará que la sierra ha llegado al final de su vida útil.');
  };

  // Cancelar marcado como último afilado
  const handleCancelUltimoAfilado = () => {
    setValue('ultimo_afilado', false);
    setShowUltimoAfiladoDialog(false);
    setWarning(null);
  };

  // Buscar sierra por código
  const handleBuscarSierra = async () => {
    if (!codigoSierra) return;
    
    setLoadingSierras(true);
    setError(null);
    setWarning(null);
    
    try {
      const response = await sierraService.searchSierraByCodigo(codigoSierra);
      
      if (response.success && response.data) {
        const sierra = response.data;
        
        // Verificar si la sierra está activa
        if (!sierra.activo) {
          setError('Esta sierra ha sido marcada como "último afilado" y no puede recibir nuevos afilados.');
          setSierraSeleccionada(sierra);
          return;
        }
        
        // Verificar si tiene afilados pendientes
        const validacionResponse = await sierraService.validarSierraParaAfilado(sierra.id);
        
        if (!validacionResponse.success || !validacionResponse.puede_afilar) {
          setWarning(validacionResponse.mensaje || 'Esta sierra puede tener problemas para recibir un nuevo afilado');
        }
        
        // Establecer datos en el formulario
        setValue('sierra_id', sierra.id);
        setSierraSeleccionada(sierra);
        
        // Cargar cliente y sucursal
        if (sierra.sucursal?.cliente_id) {
          setSelectedCliente(sierra.sucursal.cliente_id);
        }
        
        if (sierra.sucursal_id) {
          setSelectedSucursal(sierra.sucursal_id);
        }
      } else {
        setError('Sierra no encontrada con el código proporcionado');
      }
    } catch (error) {
      console.error('Error al buscar sierra:', error);
      setError('Error al buscar sierra. Por favor, inténtelo de nuevo.');
    } finally {
      setLoadingSierras(false);
    }
  };

  // Manejar tecla Enter en búsqueda de código
  const handleCodigoKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBuscarSierra();
    }
  };

  const handleFormSubmit = async (data) => {
    setSuccess(false);
    setError(null);
    setFormSubmitting(true);
    
    try {
      // Si está marcando como último afilado, actualizar el estado de la sierra
      if (data.ultimo_afilado && data.sierra_id) {
        try {
          await sierraService.marcarUltimoAfilado(data.sierra_id, true);
        } catch (error) {
          console.error('Error al marcar sierra como último afilado:', error);
          // Continuar con el proceso aunque falle la actualización de la sierra
        }
      }
      
      const result = await onSubmit(data);
      
      if (result && result.success) {
        setSuccess(true);
        if (!afilado) {
          reset();
          setSierraSeleccionada(null);
          setCodigoSierra('');
          setValue('ultimo_afilado', false);
        }
      } else if (result && result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error en el proceso de afilado:', err);
      setError('Error al procesar el afilado. Por favor, inténtelo de nuevo.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            {afilado ? 'Editar Afilado' : 'Nuevo Afilado'}
          </Typography>
          
          {/* Mensajes de error, advertencia y éxito */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}
          
          {warning && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
              {warning}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Afilado {afilado ? 'actualizado' : 'registrado'} correctamente
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Sección para buscar sierra por código */}
            {!afilado && !hasSierraPreseleccionada && (
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
                      onKeyDown={handleCodigoKeyDown}
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
                      disabled={!codigoSierra || isLoadingSierras}
                      startIcon={isLoadingSierras ? <CircularProgress size={20} /> : <SearchIcon />}
                    >
                      Buscar
                    </Button>
                  </Box>
                </Card>
              </Grid>
            )}
            
            {/* Selección por filtros de cliente/sucursal */}
            {!afilado && !hasSierraPreseleccionada && !hasSierraSeleccionada && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="cliente-label">Cliente</InputLabel>
                    <Select
                      labelId="cliente-label"
                      value={selectedCliente}
                      onChange={(e) => setSelectedCliente(e.target.value)}
                      label="Cliente"
                      disabled={isLoadingCatalogos}
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
                  <FormControl fullWidth disabled={!hasSelectedCliente}>
                    <InputLabel id="sucursal-label">Sucursal</InputLabel>
                    <Select
                      labelId="sucursal-label"
                      value={selectedSucursal}
                      onChange={(e) => setSelectedSucursal(e.target.value)}
                      label="Sucursal"
                      disabled={!hasSelectedCliente}
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
                  <FormControl 
                    fullWidth 
                    error={!!errors.sierra_id} 
                    disabled={!(hasSelectedSucursal || hasSierraSeleccionada)}
                  >
                    <InputLabel id="sierra-label" required>Sierra</InputLabel>
                    <Select
                      {...field}
                      labelId="sierra-label"
                      label="Sierra"
                      value={field.value || ''}
                    >
                      {isLoadingSierras ? (
                        <MenuItem value="" disabled>
                          Cargando sierras...
                        </MenuItem>
                      ) : sierras.length === 0 && !hasSierraSeleccionada ? (
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
                            .filter(sierra => !hasSierraSeleccionada || sierra.id !== sierraSeleccionada.id)
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
                      {isLoadingCatalogos ? (
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
                        checked={!!field.value}
                        onChange={(e) => handleUltimoAfiladoChange(e.target.checked)}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1">Marcar como último afilado</Typography>
                        <Tooltip title="Al marcar esta opción, está indicando que la sierra ha llegado al final de su vida útil y no podrá recibir más afilados después de este.">
                          <IconButton size="small" color="info">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                )}
              />
              
              {watchUltimoAfilado && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  ¡Atención! Esta opción marca la sierra como inactiva para futuros afilados.
                </Typography>
              )}
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
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            disabled={isLoading || (!watchSierraId && !hasSierraSeleccionada) || !!error}
          >
            {afilado ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Card>
      
      {/* Diálogo de confirmación para último afilado */}
      <Dialog
        open={showUltimoAfiladoDialog}
        onClose={handleCancelUltimoAfilado}
        aria-labelledby="ultimo-afilado-dialog-title"
      >
        <DialogTitle id="ultimo-afilado-dialog-title" sx={{ color: 'warning.main' }}>
          Confirmación - Último Afilado
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Está a punto de marcar esta sierra como <strong>"último afilado"</strong>. Esto indica que la sierra ha llegado al final de su vida útil y no podrá recibir más afilados después de este.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Una vez completado este afilado, la sierra quedará <strong>inactiva</strong> en el sistema y no podrá ser seleccionada para futuros afilados.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            ¿Está seguro que desea continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUltimoAfilado}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmUltimoAfilado} 
            color="warning" 
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default AfiladoForm;