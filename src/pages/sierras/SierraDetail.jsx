// src/pages/sierras/SierraDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Avatar,
  useTheme
} from '@mui/material';
import {
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon,
  Visibility as ViewIcon,
  Timeline as TimelineIcon,
  Print as PrintIcon,
  Block as BlockIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import sierraService from '../../services/sierraService';
import afiladoService from '../../services/afiladoService';
import clienteService from '../../services/clienteService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SierraDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [sierra, setSierra] = useState(null);
  const [afilados, setAfilados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(!!location.state?.message);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [clientes, setClientes] = useState([]);
  
  // Estados para paginación de afilados
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Determinar si el usuario actual puede gestionar esta sierra
  const canManageSierra = user?.rol === 'Gerente' || user?.rol === 'Administrador';

  useEffect(() => {
    const loadSierraData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar la lista de clientes
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
        }
        
        // Obtener datos de la sierra usando el nuevo endpoint
        const response = await sierraService.getSierraById(id);
        
        if (response.success) {
          setSierra(response.data);
          
          // Si la sierra tiene afilados incluidos en la respuesta, usarlos
          if (response.data.afilados && Array.isArray(response.data.afilados)) {
            setAfilados(response.data.afilados);
          } else {
            // Si no, obtener los afilados por separado
            const afiladosResponse = await afiladoService.getAfiladosBySierra(response.data.id);
            if (afiladosResponse.success) {
              setAfilados(afiladosResponse.data);
            }
          }
        } else {
          setError(response.error || 'Error al cargar la información de la sierra');
        }
      } catch (err) {
        console.error('Error al cargar datos de la sierra:', err);
        setError('Error al cargar la información de la sierra. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

  
    loadSierraData();
    
    // Limpiar el mensaje de éxito después de unos segundos
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [id, showSuccessMessage]);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Función para manejar la eliminación
  const handleDelete = async () => {
    setConfirmDelete(false);
    setLoading(true);
    
    try {
      // En un caso real, llamarías al servicio para eliminar
      alert(`Eliminación simulada de la sierra ${sierra.codigo_barra}`);
      navigate('/sierras', { 
        state: { 
          message: 'Sierra eliminada correctamente',
          severity: 'success'
        } 
      });
    } catch (err) {
      console.error('Error al eliminar sierra:', err);
      setError('Error al eliminar la sierra. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  // Funciones para paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para imprimir código QR
  const handlePrintQR = () => {
    // Esta función abriría una ventana para imprimir el código QR
    alert('Funcionalidad de impresión de código QR no implementada');
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
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/sierras')}
        >
          Volver a Sierras
        </Button>
      </Box>
    );
  }

  if (!sierra) {
    return (
      <Box mt={3}>
        <Alert severity="info">Sierra no encontrada</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 2 }}
          onClick={() => navigate('/sierras')}
        >
          Volver a Sierras
        </Button>
      </Box>
    );
  }

  // Último afilado realizado
  const ultimoAfilado = afilados.length > 0 
    ? afilados.sort((a, b) => new Date(b.fecha_afilado) - new Date(a.fecha_afilado))[0] 
    : null;

  // Afilados pendientes (sin fecha de salida)
  const afiladosPendientes = afilados.filter(a => !a.fecha_salida);

  const getClienteNombre = () => {
    // Primero intentar obtener desde el objeto anidado completo
    if (sierra.sucursales?.clientes?.razon_social) {
      return sierra.sucursales.clientes.razon_social;
    }
    
    // Si no hay información completa pero tenemos el ID del cliente
    if (sierra.sucursales?.cliente_id) {
      return `Cliente ID: ${sierra.sucursales.cliente_id}`;
    }
    
    return 'No especificado';
  };


  return (
    <Box>
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setShowSuccessMessage(false)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={RouterLink} to="/sierras" underline="hover" color="inherit">
          Sierras
        </MuiLink>
        <Typography color="text.primary">{sierra.codigo_barra || sierra.codigo}</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Detalle de Sierra
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/sierras')}
            sx={{ mr: 1 }}
          >
            Volver a Sierras
          </Button>
          
          {canManageSierra && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/sierras/${id}/editar`)}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
              >
                Eliminar
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Información principal de la sierra */}
      <Grid container spacing={3}>
        {/* Card principal con datos */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                backgroundColor: 'primary.main', 
                color: 'primary.contrastText' 
              }}
            >
              <SierraIcon fontSize="large" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Información de la Sierra
              </Typography>
            </Box>
            
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Identificación
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <QrCodeIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="medium">
                        {sierra.codigo_barra || sierra.codigo}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Tipo: {sierra.tipos_sierra?.nombre || 'No especificado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estado: {sierra.estados_sierra?.nombre || 'No especificado'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={sierra.activo ? 'Activa' : 'Inactiva'} 
                        color={sierra.activo ? 'success' : 'error'} 
                        size="small" 
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
                          {sierra.sucursales?.clientes?.razon_social || 
                          (sierra.sucursales?.cliente_id ? `Cliente ID: ${sierra.sucursales.cliente_id}` : 'No especificado')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <SucursalIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'text-bottom' }} />
                          {getClienteNombre()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Registrada: {formatDate(sierra.fecha_registro)}
                    </Typography>
                    
                    {ultimoAfilado && (
                      <Typography variant="body2" color="text.secondary">
                        Último afilado: {formatDate(ultimoAfilado.fecha_afilado)}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Especificaciones Técnicas
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {sierra.ancho && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Ancho:
                          </Typography>
                          <Typography variant="body1">
                            {sierra.ancho} mm
                          </Typography>
                        </Grid>
                      )}
                      
                      {sierra.largo && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Largo:
                          </Typography>
                          <Typography variant="body1">
                            {sierra.largo} mm
                          </Typography>
                        </Grid>
                      )}
                      
                      {sierra.alto && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Alto:
                          </Typography>
                          <Typography variant="body1">
                            {sierra.alto} mm
                          </Typography>
                        </Grid>
                      )}
                      
                      {sierra.material && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Material:
                          </Typography>
                          <Typography variant="body1">
                            {sierra.material}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    
                    {sierra.observaciones && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Observaciones:
                        </Typography>
                        <Typography variant="body1">
                          {sierra.observaciones}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tarjeta de estado y acciones */}
        <Grid item xs={12} md={4}>
          {/* Estadísticas */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'primary.lighter',
                      borderLeft: 3,
                      borderColor: 'primary.main'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">Total Afilados</Typography>
                    <Typography variant="h4" color="primary">
                      {afilados.length}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'warning.lighter',
                      borderLeft: 3,
                      borderColor: 'warning.main'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">Pendientes</Typography>
                    <Typography variant="h4" color="warning.dark">
                      {afiladosPendientes.length}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {afilados.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<TimelineIcon />}
                    onClick={() => navigate(`/reportes/historial-sierras?sierra=${sierra.id}`)}
                    fullWidth
                  >
                    Ver Historial Completo
                  </Button>
                </Box>
              )}
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
                    variant="contained"
                    color="primary"
                    startIcon={<AfiladoIcon />}
                    onClick={() => navigate('/afilados/nuevo', {
                      state: { sierraId: sierra.id, sierraCodigo: sierra.codigo_barra || sierra.codigo }
                    })}
                    disabled={!sierra.activo}
                  >
                    Registrar Afilado
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<QrCodeIcon />}
                    onClick={handlePrintQR}
                  >
                    Imprimir Código QR
                  </Button>
                </Grid>

                {canManageSierra && (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={sierra.activo ? <BlockIcon/> : <CheckIcon />}
                      onClick={() => alert('Cambiar estado no implementado')}
                    >
                      {sierra.activo ? 'Desactivar Sierra' : 'Activar Sierra'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Historial de afilados */}
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
                  Historial de Afilados
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                size="small"
                sx={{ backgroundColor: 'secondary.dark' }}
                onClick={() => navigate(`/afilados?sierra=${sierra.id}`)}
              >
                Ver Todo
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo Afilado</TableCell>
                    <TableCell>Fecha Afilado</TableCell>
                    <TableCell>Fecha Salida</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Responsable</TableCell>
                    <TableCell>Observaciones</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {afilados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay historial de afilados para esta sierra
                      </TableCell>
                    </TableRow>
                  ) : (
                    afilados
                      .sort((a, b) => new Date(b.fecha_afilado) - new Date(a.fecha_afilado))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((afilado) => (
                        <TableRow key={afilado.id}>
                          <TableCell>
                            {afilado.tipo_afilado?.nombre || 'No especificado'}
                          </TableCell>
                          <TableCell>
                            {formatDate(afilado.fecha_afilado)}
                          </TableCell>
                          <TableCell>
                            {afilado.fecha_salida ? formatDate(afilado.fecha_salida) : 'Pendiente'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={afilado.fecha_salida ? 'Completado' : 'Pendiente'} 
                              color={afilado.fecha_salida ? 'success' : 'warning'} 
                              size="small" 
                              variant={afilado.fecha_salida ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>
                            {afilado.usuarios?.nombre || 'No especificado'}
                          </TableCell>
                          <TableCell>
                            {afilado.observaciones ? (
                              <Tooltip title={afilado.observaciones}>
                                <Typography 
                                  variant="body2" 
                                  noWrap 
                                  sx={{ maxWidth: 150, cursor: 'pointer' }}
                                >
                                  {afilado.observaciones}
                                </Typography>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Ver Detalle">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/afilados/${afilado.id}`)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              
              {afilados.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={afilados.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              )}
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ¿Eliminar sierra?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar la sierra "{sierra.codigo_barra || sierra.codigo}"? Esta acción no se puede deshacer y eliminará todos los datos asociados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SierraDetail;