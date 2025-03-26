// src/pages/clientes/ClienteDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Chip,
  Breadcrumbs,
  Link,
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
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  InfoOutlined as InfoIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Shortcut as ShortcutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';
import sierraService from '../../services/sierraService';
import afiladoService from '../../services/afiladoService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para mostrar un panel de información en una tab
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cliente-tabpanel-${index}`}
      aria-labelledby={`cliente-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [cliente, setCliente] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [sierras, setSierras] = useState([]);
  const [afilados, setAfilados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAfilados, setLoadingAfilados] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Paginación para sierras
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Paginación para afilados
  const [afiladoPage, setAfiladoPage] = useState(0);
  const [afiladoRowsPerPage, setAfiladoRowsPerPage] = useState(5);
  
  // Estado para manejar si el usuario puede editar clientes
  const canManageClientes = user?.rol === 'Gerente' || user?.rol === 'Administrador';

  useEffect(() => {
    const loadClienteData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar cliente
        const clienteResponse = await clienteService.getClienteById(id);
        if (!clienteResponse.success) {
          throw new Error(clienteResponse.error);
        }
        setCliente(clienteResponse.data);
        
        // Cargar sucursales
        const sucursalesResponse = await sucursalService.getSucursalesByCliente(id);
        if (sucursalesResponse.success) {
          setSucursales(sucursalesResponse.data);
        }
        
        // Cargar sierras
        const sierrasResponse = await sierraService.getSierrasByCliente(id);
        if (sierrasResponse.success) {
          setSierras(sierrasResponse.data);
        }
      } catch (err) {
        console.error('Error al cargar datos del cliente:', err);
        setError('Error al cargar la información del cliente. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadClienteData();
  }, [id]);

  // Cargar afilados cuando se cambia a la pestaña de afilados
  useEffect(() => {
    const loadAfilados = async () => {
      if (tabValue === 2 && afilados.length === 0) {
        setLoadingAfilados(true);
        try {
          const afiladosResponse = await afiladoService.getAfiladosByCliente(id);
          if (afiladosResponse.success) {
            setAfilados(afiladosResponse.data);
          }
        } catch (err) {
          console.error('Error al cargar afilados:', err);
        } finally {
          setLoadingAfilados(false);
        }
      }
    };
    
    loadAfilados();
  }, [tabValue, id, afilados.length]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setLoading(true);
    
    try {
      const response = await clienteService.deleteCliente(id);
      if (response.success) {
        navigate('/clientes', { 
          state: { 
            message: 'Cliente eliminado correctamente',
            severity: 'success'
          } 
        });
      } else {
        setError(response.error || 'Error al eliminar el cliente');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      setError('Error al eliminar el cliente. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  // Funciones para manejar la paginación de sierras
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Funciones para manejar la paginación de afilados
  const handleChangeAfiladoPage = (event, newPage) => {
    setAfiladoPage(newPage);
  };

  const handleChangeAfiladoRowsPerPage = (event) => {
    setAfiladoRowsPerPage(parseInt(event.target.value, 10));
    setAfiladoPage(0);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Determinar color de estado para afilados
  const getAfiladoStatusColor = (afilado) => {
    if (!afilado.fecha_salida) {
      return 'warning';
    }
    return 'success';
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

  if (!cliente) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Cliente no encontrado
      </Alert>
    );
  }

  return (
    <Box>
      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/clientes" underline="hover" color="inherit">
          Clientes
        </Link>
        <Typography color="text.primary">{cliente.razon_social}</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clientes')}
        >
          Volver a Clientes
        </Button>
        
        {canManageClientes && (
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clientes/${id}/editar`)}
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
          </Box>
        )}
      </Box>

      {/* Información principal del cliente */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={1}>
              <Box 
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={11}>
              <Typography variant="h4" component="h1" gutterBottom>
                {cliente.razon_social}
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                RUT: {cliente.rut}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  icon={<PhoneIcon />} 
                  label={cliente.telefono} 
                  variant="outlined" 
                  component="a"
                  href={`tel:${cliente.telefono}`}
                  clickable
                />
                <Chip 
                  icon={<EmailIcon />} 
                  label={cliente.email} 
                  variant="outlined" 
                  component="a" 
                  href={`mailto:${cliente.email}`}
                  clickable
                />
                <Chip 
                  icon={<LocationIcon />} 
                  label={cliente.direccion} 
                  variant="outlined" 
                  component="a"
                  href={`https://maps.google.com/?q=${encodeURIComponent(cliente.direccion)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                />
                <Chip 
                  icon={<SucursalIcon />} 
                  label={`${sucursales.length} Sucursales`} 
                  color="primary" 
                  variant="outlined" 
                  onClick={() => setTabValue(0)}
                />
                <Chip 
                  icon={<SierraIcon />} 
                  label={`${sierras.length} Sierras`} 
                  color="secondary" 
                  variant="outlined" 
                  onClick={() => setTabValue(1)}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Pestañas de información */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="tabs de cliente"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Sucursales" id="cliente-tab-0" />
          <Tab label="Sierras" id="cliente-tab-1" />
          <Tab label="Historial de Afilados" id="cliente-tab-2" />
        </Tabs>
      </Box>

      {/* Contenido de pestañas */}
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Sucursales del Cliente</Typography>
          {canManageClientes && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/sucursales/nueva', { 
                state: { clienteId: cliente.id, clienteNombre: cliente.razon_social } 
              })}
            >
              Nueva Sucursal
            </Button>
          )}
        </Box>

        {sucursales.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Este cliente no tiene sucursales registradas.
            </Typography>
            {canManageClientes && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/sucursales/nueva', { 
                  state: { clienteId: cliente.id, clienteNombre: cliente.razon_social } 
                })}
                sx={{ mt: 2 }}
              >
                Agregar Sucursal
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {sucursales.map((sucursal) => (
              <Grid item xs={12} md={6} key={sucursal.id}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                  }
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" mb={1}>
                      <Box 
                        sx={{
                          bgcolor: 'secondary.light',
                          color: 'white',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <SucursalIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{sucursal.nombre}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          <LocationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {sucursal.direccion}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {sucursal.telefono}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={`${sierras.filter(s => s.sucursal_id === sucursal.id).length} Sierras`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/sucursales/${sucursal.id}`)}
                      >
                        Ver Detalle
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Sierras del Cliente</Typography>
          {canManageClientes && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/sierras/nueva', { 
                state: { clienteId: cliente.id, clienteNombre: cliente.razon_social } 
              })}
            >
              Nueva Sierra
            </Button>
          )}
        </Box>

        {sierras.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Este cliente no tiene sierras registradas.
            </Typography>
            {canManageClientes && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/sierras/nueva', { 
                  state: { clienteId: cliente.id, clienteNombre: cliente.razon_social } 
                })}
                sx={{ mt: 2 }}
              >
                Registrar Sierra
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de sierras">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Fecha Registro</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sierras
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((sierra) => (
                    <TableRow
                      key={sierra.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center">
                          <SierraIcon color="secondary" sx={{ mr: 1 }} />
                          <Typography fontWeight="medium">
                            {sierra.codigo_barra}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{sierra.tipos_sierra?.nombre || 'No especificado'}</TableCell>
                      <TableCell>{sierra.estados_sierra?.nombre || 'No especificado'}</TableCell>
                      <TableCell>{sierra.sucursales?.nombre || 'No especificada'}</TableCell>
                      <TableCell>{formatDate(sierra.fecha_registro)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sierra.activo ? 'Activa' : 'Inactiva'} 
                          color={sierra.activo ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver Detalle">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/sierras/${sierra.id}`)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Registrar Afilado">
                          <IconButton
                            color="secondary"
                            onClick={() => navigate('/afilados/nuevo', {
                              state: { sierraId: sierra.id, sierraCodigo: sierra.codigo_barra }
                            })}
                          >
                            <BuildIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Historial de Afilados">
                          <IconButton
                            color="info"
                            onClick={() => navigate(`/afilados?sierra=${sierra.id}`)}
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                {sierras.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay sierras registradas para este cliente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sierras.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Historial de Afilados</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => navigate(`/reportes/afilados-cliente/${id}`)}
          >
            Generar Reporte
          </Button>
        </Box>

        {loadingAfilados ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : afilados.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Este cliente no tiene afilados registrados.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de afilados">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha Afilado</TableCell>
                  <TableCell>Sierra</TableCell>
                  <TableCell>Tipo Afilado</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Fecha Salida</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {afilados
                  .slice(afiladoPage * afiladoRowsPerPage, afiladoPage * afiladoRowsPerPage + afiladoRowsPerPage)
                  .map((afilado) => (
                    <TableRow
                      key={afilado.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{formatDate(afilado.fecha_afilado)}</TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {afilado.sierras?.codigo || 'No especificada'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {afilado.sierras?.tipos_sierra?.nombre || 'Tipo no especificado'}
                        </Typography>
                      </TableCell>
                      <TableCell>{afilado.tipos_afilado?.nombre || 'No especificado'}</TableCell>
                      <TableCell>{afilado.sierras?.sucursales?.nombre || 'No especificada'}</TableCell>
                      <TableCell>{afilado.usuarios?.nombre || 'No especificado'}</TableCell>
                      <TableCell>{afilado.fecha_salida ? formatDate(afilado.fecha_salida) : 'Pendiente'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={afilado.fecha_salida ? 'Completado' : 'Pendiente'} 
                          color={getAfiladoStatusColor(afilado)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver Detalle">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/afilados/${afilado.id}`)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                {afilados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No hay afilados registrados para este cliente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={afilados.length}
              rowsPerPage={afiladoRowsPerPage}
              page={afiladoPage}
              onPageChange={handleChangeAfiladoPage}
              onRowsPerPageChange={handleChangeAfiladoRowsPerPage}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>
        )}
      </TabPanel>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Eliminar cliente?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar el cliente "{cliente.razon_social}"? Esta acción no se puede deshacer y eliminará todos los datos asociados (sucursales, sierras, etc.).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClienteDetail;