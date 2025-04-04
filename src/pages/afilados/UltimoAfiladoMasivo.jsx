// src/pages/afilados/UltimoAfiladoMasivo.jsx
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
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  BuildCircle as AfiladoIcon,
  Block as BlockIcon,
  Close as CloseIcon,
  ContentCut as SierraIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import sierraService from '../../services/sierraService';
import afiladoService from '../../services/afiladoService';
import clienteService from '../../services/clienteService';
import { useAuth } from '../../context/AuthContext';

const UltimoAfiladoMasivo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [codigoSierra, setCodigoSierra] = useState('');
  const [afiladosSeleccionados, setAfiladosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingAll, setProcessingAll] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [clientesMap, setClientesMap] = useState({});
  const inputRef = useRef(null);

  // Verificar si el usuario es gerente o administrador
  useEffect(() => {
    if (user?.rol !== 'Gerente' && user?.rol !== 'Administrador') {
      navigate('/acceso-denegado');
    }
  }, [user, navigate]);

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

  // Función para normalizar el código de sierra
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
      
      // Buscar afilados para esta sierra
      const afiladosResponse = await afiladoService.getAfiladosBySierra(sierra.id);
      
      if (!afiladosResponse.success) {
        setError(`Error al buscar afilados para la sierra: ${codigoSierra}`);
        setCodigoSierra('');
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      
      // Ordenar afilados por fecha (más reciente primero)
      const afiladosOrdenados = afiladosResponse.data.sort((a, b) => 
        new Date(b.fecha_afilado) - new Date(a.fecha_afilado)
      );
      
      // Filtrar solo los afilados que no están marcados como último afilado
      const afiladosNoMarcados = afiladosOrdenados.filter(a => !a.ultimo_afilado);
      
      if (afiladosNoMarcados.length === 0) {
        setError(`La sierra ${codigoSierra} no tiene afilados disponibles para marcar`);
        setCodigoSierra('');
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      
      // Tomar el afilado más reciente
      const afiladoReciente = afiladosNoMarcados[0];
      
      // Verificar si este afilado ya ha sido seleccionado
      const yaSeleccionado = afiladosSeleccionados.some(a => a.id === afiladoReciente.id);
      
      if (yaSeleccionado) {
        setError(`El afilado de la sierra ${codigoSierra} ya ha sido añadido a la lista`);
        setCodigoSierra('');
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      
      // Añadir información adicional al afilado para mostrar
      const afiladoConDatos = {
        ...afiladoReciente,
        sierra_codigo: sierra.codigo_barra || sierra.codigo,
        sierra_tipo: sierra.tipos_sierra?.nombre || 'No especificado',
        cliente_nombre: clientesMap[sierra.sucursales?.cliente_id] || 'Cliente no especificado',
        sucursal_nombre: sierra.sucursales?.nombre || 'Sucursal no especificada'
      };
      
      // Añadir a la lista de seleccionados
      setAfiladosSeleccionados([...afiladosSeleccionados, afiladoConDatos]);
      setSuccess(`Afilado de sierra ${codigoSierra} añadido correctamente`);
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

  // Eliminar un afilado de la lista de seleccionados
  const handleRemoveAfilado = (id) => {
    setAfiladosSeleccionados(afiladosSeleccionados.filter(afilado => afilado.id !== id));
  };

  // Confirmar cambio masivo de estado
  const handleConfirmarCambioMasivo = () => {
    if (afiladosSeleccionados.length === 0) {
      setError('No hay afilados en la lista para marcar');
      return;
    }
    
    setConfirmDialogOpen(true);
  };

  // Procesar cambio masivo de estado
  const handleCambioMasivo = async () => {
    setConfirmDialogOpen(false);
    setProcessingAll(true);
    setError(null);
    
    try {
      // Obtener IDs de los afilados seleccionados
      const afiladoIds = afiladosSeleccionados.map(afilado => afilado.id);
      
      // Llamar al servicio para actualizar el estado masivamente
      const response = await afiladoService.marcarUltimoAfiladoMasivo(afiladoIds);
      
      if (response.success) {
        setSuccess(`Se marcaron ${afiladoIds.length} afilado(s) como último afilado correctamente`);
        setAfiladosSeleccionados([]);
      } else {
        setError(`Error al actualizar afilados: ${response.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al actualizar afilados:', error);
      setError(`Error al procesar el cambio masivo: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcessingAll(false);
    }
  };

  // Limpiar lista de seleccionados
  const handleClearList = () => {
    if (window.confirm('¿Está seguro de que desea limpiar la lista?')) {
      setAfiladosSeleccionados([]);
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
        <Typography color="text.primary">Marcado Masivo de Último Afilado</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Marcado Masivo de Último Afilado
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

      {/* Sección de advertencia sobre la operación */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Advertencia: Operación Irreversible
        </Typography>
        <Typography variant="body2">
          Marcar un afilado como "último afilado" indica que la sierra ha llegado al final de su vida útil y no podrá recibir más afilados.
          Esta operación es <strong>irreversible</strong> y debería realizarse solo cuando se ha confirmado que la sierra ya no puede ser afilada nuevamente.
        </Typography>
      </Alert>

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
            Escanee o ingrese el código de las sierras. Para cada sierra, se buscará su afilado más reciente 
            que no esté marcado como último afilado. El sistema añadirá estos afilados a la lista para ser 
            marcados masivamente.
          </Typography>
        </CardContent>
      </Card>

      {/* Lista de afilados seleccionados */}
      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Afilados para Marcar como Último Afilado
            <Chip 
              label={afiladosSeleccionados.length} 
              color={afiladosSeleccionados.length > 0 ? "primary" : "default"}
              size="small" 
              sx={{ ml: 1 }}
            />
          </Typography>
          <Box>
            <Button 
              color="error" 
              onClick={handleClearList}
              disabled={afiladosSeleccionados.length === 0 || processingAll}
              startIcon={<DeleteIcon />}
              sx={{ mr: 1 }}
            >
              Limpiar Lista
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleConfirmarCambioMasivo}
              disabled={afiladosSeleccionados.length === 0 || processingAll}
              startIcon={processingAll ? <CircularProgress size={20} color="inherit" /> : <BlockIcon />}
            >
              Marcar como Último Afilado
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
              {afiladosSeleccionados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay afilados seleccionados. Escanee códigos de sierra para añadir sus afilados a la lista.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                afiladosSeleccionados.map((afilado) => (
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
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <AfiladoIcon color="primary" sx={{ mr: 1, fontSize: 'small' }} />
                        {afilado.tipos_afilado?.nombre || 'No especificado'}
                      </Box>
                    </TableCell>
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
                        onClick={() => handleRemoveAfilado(afilado.id)}
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
        
        {afiladosSeleccionados.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              Total: <strong>{afiladosSeleccionados.length}</strong> afilado(s)
            </Typography>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleConfirmarCambioMasivo}
              disabled={processingAll}
              startIcon={processingAll ? <CircularProgress size={20} color="inherit" /> : <BlockIcon />}
            >
              Marcar Todos como Último Afilado
            </Button>
          </Box>
        )}
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Confirmar Cambio a Último Afilado
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography paragraph>
              Está a punto de marcar <strong>{afiladosSeleccionados.length}</strong> afilado(s) como "último afilado". 
            </Typography>
            <Typography paragraph fontWeight="bold" color="error.main">
              Esta acción es IRREVERSIBLE y hará que:
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Las sierras asociadas no podrán recibir nuevos afilados</li>
              <li>Las sierras asociadas se considerarán al final de su vida útil</li>
              <li>No se podrán registrar nuevos afilados para estas sierras</li>
            </Typography>
            <Typography paragraph mt={2}>
              ¿Está completamente seguro de continuar?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleCambioMasivo} 
            variant="contained" 
            color="error" 
            startIcon={<BlockIcon />}
          >
            Confirmar Cambio a Último Afilado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UltimoAfiladoMasivo;