// src/pages/afilados/RegistroSalidaMasiva.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Grid, 
  Alert, 
  Chip, 
  CircularProgress, 
  Divider, 
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  QrCode as QrCodeIcon, 
  Search as SearchIcon, 
  Delete as DeleteIcon, 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as CheckCircleIcon,
  ContentCut as SierraIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import sierraService from '../../services/sierraService';
import afiladoService from '../../services/afiladoService';
import clienteService from '../../services/clienteService';

const RegistroSalidaMasiva = () => {
  const navigate = useNavigate();
  const [codigoSierra, setCodigoSierra] = useState('');
  const [afiladosPendientes, setAfiladosPendientes] = useState([]);
  const [sierrasEscaneadas, setSierrasEscaneadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingAll, setProcessingAll] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [clientesMap, setClientesMap] = useState({});
  const inputRef = useRef(null);

  // Enfocar el campo de código al cargar
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cargar mapeo de clientes
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          const clientesMapeados = {};
          clientesResponse.data.forEach(cliente => {
            clientesMapeados[cliente.id] = cliente.razon_social;
          });
          setClientesMap(clientesMapeados);
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };

    cargarClientes();
  }, []);

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

  // Limpiar mensaje de error o éxito después de 5 segundos
  useEffect(() => {
    let timer;
    if (error || success) {
      timer = setTimeout(() => {
        if (error) setError(null);
        if (success) setSuccess('');
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, success]);

  // Manejar escaneo de código
  const handleBuscarSierra = async () => {
    if (!codigoSierra) return;
    
    const codigoNormalizado = normalizarCodigo(codigoSierra);
    if (!codigoNormalizado) return;
    
    setLoading(true);
    setError(null);
    setSuccess('');
    
    try {
      // Estrategia de búsqueda mejorada
      let sierraResponse;
      let sierra = null;
      
      // 1. Intentar búsqueda directa con el código normalizado
      sierraResponse = await sierraService.searchSierraByCodigo(codigoNormalizado);
      
      // 2. Si no se encuentra, intentar con el código original
      if (!sierraResponse.success) {
        sierraResponse = await sierraService.searchSierraByCodigo(codigoSierra);
      }
      
      // 3. Si aún no hay éxito, intentar búsqueda alternativa
      if (!sierraResponse.success) {
        try {
          // Esta opción requiere implementar getAllSierras en sierraService
          const allSierrasResponse = await sierraService.getAllSierras();
          
          if (allSierrasResponse.success) {
            // Buscar una sierra cuyo código normalizado coincida
            const sierraEncontrada = allSierrasResponse.data.find(s => {
              const sierraCodigo = s.codigo_barra || s.codigo;
              return normalizarCodigo(sierraCodigo) === codigoNormalizado;
            });
            
            if (sierraEncontrada) {
              sierra = sierraEncontrada;
              console.log("Sierra encontrada usando coincidencia alternativa:", sierraEncontrada);
            }
          }
        } catch (err) {
          console.error("Error en búsqueda alternativa:", err);
        }
      } else {
        sierra = sierraResponse.data;
      }
      
      if (!sierra) {
        setError(`Sierra no encontrada: ${codigoSierra}`);
        setCodigoSierra('');
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      
      // Buscar afilados pendientes para esta sierra
      const afiladosResponse = await afiladoService.getAfiladosBySierra(sierra.id);
      
      if (!afiladosResponse.success) {
        setError(`Error al buscar afilados para la sierra: ${codigoSierra}`);
        setCodigoSierra('');
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      
      // Filtrar solo los afilados pendientes (sin fecha_salida)
      const pendientes = afiladosResponse.data.filter(a => !a.fecha_salida);
      
      if (pendientes.length === 0) {
        setError(`La sierra ${codigoSierra} no tiene afilados pendientes de salida`);
        setCodigoSierra('');
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      
      // Verificar si esta sierra ya ha sido escaneada
      const yaEscaneada = sierrasEscaneadas.some(s => s.sierra_id === sierra.id);
      
      if (yaEscaneada) {
        setError(`La sierra ${codigoSierra} ya ha sido escaneada`);
        setCodigoSierra('');
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      
      // Añadir el afilado pendiente a la lista
      const nuevoAfilado = {
        ...pendientes[0],
        sierra_id: sierra.id,
        sierra_codigo: sierra.codigo_barra || sierra.codigo,
        sierra_tipo: sierra.tipos_sierra?.nombre || 'No especificado',
        cliente_nombre: clientesMap[sierra.sucursales?.cliente_id] || 'Cliente no especificado',
        sucursal_nombre: sierra.sucursales?.nombre || 'Sucursal no especificada'
      };
      
      setSierrasEscaneadas([...sierrasEscaneadas, nuevoAfilado]);
      setSuccess(`Sierra ${codigoSierra} añadida correctamente`);
      setCodigoSierra('');
      
      // Auto-enfocar el input para el siguiente escaneo
      if (inputRef.current) inputRef.current.focus();
      
    } catch (error) {
      console.error('Error al buscar sierra:', error);
      setError(`Error al procesar la sierra: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar tecla Enter en el campo de código
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBuscarSierra();
    }
  };

  // Eliminar una sierra de la lista de escaneadas
  const handleRemoveSierra = (id) => {
    setSierrasEscaneadas(sierrasEscaneadas.filter(afilado => afilado.id !== id));
  };

  // Confirmar registro masivo
  const handleConfirmRegistroMasivo = () => {
    if (sierrasEscaneadas.length === 0) {
      setError('No hay sierras escaneadas para registrar salida');
      return;
    }
    
    setConfirmDialogOpen(true);
  };

  // Procesar registro masivo
  const handleRegistroMasivo = async () => {
    setConfirmDialogOpen(false);
    setProcessingAll(true);
    setError(null);
    
    try {
      // Endpoint que vamos a usar: procesar todas las sierras en un solo request (más eficiente)
      const afiladoIds = sierrasEscaneadas.map(afilado => afilado.id);
      
      // Este endpoint debería ser implementado en tu backend
      const response = await afiladoService.registrarSalidaMasiva(afiladoIds);
      
      if (response.success) {
        setSuccess(`Se registró la salida de ${afiladoIds.length} sierra(s) correctamente`);
        setSierrasEscaneadas([]);
      } else {
        setError(`Error al registrar salidas: ${response.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al registrar salidas:', error);
      setError(`Error al procesar el registro masivo: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcessingAll(false);
    }
  };

  // Limpiar lista de escaneadas
  const handleClearList = () => {
    if (window.confirm('¿Está seguro de que desea limpiar la lista?')) {
      setSierrasEscaneadas([]);
    }
  };

  // Limpiar campo de código
  const handleLimpiarCodigo = () => {
    setCodigoSierra('');
    if (inputRef.current) {
      inputRef.current.focus();
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
        <Typography color="text.primary">Registro Masivo de Salidas</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Registro Masivo de Salidas
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

      {/* Sección de escaneo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Escanear Sierra
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              onClose={() => setSuccess('')}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setSuccess('')}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {success}
            </Alert>
          )}
          
          <Box display="flex" alignItems="center">
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
              disabled={loading || processingAll}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleBuscarSierra}
              disabled={!codigoSierra || loading || processingAll}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Buscar
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Escanee o ingrese el código de las sierras que desea registrar como entregadas. Para cada sierra escaneada, 
            se buscará su afilado pendiente y se añadirá a la lista.
          </Typography>
        </CardContent>
      </Card>

      {/* Lista de sierras escaneadas */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Sierras para Registrar Salida 
            <Chip 
              label={sierrasEscaneadas.length} 
              color={sierrasEscaneadas.length > 0 ? "primary" : "default"}
              size="small" 
              sx={{ ml: 1 }}
            />
          </Typography>
          <Box>
            <Button 
              color="error" 
              onClick={handleClearList}
              disabled={sierrasEscaneadas.length === 0 || processingAll}
              startIcon={<DeleteIcon />}
              sx={{ mr: 1 }}
            >
              Limpiar Lista
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleConfirmRegistroMasivo}
              disabled={sierrasEscaneadas.length === 0 || processingAll}
              startIcon={processingAll ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            >
              Registrar Salida
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Sierra</TableCell>
                <TableCell>Tipo de Sierra</TableCell>
                <TableCell>Cliente / Sucursal</TableCell>
                <TableCell>Tipo de Afilado</TableCell>
                <TableCell>Fecha de Afilado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sierrasEscaneadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay sierras escaneadas. Escanee códigos de sierra para añadirlas a la lista.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sierrasEscaneadas.map((afilado) => (
                  <TableRow key={afilado.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <SierraIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography fontWeight="medium">
                          {afilado.sierra_codigo}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{afilado.sierra_tipo}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {afilado.cliente_nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {afilado.sucursal_nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>{afilado.tipos_afilado?.nombre || 'No especificado'}</TableCell>
                    <TableCell>
                      {new Date(afilado.fecha_afilado).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveSierra(afilado.id)}
                        disabled={processingAll}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {sierrasEscaneadas.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              Total: <strong>{sierrasEscaneadas.length}</strong> sierra(s)
            </Typography>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleConfirmRegistroMasivo}
              disabled={processingAll}
              startIcon={processingAll ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            >
              Registrar Salida de Todas
            </Button>
          </Box>
        )}
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Registro Masivo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Está a punto de registrar la salida de <strong>{sierrasEscaneadas.length}</strong> sierra(s). 
            Esta acción marcará todos los afilados seleccionados como entregados y no se puede deshacer.
            ¿Está seguro de continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleRegistroMasivo} 
            variant="contained" 
            color="success" 
            autoFocus
          >
            Confirmar Registro
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistroSalidaMasiva;