// src/pages/afilados/AfiladoList.jsx
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
  Tabs,
  Tab,
  Badge,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
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
  BuildCircle as AfiladoIcon,
  History as HistoryIcon,
  LocalShipping as ShippingIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrCodeIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { Checkbox } from '@mui/material';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import afiladoService from '../../services/afiladoService';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';
import catalogoService from '../../services/catalogoService';
import sierraService from '../../services/sierraService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para mostrar un panel con tab
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`afilado-tabpanel-${index}`}
      aria-labelledby={`afilado-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

const AfiladoList = ({ clienteFilter = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [afilados, setAfilados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sierras, setSierras] = useState([]);
  const [tiposAfilado, setTiposAfilado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedAfilados, setSelectedAfilados] = useState([]);
  const [confirmRegistroSalida, setConfirmRegistroSalida] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilterValue, setClienteFilterValue] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [sierraFilter, setSierraFilter] = useState('');
  const [tipoAfiladoFilter, setTipoAfiladoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [fechaInicioFilter, setFechaInicioFilter] = useState('');
  const [fechaFinFilter, setFechaFinFilter] = useState('');
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para manejar si el usuario puede agregar/editar afilados
  const canManageAfilados = user?.rol === 'Gerente' || user?.rol === 'Administrador';
  const sierraParam = searchParams.get('sierra');
  const pendientesParam = searchParams.get('pendientes') === 'true';
  const clienteParam = searchParams.get('cliente');

  const [clientesMap, setClientesMap] = useState({});

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Función para cargar los catálogos
  const loadCatalogos = async () => {
    try {
      // Cargar tipos de afilado
      const tiposAfiladoResponse = await catalogoService.getTiposAfilado();
      if (tiposAfiladoResponse.success) {
        setTiposAfilado(tiposAfiladoResponse.data);
      }

      // Cargar clientes para filtros
      const clientesResponse = await clienteService.getAllClientes();
      if (clientesResponse.success) {
        setClientes(clientesResponse.data);
        
        // Crear mapa de clientes para referencias rápidas
        const clientesMapeados = {};
        clientesResponse.data.forEach(cliente => {
          clientesMapeados[cliente.id] = cliente.razon_social;
        });
        setClientesMap(clientesMapeados);
        
        // Si estamos en modo clienteFilter, establecer el filtro al ID del cliente actual
        if (clienteFilter && user?.cliente_id) {
          setClienteFilterValue(user.cliente_id.toString());
          loadSucursalesByCliente(user.cliente_id);
          loadSierrasByCliente(user.cliente_id);
        }
        // Si hay un cliente seleccionado en la URL, cargar sus sucursales y sierras
        else if (clienteParam) {
          loadSucursalesByCliente(clienteParam);
          loadSierrasByCliente(clienteParam);
          setClienteFilterValue(clienteParam);
        } else {
          // Cargar todas las sucursales si no hay cliente seleccionado
          const sucursalesResponse = await sucursalService.getAllSucursales();
          if (sucursalesResponse.success) {
            setSucursales(sucursalesResponse.data);
          }
          
          const sierrasResponse = await sierraService.getAllSierras();
          if (sierrasResponse.success) {
            setSierras(sierrasResponse.data);
          }
        }
      }
      
      // Si hay una sierra en la URL, establecerla como filtro
      if (sierraParam) {
        setSierraFilter(sierraParam);
      }
      
      // Si estamos filtrando por pendientes, establecer el filtro de estado
      if (pendientesParam) {
        setEstadoFilter('pendiente');
        setTabValue(1); // Cambiar a la pestaña de pendientes
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

  // Función para cargar sierras por cliente
  const loadSierrasByCliente = async (clienteId) => {
    try {
      const response = await sierraService.getSierrasByCliente(clienteId);
      if (response.success) {
        setSierras(response.data);
      }
    } catch (err) {
      console.error('Error al cargar sierras por cliente:', err);
    }
  };

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar catálogos primero para tener los datos disponibles
      await loadCatalogos();
      
      // Cargar afilados según los parámetros
      let afiladosResponse;
      
      if (clienteFilter && user?.cliente_id) {
        // Filtrar por el cliente del usuario actual
        afiladosResponse = await afiladoService.getAfiladosByCliente(user.cliente_id);
      } else if (sierraParam) {
        // Filtrar por sierra específica
        afiladosResponse = await afiladoService.getAfiladosBySierra(sierraParam);
      } else if (clienteParam) {
        // Filtrar por cliente específico
        afiladosResponse = await afiladoService.getAfiladosByCliente(clienteParam);
      } else if (pendientesParam) {
        // Filtrar solo afilados pendientes
        afiladosResponse = await afiladoService.getAfiladosPendientes();
      } else {
        // Cargar todos los afilados
        afiladosResponse = await afiladoService.getAllAfilados();
      }

      if (afiladosResponse.success) {
        setAfilados(afiladosResponse.data);
      } else {
        setError('Error al cargar los afilados');
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
  }, [sierraParam, clienteParam, pendientesParam, clienteFilter, user]);

  // Efectos para cargar datos relacionados cuando cambian los filtros
  useEffect(() => {
    if (clienteFilterValue) {
      loadSucursalesByCliente(clienteFilterValue);
      loadSierrasByCliente(clienteFilterValue);
    }
  }, [clienteFilterValue]);

  // Función para manejar el cambio de tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    
    // Actualizar el filtro de estado según la pestaña seleccionada
    if (newValue === 1) { // Pestaña de pendientes
      setEstadoFilter('pendiente');
    } else if (newValue === 2) { // Pestaña de completados
      setEstadoFilter('completado');
    } else {
      setEstadoFilter(''); // Todas
    }
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

  // Función para filtrar afilados
  const filteredAfilados = afilados.filter((afilado) => {
    // Filtrar por término de búsqueda
    const searchFields = [
      afilado.sierras?.codigo_barra || '',
      afilado.sierras?.codigo || '',
      afilado.tipos_afilado?.nombre || '',
      afilado.sierras?.sucursales?.nombre || '',
      afilado.sierras?.sucursales?.clientes?.razon_social || '',
      afilado.observaciones || ''
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    // Filtrar por cliente (siempre se aplica si estamos en modo clienteFilter)
    const matchesCliente = clienteFilter ? true : 
                          (clienteFilterValue === '' || 
                          afilado.sierras?.sucursales?.cliente_id === parseInt(clienteFilterValue));
    
    // Filtrar por sucursal
    const matchesSucursal = sucursalFilter === '' || 
      afilado.sierras?.sucursal_id === parseInt(sucursalFilter);
    
    // Filtrar por sierra
    const matchesSierra = sierraFilter === '' || 
      afilado.sierra_id === parseInt(sierraFilter);
    
    // Filtrar por tipo de afilado
    const matchesTipoAfilado = tipoAfiladoFilter === '' || 
      afilado.tipo_afilado_id === parseInt(tipoAfiladoFilter);
    
    // Filtrar por estado (pendiente o completado)
    const matchesEstado = estadoFilter === '' || 
      (estadoFilter === 'pendiente' && !afilado.fecha_salida) ||
      (estadoFilter === 'completado' && afilado.fecha_salida);
    
    // Filtrar por fecha de inicio
    const matchesFechaInicio = !fechaInicioFilter || 
      (afilado.fecha_afilado && new Date(afilado.fecha_afilado) >= new Date(fechaInicioFilter));
    
    // Filtrar por fecha de fin
    const matchesFechaFin = !fechaFinFilter || 
      (afilado.fecha_afilado && new Date(afilado.fecha_afilado) <= new Date(fechaFinFilter));
    
    return matchesSearch && matchesCliente && matchesSucursal && 
           matchesSierra && matchesTipoAfilado && matchesEstado &&
           matchesFechaInicio && matchesFechaFin;
  });

  // Manejar la selección de afilados
  const handleSelectAfilado = (afiladoId) => {
    setSelectedAfilados(prev => {
      if (prev.includes(afiladoId)) {
        return prev.filter(id => id !== afiladoId);
      } else {
        return [...prev, afiladoId];
      }
    });
  };

  // Manejar el registro de salida masiva
  const handleRegistroSalidaMasiva = async () => {
    if (selectedAfilados.length === 0) return;
    
    setConfirmRegistroSalida(true);
  };

  // Confirmar registro de salida masiva
  const confirmRegistroSalidaMasiva = async () => {
    setConfirmRegistroSalida(false);
    
    try {
      const response = await afiladoService.registrarSalidaMasiva(selectedAfilados);
      if (response.success) {
        // Limpiar selección y recargar datos
        setSelectedAfilados([]);
        loadData();
      } else {
        console.error('Error al registrar salida masiva:', response.error);
        alert('Error al registrar salida: ' + response.error);
      }
    } catch (err) {
      console.error('Error al registrar salida masiva:', err);
      alert('Error al registrar salida. Por favor, inténtelo de nuevo.');
    }
  };
  
  // Registrar la salida de un único afilado
  const handleRegistroSalida = async (afiladoId) => {
    try {
      const response = await afiladoService.registrarSalida(afiladoId);
      if (response.success) {
        loadData(); // Recargar datos
      } else {
        console.error('Error al registrar salida:', response.error);
        alert('Error al registrar salida: ' + response.error);
      }
    } catch (err) {
      console.error('Error al registrar salida:', err);
      alert('Error al registrar salida. Por favor, inténtelo de nuevo.');
    }
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
            {clientes.find(c => c.id === parseInt(clienteParam))?.razon_social || 'Cliente'}
          </MuiLink>
        )}
        {sierraParam && (
          <MuiLink 
            component={Link} 
            to={clienteFilter ? `/mis-sierras/${sierraParam}` : `/sierras/${sierraParam}`} 
            color="inherit"
          >
            {sierras.find(s => s.id === parseInt(sierraParam))?.codigo_barra || 'Sierra'}
          </MuiLink>
        )}
        <Typography color="text.primary">{clienteFilter ? "Mis Afilados" : "Afilados"}</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {clienteFilter ? "Mis Afilados" : "Afilados"}
          {clienteParam && !clienteFilter && (
            <Typography variant="subtitle1" color="text.secondary">
              Cliente: {clientes.find(c => c.id === parseInt(clienteParam))?.razon_social}
            </Typography>
          )}
          {sierraParam && (
            <Typography variant="subtitle1" color="text.secondary">
              Sierra: {sierras.find(s => s.id === parseInt(sierraParam))?.codigo_barra}
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
          
          {/* Botones según permisos */}
          {canManageAfilados && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CheckCircleIcon />}
                onClick={() => navigate('/afilados/salida-masiva')}
                sx={{ mr: 1 }}
              >
                Registro Masivo de Salidas
              </Button>
              
              {/* Nuevo botón para marcar último afilado masivo */}
              {(user?.rol === 'Gerente' || user?.rol === 'Administrador') && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={() => navigate('/afilados/ultimo-afilado-masivo')}
                  sx={{ mr: 1 }}
                >
                  Marcar Último Afilado Masivo
                </Button>
              )}
            </>
          )}
                    
          


          {/* Botón para escanear sierra (todos los usuarios autorizados) */}
          {(canManageAfilados || (clienteFilter && user?.rol === 'Cliente')) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<QrCodeIcon />}
              onClick={() => navigate(clienteFilter ? '/mis-afilados/escanear' : '/afilados/escanear')}
            >
              Escanear Sierra
            </Button>
          )}
          
          {/* Botón de registro masivo para afilados seleccionados */}
          {selectedAfilados.length > 0 && canManageAfilados && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleRegistroSalidaMasiva}
              sx={{ ml: 1 }}
            >
              Registrar Salida ({selectedAfilados.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="afilados tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todos los Afilados" id="afilado-tab-0" />
          <Tab 
            label={
              <Badge 
                badgeContent={afilados.filter(a => !a.fecha_salida).length} 
                color="warning"
              >
                Pendientes
              </Badge>
            } 
            id="afilado-tab-1"
          />
          <Tab 
            label={
              <Badge 
                badgeContent={afilados.filter(a => a.fecha_salida).length} 
                color="success"
              >
                Completados
              </Badge>
            } 
            id="afilado-tab-2"
          />
        </Tabs>
      </Box>

      {/* Filtros y búsqueda */}
      <TabPanel value={tabValue} index={tabValue}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {/* Campo de búsqueda - más ancho en modo cliente */}
              <Grid item xs={12} md={clienteFilter ? 6 : 3}>
                <TextField
                  fullWidth
                  placeholder="Buscar afilados..."
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

              {/* Ocultar filtros de cliente y sucursal si estamos en modo cliente */}
              {!clienteFilter && (
                <>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="cliente-filter-label">Cliente</InputLabel>
                      <Select
                        labelId="cliente-filter-label"
                        value={clienteFilterValue}
                        onChange={(e) => {
                          setClienteFilterValue(e.target.value);
                          setSucursalFilter(''); // Resetear sucursal al cambiar cliente
                          setSierraFilter(''); // Resetear sierra al cambiar cliente
                        }}
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

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="sucursal-filter-label">Sucursal</InputLabel>
                      <Select
                        labelId="sucursal-filter-label"
                        value={sucursalFilter}
                        onChange={(e) => {
                          setSucursalFilter(e.target.value);
                          // Actualizar sierras disponibles si cambia la sucursal
                        }}
                        label="Sucursal"
                        disabled={!clienteFilterValue}
                      >
                        <MenuItem value="">Todas las sucursales</MenuItem>
                        {sucursales
                          .filter(sucursal => !clienteFilterValue || 
                            sucursal.cliente_id === parseInt(clienteFilterValue))
                          .map((sucursal) => (
                            <MenuItem key={sucursal.id} value={sucursal.id.toString()}>
                              {sucursal.nombre}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Filtro de sierra */}
              <Grid item xs={12} md={clienteFilter ? 6 : 3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sierra-filter-label">Sierra</InputLabel>
                  <Select
                    labelId="sierra-filter-label"
                    value={sierraFilter}
                    onChange={(e) => setSierraFilter(e.target.value)}
                    label="Sierra"
                    disabled={!clienteFilterValue && !clienteFilter}
                  >
                    <MenuItem value="">Todas las sierras</MenuItem>
                    {sierras
                      .filter(sierra => 
                        clienteFilter ? true : 
                        (!clienteFilterValue || 
                          sierra.sucursales?.cliente_id === parseInt(clienteFilterValue))
                      )
                      .filter(sierra => 
                        !sucursalFilter || 
                        sierra.sucursal_id === parseInt(sucursalFilter)
                      )
                      .map((sierra) => (
                        <MenuItem key={sierra.id} value={sierra.id.toString()}>
                          {sierra.codigo_barra || sierra.codigo}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro de tipo de afilado */}
              <Grid item xs={12} md={clienteFilter ? 6 : 3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="tipo-afilado-filter-label">Tipo de Afilado</InputLabel>
                  <Select
                    labelId="tipo-afilado-filter-label"
                    value={tipoAfiladoFilter}
                    onChange={(e) => setTipoAfiladoFilter(e.target.value)}
                    label="Tipo de Afilado"
                  >
                    <MenuItem value="">Todos los tipos</MenuItem>
                    {tiposAfilado.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtros de fecha */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Fecha desde"
                  type="date"
                  size="small"
                  value={fechaInicioFilter}
                  onChange={(e) => setFechaInicioFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Fecha hasta"
                  type="date"
                  size="small"
                  value={fechaFinFilter}
                  onChange={(e) => setFechaFinFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tabla de afilados */}
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
                    {canManageAfilados && (
                      <TableCell padding="checkbox"></TableCell>
                    )}
                    <TableCell>Sierra</TableCell>
                    <TableCell>Tipo de Afilado</TableCell>
                    <TableCell>Cliente / Sucursal</TableCell>
                    <TableCell>Fecha Ingreso</TableCell>
                    <TableCell>Fecha Salida</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAfilados
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((afilado) => (
                      <TableRow 
                        key={afilado.id}
                        sx={{ 
                          bgcolor: selectedAfilados.includes(afilado.id) ? 
                            'rgba(25, 118, 210, 0.08)' : 'transparent',
                        }}
                      >
                        {canManageAfilados && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedAfilados.includes(afilado.id)}
                              onChange={() => handleSelectAfilado(afilado.id)}
                              disabled={afilado.fecha_salida}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SierraIcon 
                              fontSize="small" 
                              color="secondary" 
                              sx={{ mr: 1 }} 
                            />
                            <Typography fontWeight="medium">
                              {afilado.sierras?.codigo_barra || afilado.sierras?.codigo || 'No especificada'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{afilado.tipos_afilado?.nombre || 'No especificado'}</TableCell>
<TableCell>
  <Box>
    {afilado.sierras?.sucursales?.clientes?.razon_social ? (
      <Typography fontWeight="medium">
        {afilado.sierras.sucursales.clientes.razon_social}
      </Typography>
    ) : afilado.sierras?.sucursales?.cliente_id && clientesMap[afilado.sierras.sucursales.cliente_id] ? (
      <Typography fontWeight="medium">
        {clientesMap[afilado.sierras.sucursales.cliente_id]}
      </Typography>
    ) : (
      <Typography fontWeight="medium" color="text.secondary">
        {afilado.sierras?.cliente_nombre || 'Cliente no disponible'}
      </Typography>
    )}
    <Typography variant="caption" color="text.secondary">
      {afilado.sierras?.sucursales?.nombre || afilado.sierras?.sucursal_nombre || 'Sucursal no especificada'}
    </Typography>
  </Box>
</TableCell>
                        <TableCell>{formatDate(afilado.fecha_afilado)}</TableCell>
                        <TableCell>
                          {afilado.fecha_salida ? 
                            formatDate(afilado.fecha_salida) : 
                            <Chip size="small" color="warning" label="Pendiente" />
                          }
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={afilado.fecha_salida ? 'Completado' : 'Pendiente'} 
                            size="small" 
                            color={afilado.fecha_salida ? 'success' : 'warning'} 
                            variant={afilado.fecha_salida ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(clienteFilter ? 
                                `/mis-afilados/${afilado.id}` : 
                                `/afilados/${afilado.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {!afilado.fecha_salida && canManageAfilados && (
                            <Tooltip title="Registrar Salida">
                              <IconButton
                                color="success"
                                onClick={() => handleRegistroSalida(afilado.id)}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canManageAfilados && (
                            <Tooltip title="Editar">
                              <IconButton
                                color="info"
                                onClick={() => navigate(clienteFilter ? 
                                  `/mis-afilados/${afilado.id}/editar` : 
                                  `/afilados/${afilado.id}/editar`)}
                                disabled={afilado.fecha_salida} // No editar si ya tiene salida
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredAfilados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canManageAfilados ? 8 : 7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="text.secondary">
                          No se encontraron afilados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredAfilados.length}
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

      {/* Diálogo de confirmación de registro de salida masiva */}
      <Dialog
        open={confirmRegistroSalida}
        onClose={() => setConfirmRegistroSalida(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar Registro de Salida
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea registrar la salida de <strong>{selectedAfilados.length}</strong> afilados? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRegistroSalida(false)}>Cancelar</Button>
          <Button onClick={confirmRegistroSalidaMasiva} color="success" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AfiladoList;