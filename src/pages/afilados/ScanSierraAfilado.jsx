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
  ArrowBack as ArrowBackIcon
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

  // Función para buscar una sierra por su código
  const handleBuscarSierra = async () => {
    if (!codigoSierra.trim()) {
      setError("Debe ingresar un código de sierra");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setWarning(null);
    
    try {
      // 1. Buscar la sierra por código
      const response = await sierraService.searchSierraByCodigo(codigoSierra);
      
      if (!response.success) {
        setError("Sierra no encontrada");
        setShowNewSierraDialog(true);
        return;
      }
      
      const sierraData = response.data;
      setSierra(sierraData);
      
      // 2. Validar si la sierra está activa
      if (!sierraData.activo) {
        setError("Esta sierra ha sido marcada como último afilado y no puede recibir nuevos afilados");
        return;
      }
      
      // 3. Verificar si tiene un afilado pendiente (sin fecha_salida)
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
      setSuccess("Sierra validada correctamente. Puede proceder a registrar un nuevo afilado.");
      
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
      handleBuscarSierra();
    }
  };

  // Navegar al formulario de creación de afilado
  const handleContinuar = () => {
    navigate('/afilados/nuevo', { 
      state: { 
        sierraId: sierra.id,
        sierraCodigo: sierra.codigo || sierra.codigo_barra
      } 
    });
  };

  // Navegar a la creación de una nueva sierra
  const handleCrearNuevaSierra = () => {
    navigate('/sierras/nueva', { 
      state: { 
        codigoEscaneado: codigoSierra,
        returnToAfilado: true
      } 
    });
  };

  // Ver detalle del afilado pendiente
  const handleVerAfiladoPendiente = () => {
    if (lastAfiladoPendiente) {
      navigate(`/afilados/${lastAfiladoPendiente.id}`);
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
          Escaneo de Sierra para Afilado
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
          <Typography variant="h6" gutterBottom>
            Escanee el código de barras de la sierra
          </Typography>
          
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
            <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
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
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Información de la Sierra
                    </Typography>
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
                    >
                      Ver Afilado Pendiente
                    </Button>
                  ) : success ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleContinuar}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Continuar al Registro de Afilado
                    </Button>
                  ) : null}
                </Box>
              </Paper>
            </Fade>
          )}
        </CardContent>
      </Card>
      
      {/* Instrucciones generales */}
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
            No se encontró ninguna sierra con el código: <strong>{codigoSierra}</strong>
          </Typography>
          <Typography>
            ¿Desea registrar una nueva sierra con este código?
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