// src/pages/afilados/AfiladoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  Person as PersonIcon,
  CheckCircleOutline as CompletedIcon,
  Warning as PendingIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import afiladoService from '../../services/afiladoService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AfiladoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [afilado, setAfilado] = useState(null);
  const [historialSierra, setHistorialSierra] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [error, setError] = useState(null);
  const [confirmSalida, setConfirmSalida] = useState(false);
  
  // Estado para manejar si el usuario puede editar afilados
  const canManageAfilados = user?.rol === 'Gerente' || user?.rol === 'Administrador';

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Función para cargar los datos del afilado
  const loadAfiladoData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // En un caso real, tendrías un endpoint para obtener el detalle de un afilado
      // Simulamos obteniendo los afilados de la sierra y filtrando
      const sierraId = "1"; // Esto lo obtendrías del afilado una vez lo tengas
      const response = await afiladoService.getAfiladosBySierra(sierraId);
      
      if (response.success) {
        // Filtrar el afilado específico por ID
        const afiladoEncontrado = response.data.find(a => a.id === parseInt(id));
        if (afiladoEncontrado) {
          setAfilado(afiladoEncontrado);
          
          // Obtener historial de la sierra
          // Normalmente sería otra llamada API, pero aquí simulamos
          setHistorialSierra(response.data.filter(a => a.id !== parseInt(id)).slice(0, 5));
        } else {
          setError('Afilado no encontrado');
        }
      } else {
        setError('Error al cargar la información del afilado');
      }
    } catch (err) {
      console.error('Error al cargar datos del afilado:', err);
      setError('Error al cargar la información. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAfiladoData();
    
    // Verificar si hay un mensaje en la navegación
    if (location.state?.message) {
      // Aquí podrías mostrar un snackbar o alerta temporal
      // Para este ejemplo, no hacemos nada ya que la UI principal se ocupa de esto
    }
  }, [id, location]);

  // Función para registrar la salida del afilado
  const handleRegistrarSalida = async () => {
    setLoadingAccion(true);
    try {
      const response = await afiladoService.registrarSalida(id);
      if (response.success) {
        loadAfiladoData(); // Recargar los datos
        setConfirmSalida(false);
      } else {
        alert('Error al registrar la salida');
      }
    } catch (err) {
      console.error('Error al registrar salida:', err);
      alert('Error al registrar la salida. Por favor, inténtelo de nuevo.');
    } finally {
      setLoadingAccion(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!afilado) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Afilado no encontrado
      </Alert>
    );
  }

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
        <Typography color="text.primary">Detalle de Afilado</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Detalle de Afilado
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/afilados')}
            sx={{ mr: 1 }}
          >
            Volver a Afilados
          </Button>
          
          {!afilado.fecha_salida && canManageAfilados && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CompletedIcon />}
              onClick={() => setConfirmSalida(true)}
            >
              Registrar Salida
            </Button>
          )}
        </Box>
      </Box>

      {/* Información del afilado */}
      <Grid container spacing={3}>
        {/* Tarjeta principal de información */}
        <Grid item xs={12} lg={8}>
          <Card>
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                backgroundColor: 'primary.main', 
                color: 'primary.contrastText' 
              }}
            >
              <AfiladoIcon fontSize="large" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Información del Afilado
              </Typography>
            </Box>
            
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Sierra
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <SierraIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        {afilado.sierras?.codigo || 'No especificada'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Tipo: {afilado.sierras?.tipos_sierra?.nombre || 'No especificado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estado: {afilado.sierras?.estados_sierra?.nombre || 'No especificado'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tipo de Afilado
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <AfiladoIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        {afilado.tipos_afilado?.nombre || 'No especificado'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                      <Chip 
                        label={afilado.ultimo_afilado ? 'Último afilado' : 'Afilado regular'} 
                        color={afilado.ultimo_afilado ? 'warning' : 'default'} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Cliente y Sucursal
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <BusinessIcon color="info" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {afilado.sierras?.sucursales?.clientes?.razon_social || 'No especificado'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <SucursalIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
                          {afilado.sierras?.sucursales?.nombre || 'No especificada'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Responsable
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <PersonIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {afilado.usuarios?.nombre || 'No especificado'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fecha de Afilado
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <CalendarIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {formatDate(afilado.fecha_afilado)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fecha de Salida
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <CalendarIcon color="action" sx={{ mr: 1 }} />
                    {afilado.fecha_salida ? (
                      <Typography variant="body1">
                        {formatDate(afilado.fecha_salida)}
                      </Typography>
                    ) : (
                      <Chip 
                        label="Pendiente" 
                        color="warning" 
                        size="small" 
                        icon={<PendingIcon />}
                      />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      backgroundColor: 'background.default', 
                      p: 2, 
                      borderRadius: 1, 
                      mt: 2 
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      <DescriptionIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                      Observaciones
                    </Typography>
                    <Typography variant="body1">
                      {afilado.observaciones || 'No hay observaciones registradas.'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tarjeta de estado y acciones */}
        <Grid item xs={12} lg={4}>
          {/* Estado del afilado */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Afilado
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 3,
                  backgroundColor: afilado.fecha_salida ? 'success.lighter' : 'warning.lighter',
                  borderRadius: 2,
                  color: afilado.fecha_salida ? 'success.dark' : 'warning.dark'
                }}
              >
                {afilado.fecha_salida ? (
                  <CompletedIcon sx={{ fontSize: 60, mb: 1 }} />
                ) : (
                  <PendingIcon sx={{ fontSize: 60, mb: 1 }} />
                )}
                <Typography variant="h5" fontWeight="bold">
                  {afilado.fecha_salida ? 'COMPLETADO' : 'PENDIENTE'}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {afilado.fecha_salida 
                    ? `Entregado el ${formatDate(afilado.fecha_salida)}` 
                    : 'Este afilado aún no ha sido entregado'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          {/* Acciones */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate(`/afilados?sierra=${afilado.sierra_id}`)}
                  >
                    Ver Historial Sierra
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<PrintIcon />}
                    onClick={() => alert('Funcionalidad de impresión no implementada')}
                  >
                    Imprimir Comprobante
                  </Button>
                </Grid>
                {canManageAfilados && !afilado.fecha_salida && (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<CompletedIcon />}
                      onClick={() => setConfirmSalida(true)}
                    >
                      Registrar Salida
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Historial de afilados de la sierra */}
        <Grid item xs={12}>
          <Card>
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'secondary.main', 
                color: 'secondary.contrastText' 
              }}
            >
              <Box display="flex" alignItems="center">
                <HistoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Historial de Afilados de esta Sierra
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                size="small"
                sx={{ backgroundColor: 'secondary.dark' }}
                onClick={() => navigate(`/afilados?sierra=${afilado.sierra_id}`)}
              >
                Ver Todo
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {historialSierra.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay historial de afilados para esta sierra
                      </TableCell>
                    </TableRow>
                  ) : (
                    historialSierra.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.tipos_afilado?.nombre || 'No especificado'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(item.fecha_afilado)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.fecha_salida ? 'Completado' : 'Pendiente'} 
                            color={item.fecha_salida ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver Detalle">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/afilados/${item.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para registrar salida */}
      <Dialog
        open={confirmSalida}
        onClose={() => setConfirmSalida(false)}
      >
        <DialogTitle>Confirmar Salida de Afilado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea registrar la salida de este afilado? Esta acción indica que el afilado ha sido entregado al cliente y no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSalida(false)}>Cancelar</Button>
          <Button 
            onClick={handleRegistrarSalida}
            color="success"
            variant="contained"
            disabled={loadingAccion}
            startIcon={loadingAccion ? <CircularProgress size={20} /> : null}
          >
            Confirmar Salida
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default AfiladoDetail;