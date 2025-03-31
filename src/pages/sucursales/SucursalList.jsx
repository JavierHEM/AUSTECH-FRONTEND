// src/pages/sucursales/SucursalList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Breadcrumbs,
  Link as MuiLink,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  Refresh as RefreshIcon,
  Room as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import sucursalService from '../../services/sucursalService';
import clienteService from '../../services/clienteService';
import sierraService from '../../services/sierraService';

const SucursalList = ({ clienteFilter = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sierrasPorSucursal, setSierrasPorSucursal] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilterValue, setClienteFilterValue] = useState('');
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Notificaciones y mensajes de error mejorados
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', o 'success'
  });
  
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    title: '',
    message: '',
    sucursal: null
  });

  // Estado para manejar si el usuario puede agregar/editar sucursales
  const canManageSucursales = user?.rol === 'Gerente' || user?.rol === 'Administrador';
  const clienteParam = searchParams.get('cliente');

  // Función para cerrar el snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  // Función para cargar datos relacionados
  const loadRelatedData = async () => {
    try {
      // Cargar clientes para filtros
      if (!clienteFilter) {
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
        }
      }
      
      // Si hay un cliente seleccionado en la URL, establecerlo como filtro
      if (clienteParam) {
        setClienteFilterValue(clienteParam);
      } else if (clienteFilter && user?.cliente_id) {
        // Si estamos en modo cliente, establecer el filtro al ID del cliente actual
        setClienteFilterValue(user.cliente_id.toString());
      }
    } catch (err) {
      console.error('Error al cargar datos relacionados:', err);
    }
  };

  // Función para cargar sierras por sucursal
  const loadSierrasPorSucursal = async (sucursales) => {
    const sierrasData = {};
    
    try {
      for (const sucursal of sucursales) {
        const response = await sierraService.getSierrasBySucursal(sucursal.id);
        if (response.success) {
          sierrasData[sucursal.id] = response.data.length;
        } else {
          sierrasData[sucursal.id] = 0;
        }
      }
      setSierrasPorSucursal(sierrasData);
    } catch (err) {
      console.error('Error al cargar sierras por sucursal:', err);
    }
  };

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar datos relacionados primero
      await loadRelatedData();
      
      // Cargar sucursales según los parámetros
      let sucursalesResponse;
      
      if (clienteFilter && user?.cliente_id) {
        // Filtrar por el cliente del usuario actual
        sucursalesResponse = await sucursalService.getSucursalesByCliente(user.cliente_id);
      } else if (clienteParam) {
        // Filtrar por cliente específico
        sucursalesResponse = await sucursalService.getSucursalesByCliente(clienteParam);
      } else {
        // Cargar todas las sucursales
        sucursalesResponse = await sucursalService.getAllSucursales();
      }

      if (sucursalesResponse.success) {
        setSucursales(sucursalesResponse.data);
        
        // Cargar sierras para cada sucursal
        await loadSierrasPorSucursal(sucursalesResponse.data);
      } else {
        setError('Error al cargar las sucursales');
      }
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clienteParam, clienteFilter, user]);

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para filtrar sucursales
  const filteredSucursales = sucursales.filter((sucursal) => {
    // Filtrar por término de búsqueda
    const searchFields = [
      sucursal.nombre || '',
      sucursal.direccion || '',
      sucursal.telefono || '',
      sucursal.email || '',
      sucursal.clientes?.razon_social || ''
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    // Filtrar por cliente (siempre se aplica si estamos en modo clienteFilter)
    const matchesCliente = clienteFilter ? true : 
                          (clienteFilterValue === '' || 
                          sucursal.cliente_id === parseInt(clienteFilterValue));
    
    return matchesSearch && matchesCliente;
  });

  // Función para manejar la eliminación de una sucursal
  const handleDeleteSucursal = (sucursal) => {
    setConfirmDelete(sucursal);
  };

  // Confirmar eliminación
  const confirmDeleteSucursal = async () => {
    if (!confirmDelete) return;
    
    setLoading(true);
    
    try {
      const response = await sucursalService.deleteSucursal(confirmDelete.id);
      if (response.success) {
        loadData(); // Recargar los datos
        // Mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: 'Sucursal eliminada correctamente',
          severity: 'success'
        });
      } else {
        // Verificar si el error es por sierras asociadas
        if (response.error && response.error.toLowerCase().includes('sierra')) {
          // Mostrar el diálogo de error mejorado
          setErrorDialog({
            open: true,
            title: 'No se puede eliminar la sucursal',
            message: `La sucursal "${confirmDelete.nombre}" tiene sierras asociadas y no puede ser eliminada. Primero debes transferir o eliminar las sierras vinculadas a esta sucursal.`,
            sucursal: confirmDelete
          });
        } else {
          // Otro tipo de error
          setSnackbar({
            open: true,
            message: response.error || 'Error al eliminar la sucursal',
            severity: 'error'
          });
        }
      }
    } catch (err) {
      console.error('Error al eliminar sucursal:', err);
      setSnackbar({
        open: true,
        message: 'Error al eliminar la sucursal. Por favor, inténtelo de nuevo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // Función para obtener nombre del cliente
  const getClienteName = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.razon_social : 'No especificado';
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        {clienteParam && !clienteFilter && (
          <MuiLink component={Link} to={`/clientes/${clienteParam}`} color="inherit">
            {getClienteName(parseInt(clienteParam))}
          </MuiLink>
        )}
        <Typography color="text.primary">{clienteFilter ? "Mis Sucursales" : "Sucursales"}</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {clienteFilter ? "Mis Sucursales" : "Sucursales"}
          {clienteParam && !clienteFilter && (
            <Typography variant="subtitle1" color="text.secondary">
              Cliente: {getClienteName(parseInt(clienteParam))}
            </Typography>
          )}
          {clienteFilter && user?.cliente_id && clientes.find(c => c.id === user.cliente_id) && (
            <Typography variant="subtitle1" color="text.secondary">
              Cliente: {clientes.find(c => c.id === user.cliente_id)?.razon_social || 'Mi Cliente'}
            </Typography>
          )}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 1 }}
          >
            Actualizar
          </Button>
          
          {/* Botón para crear nueva sucursal (solo para administradores) */}
          {canManageSucursales && !clienteFilter && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/sucursales/nueva')}
            >
              Nueva Sucursal
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={clienteFilter ? 12 : 6}>
              <TextField
                fullWidth
                placeholder="Buscar sucursales..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Filtro de cliente (solo visible si no estamos en modo cliente) */}
            {!clienteFilter && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="cliente-filter-label">Cliente</InputLabel>
                  <Select
                    labelId="cliente-filter-label"
                    value={clienteFilterValue}
                    onChange={(e) => setClienteFilterValue(e.target.value)}
                    label="Cliente"
                  >
                    <MenuItem value="">Todos los clientes</MenuItem>
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.razon_social}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de sucursales */}
      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    {!clienteFilter && <TableCell>Cliente</TableCell>}
                    <TableCell>Dirección</TableCell>
                    <TableCell>Contacto</TableCell>
                    <TableCell>Sierras</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSucursales
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sucursal) => (
                      <TableRow key={sucursal.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SucursalIcon 
                              fontSize="small" 
                              color="primary" 
                              sx={{ mr: 1 }} 
                            />
                            <Typography fontWeight="medium">
                              {sucursal.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        {/* Cliente (solo si no estamos en modo cliente) */}
                        {!clienteFilter && (
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <BusinessIcon 
                                fontSize="small" 
                                color="info" 
                                sx={{ mr: 1 }} 
                              />
                              <Typography>
                                {sucursal.clientes?.razon_social || getClienteName(sucursal.cliente_id) || 'No especificado'}
                              </Typography>
                            </Box>
                          </TableCell>
                        )}
                        
                        <TableCell>
                          {sucursal.direccion ? (
                            <Box display="flex" alignItems="flex-start">
                              <LocationIcon 
                                fontSize="small" 
                                color="action" 
                                sx={{ mr: 1, mt: 0.3 }} 
                              />
                              <Typography variant="body2">
                                {sucursal.direccion}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography color="text.secondary" variant="body2">
                              No especificada
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            {sucursal.telefono && (
                              <Box display="flex" alignItems="center" mb={0.5}>
                                <PhoneIcon 
                                  fontSize="small" 
                                  color="action" 
                                  sx={{ mr: 1, fontSize: '0.9rem' }} 
                                />
                                <Typography variant="body2">
                                  {sucursal.telefono}
                                </Typography>
                              </Box>
                            )}
                            {sucursal.email && (
                              <Box display="flex" alignItems="center">
                                <EmailIcon 
                                  fontSize="small" 
                                  color="action" 
                                  sx={{ mr: 1, fontSize: '0.9rem' }} 
                                />
                                <Typography variant="body2">
                                  {sucursal.email}
                                </Typography>
                              </Box>
                            )}
                            {!sucursal.telefono && !sucursal.email && (
                              <Typography color="text.secondary" variant="body2">
                                Sin contacto registrado
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            icon={<SierraIcon fontSize="small" />}
                            label={sierrasPorSucursal[sucursal.id] || 0}
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                            onClick={() => navigate(clienteFilter ? 
                              `/mis-sierras?sucursal=${sucursal.id}` : 
                              `/sierras?sucursal=${sucursal.id}`)}
                            clickable
                          />
                        </TableCell>
                        
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(clienteFilter ? 
                                `/mis-sucursales/${sucursal.id}` : 
                                `/sucursales/${sucursal.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canManageSucursales && !clienteFilter && (
                            <>
                              <Tooltip title="Editar">
                                <IconButton
                                  color="info"
                                  onClick={() => navigate(`/sucursales/${sucursal.id}/editar`)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Eliminar">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteSucursal(sucursal)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredSucursales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={clienteFilter ? 5 : 6} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="text.secondary">
                          No se encontraron sucursales
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredSucursales.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
              />
            </>
          )}
        </TableContainer>
      </Card>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar la sucursal <strong>{confirmDelete?.nombre}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={confirmDeleteSucursal} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de error mejorado para sucursales con sierras */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({...errorDialog, open: false})}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <ErrorIcon sx={{ mr: 1 }} />
          {errorDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography paragraph>
            {errorDialog.message}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ¿Qué desea hacer?
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SierraIcon />}
                  onClick={() => {
                    setErrorDialog({...errorDialog, open: false});
                    if (errorDialog.sucursal) {
                      navigate(`/sierras?sucursal=${errorDialog.sucursal.id}`);
                    }
                  }}
                >
                  Ver sierras de esta sucursal
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setErrorDialog({...errorDialog, open: false})}
            variant="contained"
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          elevation={6} 
          variant="filled" 
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default SucursalList;