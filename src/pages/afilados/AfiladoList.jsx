// src/pages/afilados/AfiladoList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Alert,
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
  Switch,
  FormControlLabel,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon,
  CheckCircleOutline as CheckCircleIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircleOutline as CompletedIcon,
  BuildCircle as AfiladoIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Warning as PendingIcon,
  ContentCut as SierraIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import afiladoService from '../../services/afiladoService';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService';
import catalogoService from '../../services/catalogoService';
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

const AfiladoList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [afilados, setAfilados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesMap, setClientesMap] = useState({}); // Mapa de cliente_id -> razon_social
  const [sucursales, setSucursales] = useState([]);
  const [tiposAfilado, setTiposAfilado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [tipoAfiladoFilter, setTipoAfiladoFilter] = useState('');
  const [showPendientesOnly, setShowPendientesOnly] = useState(
    searchParams.get('pendientes') === 'true'
  );
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para manejar si el usuario puede agregar/editar afilados
  const canManageAfilados = user?.rol === 'Gerente' || user?.rol === 'Administrador';
  const pendientesParam = searchParams.get('pendientes');
  const sierraParam = searchParams.get('sierra');

  useEffect(() => {
    // Si hay un parámetro de pendientes, establecer la tab correspondiente
    if (pendientesParam === 'true') {
      setTabValue(1); // Tab de pendientes
      setShowPendientesOnly(true);
    } else if (sierraParam) {
      setTabValue(2); // Tab de sierras
    }
  }, [pendientesParam, sierraParam]);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar los clientes primero para tener el mapeo disponible
      try {
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          // Crear un mapa de id -> razon_social para acceso rápido
          const clientesMapeados = {};
          clientesResponse.data.forEach(cliente => {
            clientesMapeados[cliente.id] = cliente.razon_social;
          });
          setClientes(clientesResponse.data);
          setClientesMap(clientesMapeados);
          console.log('Mapa de clientes creado:', clientesMapeados);
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
      
      // Cargar afilados según la pestaña actual y el rol del usuario
      let afiladosResponse;
      
      if (user?.rol === 'Gerente' || user?.rol === 'Administrador') {
        // Si es gerente o admin, usar el endpoint para obtener todos los afilados
        afiladosResponse = await afiladoService.getAllAfilados();
      } else if (tabValue === 1 || showPendientesOnly) {
        // Pendientes
        afiladosResponse = await afiladoService.getAfiladosPendientes();
      } else if (tabValue === 2 && sierraParam) {
        // Afilados de una sierra específica
        afiladosResponse = await afiladoService.getAfiladosBySierra(sierraParam);
      } else {
        // Para otros usuarios, filtrar por cliente
        afiladosResponse = await afiladoService.getAfiladosByCliente(user?.cliente_id || '');
      }
  
      if (afiladosResponse.success) {
        console.log('Datos de afilados cargados:', afiladosResponse.data);
        setAfilados(afiladosResponse.data);
      } else {
        setError('Error al cargar los afilados');
      }
      
      // Cargar catálogos
      try {
        // Cargar tipos de afilado para filtros
        const tiposAfiladoResponse = await catalogoService.getTiposAfilado();
        if (tiposAfiladoResponse.success) {
          setTiposAfilado(tiposAfiladoResponse.data);
        }

        // Si hay un cliente seleccionado, cargar sus sucursales
        if (clienteFilter) {
          const sucursalesResponse = await sucursalService.getSucursalesByCliente(clienteFilter);
          if (sucursalesResponse.success) {
            setSucursales(sucursalesResponse.data);
          }
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        // No bloqueamos la carga principal por errores en catálogos
      }
    } catch (err) {
      console.error('Error al cargar afilados:', err);
      setError('Ocurrió un error al cargar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tabValue, sierraParam]);

  // Función para manejar el cambio de tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Resetear algunos filtros al cambiar de tab
    if (newValue === 1) {
      setShowPendientesOnly(true);
    } else {
      setShowPendientesOnly(false);
    }
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

  // Función para filtrar afilados
  const filteredAfilados = afilados.filter((afilado) => {
    // Filtrar por término de búsqueda
    const searchFields = [
      afilado.sierras?.codigo_barra || '',
      afilado.sierras?.codigo || '',
      afilado.sierras?.tipos_sierra?.nombre || '',
      afilado.tipos_afilado?.nombre || '',
      afilado.usuarios?.nombre || '',
      afilado.sierras?.sucursales?.nombre || '',
      clientesMap[afilado.sierras?.sucursales?.cliente_id] || '',
      afilado.observaciones || ''
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    // Filtrar por cliente
    const matchesCliente = clienteFilter === '' || 
      afilado.sierras?.sucursales?.cliente_id === parseInt(clienteFilter);
    
    // Filtrar por sucursal
    const matchesSucursal = sucursalFilter === '' || 
      afilado.sierras?.sucursal_id === parseInt(sucursalFilter);
    
    // Filtrar por tipo de afilado
    const matchesTipoAfilado = tipoAfiladoFilter === '' || 
      afilado.tipo_afilado_id === parseInt(tipoAfiladoFilter);
    
    // Filtrar por pendientes/completados
    const matchesPendientes = !showPendientesOnly || afilado.fecha_salida === null;
    
    return matchesSearch && matchesCliente && matchesSucursal && 
           matchesTipoAfilado && matchesPendientes;
  });

  // Función para manejar el registro de salida de un afilado
  const handleRegistrarSalida = async (id) => {
    if (window.confirm('¿Confirmar la salida de este afilado?')) {
      try {
        const response = await afiladoService.registrarSalida(id);
        if (response.success) {
          loadData(); // Recargar los datos
        } else {
          alert('Error al registrar la salida');
        }
      } catch (err) {
        console.error('Error al registrar salida:', err);
        alert('Error al registrar la salida. Por favor, inténtelo de nuevo.');
      }
    }
  };

  // Función para ir a la página de escaneo de sierra
  const handleIrAEscaneo = () => {
    navigate('/afilados/escanear');
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        <Typography color="text.primary">Afilados</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          sx={{ mr: 1 }}
        >
          Actualizar
        </Button>
        
        {canManageAfilados && (
          <>
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => navigate('/afilados/salida-masiva')}
              sx={{ mr: 1 }}
            >
              Registro Masivo de Salidas
            </Button>
          
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<QrCodeIcon />}
              onClick={() => navigate('/afilados/escanear')}
              sx={{ mr: 1 }}
            >
              Escanear Sierra
            </Button>
            

          </>
        )}
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
              <Badge badgeContent={afilados.filter(a => !a.fecha_salida).length} color="error">
                Pendientes
              </Badge>
            } 
            id="afilado-tab-1"
          />
          {sierraParam && (
            <Tab 
              label={`Sierra ${afilados[0]?.sierras?.codigo_barra || afilados[0]?.sierras?.codigo || sierraParam}`} 
              id="afilado-tab-2"
            />
          )}
        </Tabs>
      </Box>

      {/* Filtros y búsqueda */}
      <TabPanel value={tabValue} index={0}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="cliente-filter-label">Cliente</InputLabel>
                  <Select
                    labelId="cliente-filter-label"
                    value={clienteFilter}
                    onChange={(e) => setClienteFilter(e.target.value)}
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

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sucursal-filter-label">Sucursal</InputLabel>
                  <Select
                    labelId="sucursal-filter-label"
                    value={sucursalFilter}
                    onChange={(e) => setSucursalFilter(e.target.value)}
                    label="Sucursal"
                    disabled={!clienteFilter}
                  >
                    <MenuItem value="">Todas las sucursales</MenuItem>
                    {sucursales
                      .filter(sucursal => !clienteFilter || sucursal.cliente_id === parseInt(clienteFilter))
                      .map((sucursal) => (
                        <MenuItem key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showPendientesOnly}
                      onChange={(e) => setShowPendientesOnly(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Solo pendientes"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Mostrando afilados pendientes de entrega. Estos afilados requieren registrar su salida cuando sean entregados.
        </Alert>
      </TabPanel>

      {sierraParam && (
        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Mostrando historial de afilados para la sierra específica.
          </Alert>
        </TabPanel>
      )}

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
                    <TableCell>Sierra</TableCell>
                    <TableCell>Tipo de Afilado</TableCell>
                    <TableCell>Cliente / Sucursal</TableCell>
                    <TableCell>Fecha de Afilado</TableCell>
                    <TableCell>Fecha de Salida</TableCell>
                    <TableCell>Responsable</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAfilados
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((afilado) => (
                      <TableRow key={afilado.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SierraIcon 
                              fontSize="small" 
                              color="secondary" 
                              sx={{ mr: 1 }} 
                            />
                            <Box>
                              <Typography fontWeight="medium">
                                {afilado.sierras?.codigo_barra || afilado.sierras?.codigo || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {afilado.sierras?.tipos_sierra?.nombre || 'Tipo no especificado'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{afilado.tipos_afilado?.nombre || 'No especificado'}</TableCell>
                        <TableCell>
                          {/* Usar el mapa de clientes para mostrar el nombre basado en el cliente_id */}
                          <Typography fontWeight="medium">
                            {afilado.sierras?.sucursales?.cliente_id 
                              ? clientesMap[afilado.sierras.sucursales.cliente_id] || `Cliente ID: ${afilado.sierras.sucursales.cliente_id}` 
                              : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {afilado.sierras?.sucursales?.nombre || 'Sucursal no especificada'}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(afilado.fecha_afilado)}</TableCell>
                        <TableCell>
                          {afilado.fecha_salida ? (
                            formatDate(afilado.fecha_salida)
                          ) : (
                            <Chip 
                              label="Pendiente" 
                              size="small" 
                              color="warning" 
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>{afilado.usuarios?.nombre || 'No especificado'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={afilado.fecha_salida ? 'Completado' : 'Pendiente'} 
                            size="small" 
                            color={afilado.fecha_salida ? 'success' : 'warning'} 
                            icon={afilado.fecha_salida ? <CompletedIcon /> : <PendingIcon />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/afilados/${afilado.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {!afilado.fecha_salida && canManageAfilados && (
                            <Tooltip title="Registrar salida">
                              <IconButton
                                color="success"
                                onClick={() => handleRegistrarSalida(afilado.id)}
                              >
                                <CompletedIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredAfilados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="textSecondary">
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
    </Box>
  );
};

export default AfiladoList;