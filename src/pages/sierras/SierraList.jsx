// src/pages/sierras/SierraList.jsx
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
  FormControlLabel,
  Switch, 
  InputLabel,
  Breadcrumbs,
  Link as MuiLink,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Tabs, 
  Tab, 
  Badge 
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCut as SierraIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  QrCode as QrCodeIcon,
  BuildCircle as AfiladoIcon,
  History as HistoryIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import sierraService from '../../services/sierraService';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';
import catalogoService from '../../services/catalogoService';
import afiladoService from '../../services/afiladoService';

const SierraList = ({ clienteFilter = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [sierras, setSierras] = useState([]);
  const [afiladosPorSierra, setAfiladosPorSierra] = useState({});
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [tiposSierra, setTiposSierra] = useState([]);
  const [estadosSierra, setEstadosSierra] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilterValue, setClienteFilterValue] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [tipoSierraFilter, setTipoSierraFilter] = useState('');
  const [estadoSierraFilter, setEstadoSierraFilter] = useState('');
  const [showActivasOnly, setShowActivasOnly] = useState(true);
  
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
    sierra: null
  });

  // Estado para manejar si el usuario puede agregar/editar sierras
  const canManageSierras = user?.rol === 'Gerente' || user?.rol === 'Administrador';
  const sucursalParam = searchParams.get('sucursal');
  const clienteParam = searchParams.get('cliente');

  // Función para cerrar el snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Función para cargar los catálogos
  const loadCatalogos = async () => {
    try {
      // Load sierra types - filter by active status
      const tiposSierraResponse = await catalogoService.getTiposSierra();
      if (tiposSierraResponse.success) {
        // Filter to only include active sierra types
        const activeTiposSierra = tiposSierraResponse.data.filter(tipo => tipo.activo === true);
        setTiposSierra(activeTiposSierra);
      }
  
      // Load sierra states
      const estadosSierraResponse = await catalogoService.getEstadosSierra();
      if (estadosSierraResponse.success) {
        setEstadosSierra(estadosSierraResponse.data);
      }
  
      // Load clients for filters
      const clientesResponse = await clienteService.getAllClientes();
      if (clientesResponse.success) {
        setClientes(clientesResponse.data);
        
        // If a client is selected in the URL, load its branches
        if (clienteParam) {
          loadSucursalesByCliente(clienteParam);
          setClienteFilterValue(clienteParam);
        } else {
          // Load all branches if no client is selected
          const sucursalesResponse = await sucursalService.getAllSucursales();
          if (sucursalesResponse.success) {
            setSucursales(sucursalesResponse.data);
          }
        }
      }
      
      // If there's a branch in the URL, set it as a filter
      if (sucursalParam) {
        setSucursalFilter(sucursalParam);
      }
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };

  // Función para cargar sucursales por cliente
  const loadSucursalesByCliente = async (clienteId) => {
    try {
      const response = await sucursalService.getSucursalesByCliente(clienteId);
      if (response.success) {
        setSucursales(response.data);
      }
    } catch (err) {
      console.error('Error al cargar sucursales por cliente:', err);
    }
  };

  // Función para cargar los afilados de cada sierra
  const loadAfiladosPorSierra = async (sierras) => {
    const afiladosData = {};
    
    try {
      for (const sierra of sierras) {
        const response = await afiladoService.getAfiladosBySierra(sierra.id);
        if (response.success) {
          afiladosData[sierra.id] = {
            total: response.data.length,
            pendientes: response.data.filter(a => !a.fecha_salida).length
          };
        } else {
          afiladosData[sierra.id] = { total: 0, pendientes: 0 };
        }
      }
      setAfiladosPorSierra(afiladosData);
    } catch (err) {
      console.error('Error al cargar afilados por sierra:', err);
    }
  };

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar catálogos primero para tener los datos disponibles
      await loadCatalogos();
      
      // Cargar sierras según los parámetros
      let sierrasResponse;
      
      if (sucursalParam) {
        // Filtrar por sucursal específica
        sierrasResponse = await sierraService.getSierrasBySucursal(sucursalParam);
      } else if (clienteParam) {
        // Filtrar por cliente específico
        sierrasResponse = await sierraService.getSierrasByCliente(clienteParam);
      } else {
        // Cargar todas las sierras
        sierrasResponse = await sierraService.getAllSierras();
      }

      if (sierrasResponse.success) {
        setSierras(sierrasResponse.data);
        
        // Cargar afilados para cada sierra
        await loadAfiladosPorSierra(sierrasResponse.data);
      } else {
        setError('Error al cargar las sierras');
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
  }, [sucursalParam, clienteParam]);

  // Efecto para cargar sucursales cuando cambia el cliente seleccionado
  useEffect(() => {
    if (clienteFilterValue) {
      loadSucursalesByCliente(clienteFilterValue);
    }
  }, [clienteFilterValue]);

  // Función para manejar el cambio de tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Obtener los afilados pendientes de una sierra
  const getAfiladosPendientes = (sierra) => {
    return afiladosPorSierra[sierra.id]?.pendientes || 0;
  };

  // Obtener el total de afilados de una sierra
  const getTotalAfilados = (sierra) => {
    return afiladosPorSierra[sierra.id]?.total || 0;
  };

  // Función para filtrar sierras
  const filteredSierras = sierras.filter((sierra) => {
    // Filtrar por término de búsqueda
    const searchFields = [
      sierra.codigo_barra || '',
      sierra.tipos_sierra?.nombre || '',
      sierra.estados_sierra?.nombre || '',
      sierra.sucursales?.nombre || '',
      sierra.sucursales?.clientes?.razon_social || ''
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    // Filtrar por cliente
    const matchesCliente = clienteFilterValue === '' || 
      sierra.sucursales?.cliente_id === parseInt(clienteFilterValue);
    
    // Filtrar por sucursal
    const matchesSucursal = sucursalFilter === '' || 
      sierra.sucursal_id === parseInt(sucursalFilter);
    
    // Filtrar por tipo de sierra
    const matchesTipoSierra = tipoSierraFilter === '' || 
      sierra.tipo_sierra_id === parseInt(tipoSierraFilter);
    
    // Filtrar por estado de sierra
    const matchesEstadoSierra = estadoSierraFilter === '' || 
      sierra.estado_id === parseInt(estadoSierraFilter);
    
    // Filtrar por activas/inactivas
    const matchesActivo = !showActivasOnly || sierra.activo;
    
    return matchesSearch && matchesCliente && matchesSucursal && 
           matchesTipoSierra && matchesEstadoSierra && matchesActivo;
  });

  // Función para manejar la eliminación de una sierra
  const handleDeleteSierra = (sierra) => {
    setConfirmDelete(sierra);
  };

  // Confirmar eliminación
  const confirmDeleteSierra = async () => {
    if (!confirmDelete) return;
    
    setLoading(true);
    
    try {
      const response = await sierraService.deleteSierra(confirmDelete.id);
      if (response.success) {
        loadData(); // Recargar los datos
        // Mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: 'Sierra eliminada correctamente',
          severity: 'success'
        });
      } else {
        // Verificar si el error es por afilados asociados
        if (response.error && (response.error.toLowerCase().includes('afilado') || response.error.toLowerCase().includes('asociad'))) {
          // Obtener afilados de la sierra para mostrar cantidad
          const afiladosResponse = await afiladoService.getAfiladosBySierra(confirmDelete.id);
          const cantidadAfilados = afiladosResponse.success ? afiladosResponse.data.length : 'varios';
          
          // Mostrar el diálogo de error mejorado
          setErrorDialog({
            open: true,
            title: 'No se puede eliminar la sierra',
            message: `La sierra "${confirmDelete.codigo_barra || confirmDelete.codigo}" tiene ${cantidadAfilados} afilado(s) asociado(s) y no puede ser eliminada. Primero debes transferir o eliminar los afilados vinculados a esta sierra.`,
            sierra: confirmDelete
          });
        } else {
          // Otro tipo de error
          setSnackbar({
            open: true,
            message: response.error || 'Error al eliminar la sierra',
            severity: 'error'
          });
        }
      }
    } catch (err) {
      console.error('Error al eliminar sierra:', err);
      setSnackbar({
        open: true,
        message: 'Error al eliminar la sierra. Por favor, inténtelo de nuevo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        {clienteParam && (
          <MuiLink component={Link} to={`/clientes/${clienteParam}`} color="inherit">
            {clientes.find(c => c.id === parseInt(clienteParam))?.razon_social || 'Cliente'}
          </MuiLink>
        )}
        {sucursalParam && (
          <MuiLink component={Link} to={`/sucursales/${sucursalParam}`} color="inherit">
            {sucursales.find(s => s.id === parseInt(sucursalParam))?.nombre || 'Sucursal'}
          </MuiLink>
        )}
        <Typography color="text.primary">Sierras</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Sierras
          {clienteParam && clientes.find(c => c.id === parseInt(clienteParam)) && (
            <Typography variant="subtitle1" color="text.secondary">
              Cliente: {clientes.find(c => c.id === parseInt(clienteParam)).razon_social}
            </Typography>
          )}
          {sucursalParam && sucursales.find(s => s.id === parseInt(sucursalParam)) && (
            <Typography variant="subtitle1" color="text.secondary">
              Sucursal: {sucursales.find(s => s.id === parseInt(sucursalParam)).nombre}
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
          {canManageSierras && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/sierras/nueva')}
            >
              Nueva Sierra
            </Button>
          )}
        </Box>
      </Box>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="sierras tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todas las Sierras" id="sierra-tab-0" />
          <Tab 
            label={
              <Badge badgeContent={sierras.filter(s => s.activo).length} color="primary">
                Activas
              </Badge>
            } 
            id="sierra-tab-1"
          />
          <Tab 
            label={
              <Badge badgeContent={sierras.filter(s => !s.activo).length} color="error">
                Inactivas
              </Badge>
            } 
            id="sierra-tab-2"
          />
          <Tab 
            label={
              <Badge 
                badgeContent={sierras.filter(s => getAfiladosPendientes(s) > 0).length} 
                color="warning"
              >
                Con Afilados Pendientes
              </Badge>
            } 
            id="sierra-tab-3"
          />
        </Tabs>
      </Box>

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar sierras..."
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

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="cliente-filter-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-filter-label"
                  value={clienteFilterValue}
                  onChange={(e) => {
                    setClienteFilterValue(e.target.value);
                    setSucursalFilter(''); // Resetear sucursal al cambiar cliente
                  }}
                  label="Cliente"
                >
                  <MenuItem value="">Todos los clientes</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {cliente.razon_social}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="sucursal-filter-label">Sucursal</InputLabel>
                <Select
                  labelId="sucursal-filter-label"
                  value={sucursalFilter}
                  onChange={(e) => setSucursalFilter(e.target.value)}
                  label="Sucursal"
                  disabled={!clienteFilterValue}
                >
                  <MenuItem value="">Todas las sucursales</MenuItem>
                  {sucursales
                    .filter(sucursal => !clienteFilterValue || sucursal.cliente_id === parseInt(clienteFilterValue))
                    .map((sucursal) => (
                      <MenuItem key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Type of Sierra Filter */}
            <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
                <InputLabel id="tipo-sierra-filter-label">Tipo de Sierra</InputLabel>
                <Select
                labelId="tipo-sierra-filter-label"
                value={tipoSierraFilter}
                onChange={(e) => setTipoSierraFilter(e.target.value)}
                label="Tipo de Sierra"
                >
                <MenuItem value="">Todos los tipos activos</MenuItem>
                {tiposSierra.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="estado-sierra-filter-label">Estado</InputLabel>
                <Select
                  labelId="estado-sierra-filter-label"
                  value={estadoSierraFilter}
                  onChange={(e) => setEstadoSierraFilter(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  {estadosSierra.map((estado) => (
                    <MenuItem key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showActivasOnly}
                    onChange={(e) => setShowActivasOnly(e.target.checked)}
                  />
                }
                label="Sólo activas"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de sierras */}
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
                    <TableCell>Código</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Cliente / Sucursal</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Registro</TableCell>
                    <TableCell>Afilados</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSierras
                    .filter(sierra => {
                      // Filtrar según la pestaña seleccionada
                      if (tabValue === 1) return sierra.activo;
                      if (tabValue === 2) return !sierra.activo;
                      if (tabValue === 3) return getAfiladosPendientes(sierra) > 0;
                      return true; // Tab 0 = Todas
                    })
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sierra) => (
                      <TableRow 
                        key={sierra.id}
                        sx={sierra.activo ? {} : { opacity: 0.7 }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SierraIcon 
                              fontSize="small" 
                              color={sierra.activo ? "secondary" : "disabled"} 
                              sx={{ mr: 1 }} 
                            />
                            <Typography 
                              fontWeight="medium"
                              sx={{ 
                                textDecoration: sierra.activo ? 'none' : 'line-through'
                              }}
                            >
                              {sierra.codigo_barra}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{sierra.tipos_sierra?.nombre || 'No especificado'}</TableCell>
                        <TableCell>
                          <Box>
                            {sierra.sucursales?.clientes?.razon_social ? (
                              <Typography fontWeight="medium">
                                {sierra.sucursales.clientes.razon_social}
                              </Typography>
                            ) : sierra.sucursales?.cliente_id ? (
                              <Typography fontWeight="medium" color="warning.main">
                                Cliente ID: {sierra.sucursales.cliente_id}
                              </Typography>
                            ) : (
                              <Typography fontWeight="medium" color="error">
                                Sin cliente
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {sierra.sucursales?.nombre || 'No especificada'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sierra.estados_sierra?.nombre || 'No especificado'} 
                            size="small" 
                            color={
                              sierra.estado_id === 1 ? 'success' : 
                              sierra.estado_id === 2 ? 'warning' : 
                              'error'
                            } 
                            variant={sierra.activo ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>{formatDate(sierra.fecha_registro)}</TableCell>
                        <TableCell>
                          {getTotalAfilados(sierra) > 0 ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip 
                                icon={<HistoryIcon fontSize="small" />}
                                label={`${getTotalAfilados(sierra)} total`}
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                onClick={() => navigate(`/afilados?sierra=${sierra.id}`)} 
                                clickable
                              />
                              {getAfiladosPendientes(sierra) > 0 && (
                                <Chip 
                                  label={`${getAfiladosPendientes(sierra)} pend.`}
                                  size="small" 
                                  color="warning" 
                                  variant="outlined"
                                  onClick={() => navigate(`/afilados?sierra=${sierra.id}&estado=pendiente`)}
                                  clickable
                                />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sin afilados
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/sierras/${sierra.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Registrar Afilado">
                            <IconButton
                              color="secondary"
                              onClick={() => navigate('/afilados/nuevo', {
                                state: { sierraId: sierra.id, sierraCodigo: sierra.codigo_barra }
                              })}
                              disabled={!sierra.activo}
                            >
                              <AfiladoIcon />
                            </IconButton>
                          </Tooltip>

                          {canManageSierras && (
                            <>
                              <Tooltip title="Editar">
                                <IconButton
                                  color="info"
                                  onClick={() => navigate(`/sierras/${sierra.id}/editar`)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteSierra(sierra)}
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
                  {filteredSierras.filter(sierra => {
                    if (tabValue === 1) return sierra.activo;
                    if (tabValue === 2) return !sierra.activo;
                    if (tabValue === 3) return getAfiladosPendientes(sierra) > 0;
                    return true;
                  }).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="text.secondary">
                          No se encontraron sierras
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredSierras.filter(sierra => {
                  if (tabValue === 1) return sierra.activo;
                  if (tabValue === 2) return !sierra.activo;
                  if (tabValue === 3) return getAfiladosPendientes(sierra) > 0;
                  return true;
                }).length}
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
            ¿Está seguro de que desea eliminar la sierra <strong>{confirmDelete?.codigo_barra}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={confirmDeleteSierra} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de error mejorado para sierras con afilados */}
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
                  startIcon={<HistoryIcon />}
                  onClick={() => {
                    setErrorDialog({...errorDialog, open: false});
                    if (errorDialog.sierra) {
                      navigate(`/afilados?sierra=${errorDialog.sierra.id}`);
                    }
                  }}
                >
                  Ver afilados de esta sierra
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

export default SierraList;