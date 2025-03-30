// src/pages/afilados/ScanSierraAfilado.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  Fade,
  Chip,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  FlashOn as FlashOnIcon
} from '@mui/icons-material';
import sierraService from '../../services/sierraService';
import afiladoService from '../../services/afiladoService';

const ScanSierraAfilado = () => {
  const navigate = useNavigate();
  const [codigoSierra, setCodigoSierra] = useState('');
  const [sierra, setSierra] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState(null);
  const [showNewSierraDialog, setShowNewSierraDialog] = useState(false);
  const [lastAfiladoPendiente, setLastAfiladoPendiente] = useState(null);
  const inputRef = useRef(null);
  
  // Focus en el input de código al cargar el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Limpiar mensajes cuando cambia el código de sierra
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setWarning(null);
    setSierra(null);
    setLastAfiladoPendiente(null);
  }, [codigoSierra]);

  // Función para normalizar el código de sierra (eliminar espacios y caracteres especiales)
  const normalizarCodigo = (codigo) => {
    if (!codigo) return '';
    
    // Convertir a string y eliminar espacios
    let normalizado = String(codigo).trim();
    
    // Eliminar todos los caracteres que no sean números o letras
    normalizado = normalizado.replace(/[^\w\d]/g, '');
    
    // Convertir letras a mayúsculas para coincidencia uniforme
    normalizado = normalizado.toUpperCase();
    
    return normalizado;
  };

  // Función para buscar una sierra por su código
  const handleBuscarSierra = async () => {
    const codigoNormalizado = normalizarCodigo(codigoSierra);
    
    if (!codigoNormalizado) {
      setError("Debe ingresar un código de sierra");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setWarning(null);
    
    try {
      console.log("Buscando sierra con código normalizado:", codigoNormalizado);
      
      // Intentar búsqueda directa con el código normalizado
      let response = await sierraService.searchSierraByCodigo(codigoNormalizado);
      
      // Si no se encuentra, intentar búsqueda alternativa
      if (!response.success) {
        // Opción 1: Probar con el código original sin normalizar
        response = await sierraService.searchSierraByCodigo(codigoSierra);
        
        // Si aún no hay éxito, intentar búsqueda por todos los códigos
        if (!response.success) {
          try {
            // Esta opción requiere implementar un nuevo método en sierraService
            const allSierrasResponse = await sierraService.getAllSierras();
            
            if (allSierrasResponse.success) {
              // Buscar una sierra cuyo código normalizado coincida con nuestro código normalizado
              const sierraEncontrada = allSierrasResponse.data.find(sierra => {
                const sierraCodigo = sierra.codigo_barra || sierra.codigo;
                return normalizarCodigo(sierraCodigo) === codigoNormalizado;
              });
              
              if (sierraEncontrada) {
                response = { success: true, data: sierraEncontrada };
                console.log("Sierra encontrada usando coincidencia alternativa:", sierraEncontrada);
              }
            }
          } catch (err) {
            console.error("Error en búsqueda alternativa:", err);
          }
        }
      }
      
      // Si no se encontró la sierra, mostrar diálogo para crear una nueva
      if (!response.success) {
        setError(`Sierra no encontrada: ${codigoNormalizado}`);
        setShowNewSierraDialog(true);
        return;
      }
      
      const sierraData = response.data;
      setSierra(sierraData);
      
      // Validar si la sierra está activa
      if (!sierraData.activo) {
        setError("Esta sierra ha sido marcada como último afilado y no puede recibir nuevos afilados");
        return;
      }
      
      // Verificar si tiene un afilado pendiente (sin fecha_salida)
      const afiladosResponse = await afiladoService.getAfiladosBySierra(sierraData.id);
      
      if (afiladosResponse.success && afiladosResponse.data.length > 0) {
        // Ordenar por fecha de afilado descendente para obtener el más reciente
        const afilados = afiladosResponse.data.sort((a, b) => 
          new Date(b.fecha_afilado) - new Date(a.fecha_afilado)
        );
        
        const ultimoAfilado = afilados[0];
        
        if (ultimoAfilado && !ultimoAfilado.fecha_salida) {
          setLastAfiladoPendiente(ultimoAfilado);
          setWarning("Esta sierra ya tiene un afilado pendiente que no ha sido retirado");
          return;
        }
      }
      
      // Si pasa todas las validaciones, mostrar mensaje de éxito
      setSuccess("Sierra validada correctamente");
      
      // OPTIMIZACIÓN: Continuar directamente al registro de afilado después de un breve retraso
      setTimeout(() => {
        handleContinuar();
      }, 500); // Esperar 500ms para que el usuario vea el mensaje de éxito
      
    } catch (err) {
      console.error("Error al buscar sierra:", err);
      setError("Error al buscar sierra. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar evento de tecla para permitir escaneo rápido
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Prevenir comportamiento por defecto
      e.preventDefault();
      handleBuscarSierra();
    }
  };

  // Limpiar campo de código
  const handleLimpiarCodigo = () => {
    setCodigoSierra('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Navegar al formulario de creación de afilado
  const handleContinuar = () => {
    navigate('/afilados/nuevo', { 
      state: { 
        sierraId: sierra.id,
        sierraCodigo: sierra.codigo || sierra.codigo_barra,
        sierraTipo: sierra.tipos_sierra?.nombre,
        sierraCliente: sierra.sucursales?.clientes?.razon_social,
        sierraSucursal: sierra.sucursales?.nombre,
        // Enviar más información para agilizar el proceso
        modoRapido: true
      } 
    });
  };

  // Navegar a la creación de una nueva sierra y luego al afilado
  const handleCrearNuevaSierra = () => {
    // Usar el código normalizado al crear una nueva sierra
    const codigoNormalizado = normalizarCodigo(codigoSierra);
    
    navigate('/sierras/nueva', { 
      state: { 
        codigoEscaneado: codigoNormalizado,
        returnToAfilado: true, // Indicar que debe volver al afilado después
        modoRapido: true // Activar modo rápido para el flujo completo
      } 
    });
    
    // Cerrar el diálogo
    setShowNewSierraDialog(false);
  };

  // Ver detalle del afilado pendiente
  const handleVerAfiladoPendiente = () => {
    if (lastAfiladoPendiente) {
      navigate(`/afilados/${lastAfiladoPendiente.id}`);
    }
  };

  // Registrar salida del afilado pendiente
  const handleRegistrarSalida = async () => {
    if (!lastAfiladoPendiente) return;
    
    setLoading(true);
    try {
      const response = await afiladoService.registrarSalida(lastAfiladoPendiente.id);
      
      if (response.success) {
        setSuccess("Se ha registrado la salida del afilado pendiente. Ahora puede registrar un nuevo afilado.");
        setWarning(null);
        setLastAfiladoPendiente(null);
        
        // OPTIMIZACIÓN: Continuar directamente al registro de afilado
        setTimeout(() => {
          handleContinuar();
        }, 500);
      } else {
        setError("Error al registrar la salida del afilado: " + (response.error || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error al registrar salida:", err);
      setError("Error al procesar la salida del afilado.");
    } finally {
      setLoading(false);
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
        <Typography color="text.primary">Escaneo de Sierra</Typography>
      </Breadcrumbs>

      {/* Encabezado y botón de volver */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Escaneo Rápido para Afilado
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/afilados"
        >
          Volver a Afilados
        </Button>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" gutterBottom>
              Escanee el código de barras de la sierra
            </Typography>
            <Chip 
              icon={<FlashOnIcon />} 
              label="Modo rápido" 
              color="primary" 
              size="small"
            />
          </Box>
          
          <Box display="flex" alignItems="center" mb={3}>
            <TextField
              fullWidth
              label="Código de Sierra"
              variant="outlined"
              value={codigoSierra}
              onChange={(e) => setCodigoSierra(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              inputRef={inputRef}
              sx={{ mr: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeIcon />
                  </InputAdornment>
                ),
                endAdornment: codigoSierra ? (
                  <InputAdornment position="end">
                    <IconButton onClick={handleLimpiarCodigo} edge="end">
                      <DeleteIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleBuscarSierra}
              disabled={loading || !codigoSierra.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Buscar
            </Button>
          </Box>
          
          {/* Mensajes de retroalimentación */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}
          
          {warning && (
            <Alert 
              severity="warning" 
              sx={{ mb: 2 }} 
              icon={<WarningIcon />}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleRegistrarSalida}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : "Registrar Salida"}
                </Button>
              }
            >
              {warning}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>
              {success}
            </Alert>
          )}
          
          {/* Información de la sierra encontrada */}
          {sierra && (
            <Fade in={!!sierra}>
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Información de la Sierra
                      </Typography>
                      
                      {!warning && success && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleContinuar}
                          endIcon={<ArrowForwardIcon />}
                          size="small"
                        >
                          Continuar al Afilado
                        </Button>
                      )}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Código:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {sierra.codigo_barra || sierra.codigo}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tipo de Sierra:
                    </Typography>
                    <Typography variant="body1">
                      {sierra.tipos_sierra?.nombre || 'No especificado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Cliente:
                    </Typography>
                    <Typography variant="body1">
                      {sierra.sucursales?.clientes?.razon_social || 'No especificado'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Sucursal:
                    </Typography>
                    <Typography variant="body1">
                      {sierra.sucursales?.nombre || 'No especificada'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Estado:
                    </Typography>
                    <Chip 
                      label={sierra.activo ? 'Activa' : 'Inactiva - Último afilado'}
                      color={sierra.activo ? 'success' : 'error'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
                
                {/* Acciones para la sierra */}
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  {warning && lastAfiladoPendiente ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleVerAfiladoPendiente}
                      startIcon={<WarningIcon />}
                      sx={{ mr: 1 }}
                    >
                      Ver Afilado Pendiente
                    </Button>
                  ) : null}
                  
                  {warning && lastAfiladoPendiente && (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleRegistrarSalida}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    >
                      Registrar Salida y Continuar
                    </Button>
                  )}
                </Box>
              </Paper>
            </Fade>
          )}
        </CardContent>
      </Card>
      
      {/* Instrucciones generales (solo mostrar si no hay sierra encontrada) */}
      {!sierra && !loading && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Instrucciones para el Proceso de Afilado
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Proceso de Validación:
            </Typography>
            <Typography variant="body2" paragraph>
              1. Escanee el código de barras de la sierra con la pistola lectora o ingréselo manualmente y presione Enter o el botón Buscar.
            </Typography>
            <Typography variant="body2" paragraph>
              2. El sistema realizará las siguientes verificaciones:
            </Typography>
            <Typography variant="body2" component="div" sx={{ pl: 3 }}>
              • Verifica si la sierra existe en la base de datos.<br />
              • Comprueba si la sierra está activa o marcada como "último afilado".<br />
              • Verifica si la sierra tiene un afilado pendiente (sin fecha de salida).
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Acciones según resultado:
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Si la sierra no existe:</strong> Podrá registrarla como nueva sierra en el sistema.
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Si la sierra está inactiva (último afilado):</strong> No se podrá registrar un nuevo afilado. La sierra ha llegado al final de su vida útil.
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Si la sierra tiene un afilado pendiente:</strong> No se podrá registrar un nuevo afilado hasta que se registre la salida del afilado pendiente.
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Si la sierra pasa todas las validaciones:</strong> Podrá continuar al formulario de registro de afilado.
            </Typography>
          </Box>
        </Paper>
      )}
      
      {/* Modal para sierra no encontrada */}
      <Dialog
        open={showNewSierraDialog}
        onClose={() => setShowNewSierraDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sierra No Encontrada</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            No se encontró ninguna sierra con el código: <strong>{normalizarCodigo(codigoSierra)}</strong>
          </Typography>
          <Typography paragraph>
            ¿Desea registrar una nueva sierra con este código?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Al continuar, se le redirigirá al formulario de registro de sierra y luego podrá registrar inmediatamente un afilado para esta sierra.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewSierraDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCrearNuevaSierra}
          >
            Crear Nueva Sierra
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanSierraAfilado;