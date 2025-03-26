// src/pages/reportes/ReporteHistorialSierras.jsx
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
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme
  } from '@mui/material';
  import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent
  } from '@mui/lab';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  CloudDownload as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  DateRange as DateRangeIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  CheckCircleOutline as CompletedIcon,
  Warning as PendingIcon,
  Timeline as TimelineIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import clienteService from '../../services/clienteService';
import afiladoService from '../../services/afiladoService';
import sucursalService from '../../services/sucursalService';
import sierraService from '../../services/sierraService';

const ReporteHistorialSierras = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  
  // Estados para los datos
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sierras, setSierras] = useState([]);
  const [afilados, setAfilados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sierraSeleccionada, setSierraSeleccionada] = useState(null);
  
  // Estados para filtros
  const [clienteFilter, setClienteFilter] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [codigoSierra, setCodigoSierra] = useState('');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Verificar si hay una sierra preseleccionada en la URL
  const sierraIdParam = searchParams.get('sierra');

  // Función para cargar datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar clientes
      const clientesResponse = await clienteService.getAllClientes();
      if (clientesResponse.success) {
        setClientes(clientesResponse.data);
      }
      
      // Cargar sucursales (solo si hay un cliente seleccionado)
      if (clienteFilter) {
        const sucursalesResponse = await sucursalService.getSucursalesByCliente(clienteFilter);
        if (sucursalesResponse.success) {
          setSucursales(sucursalesResponse.data);
        }
      }
      
      // Cargar sierras según los filtros
      let sierrasResponse;
      if (sierraIdParam) {
        // Buscar una sierra específica por ID
        sierrasResponse = await sierraService.searchSierraByCodigo(sierraIdParam);
        if (sierrasResponse.success && sierrasResponse.data) {
          setSierras([sierrasResponse.data]);
          setSierraSeleccionada(sierrasResponse.data.id);
          
          // Cargar los afilados de esta sierra
          const afiladosResponse = await afiladoService.getAfiladosBySierra(sierrasResponse.data.id);
          if (afiladosResponse.success) {
            setAfilados(afiladosResponse.data);
          }
        }
      } else if (sucursalFilter) {
        // Sierras por sucursal
        sierrasResponse = await sierraService.getSierrasBySucursal(sucursalFilter);
        if (sierrasResponse.success) {
          setSierras(sierrasResponse.data);
        }
      } else if (clienteFilter) {
        // Sierras por cliente
        sierrasResponse = await sierraService.getSierrasByCliente(clienteFilter);
        if (sierrasResponse.success) {
          setSierras(sierrasResponse.data);
        }
      } else {
        // Todas las sierras
        sierrasResponse = await sierraService.getAllSierras();
        if (sierrasResponse.success) {
          setSierras(sierrasResponse.data);
        }
      }
      
      // Si no hay afilados cargados aún y hay una sierra seleccionada, cargar sus afilados
      if (afilados.length === 0 && sierraSeleccionada) {
        const afiladosResponse = await afiladoService.getAfiladosBySierra(sierraSeleccionada);
        if (afiladosResponse.success) {
          setAfilados(afiladosResponse.data);
        }
      }
      
      // Datos simulados para demostración
      setTimeout(() => {
        // Si no hay datos reales, usar simulados solo para la vista previa
        if (afilados.length === 0) {
          // Generar fechas en secuencia para el historial
          const fechaBase = new Date('2025-01-15');
          const tiposAfilado = ['lomo', 'pecho'];
          
          // Generar historial para una sierra simulada si no hay sierra seleccionada
          const historialSimulado = Array.from({ length: 10 }, (_, i) => {
            const fechaAfilado = new Date(fechaBase);
            fechaAfilado.setDate(fechaAfilado.getDate() + i * 15); // Cada 15 días
            
            return {
              id: i + 1,
              sierra_id: 1,
              tipo_afilado_id: i % 2 + 1,
              tipo_afilado: {
                id: i % 2 + 1,
                nombre: tiposAfilado[i % 2]
              },
              observaciones: `Observación del afilado ${i + 1}`,
              fecha_afilado: fechaAfilado.toISOString(),
              fecha_creacion: fechaAfilado.toISOString(),
              fecha_salida: i < 8 ? new Date(fechaAfilado.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
              usuario_id: 1,
              usuarios: {
                id: 1,
                nombre: "Operador Sistema"
              },
              sierras: {
                id: 1,
                codigo_barra: "S-001",
                codigo: "S-001",
                tipo_sierra_id: 1,
                tipos_sierra: {
                  id: 1,
                  nombre: "Circular"
                },
                sucursal_id: 1,
                sucursales: {
                  id: 1,
                  nombre: "Sucursal Principal",
                  cliente_id: 1,
                  clientes: {
                    id: 1,
                    razon_social: "Cliente Demo"
                  }
                }
              }
            };
          });
          
          setAfilados(historialSimulado);
          
          if (sierras.length === 0) {
            setSierras([{
              id: 1,
              codigo_barra: "S-001",
              codigo: "S-001",
              tipo_sierra_id: 1,
              tipos_sierra: {
                id: 1,
                nombre: "Circular"
              },
              sucursal_id: 1,
              sucursales: {
                id: 1,
                nombre: "Sucursal Principal",
                cliente_id: 1,
                clientes: {
                  id: 1,
                  razon_social: "Cliente Demo"
                }
              }
            }]);
          }
          
          if (!sierraSeleccionada) {
            setSierraSeleccionada(1);
          }
        }
        
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, [sierraIdParam]);

  // Cuando cambia el cliente seleccionado, cargar sus sucursales
  useEffect(() => {
    const fetchSucursales = async () => {
      if (clienteFilter) {
        try {
          const response = await sucursalService.getSucursalesByCliente(clienteFilter);
          if (response.success) {
            setSucursales(response.data);
            setSucursalFilter(''); // Resetear el filtro de sucursal
          }
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        }
      } else {
        setSucursales([]);
        setSucursalFilter('');
      }
    };

    fetchSucursales();
  }, [clienteFilter]);

  // Cargar afilados cuando se selecciona una sierra
  useEffect(() => {
    const fetchAfilados = async () => {
      if (sierraSeleccionada) {
        setLoading(true);
        try {
          const response = await afiladoService.getAfiladosBySierra(sierraSeleccionada);
          if (response.success) {
            setAfilados(response.data);
          } else {
            setError('Error al cargar los afilados de la sierra');
          }
        } catch (error) {
          console.error('Error al cargar afilados:', error);
          setError('Error al cargar los afilados. Por favor, inténtelo de nuevo.');
        } finally {
          setLoading(false);
        }
      } else {
        setAfilados([]);
      }
    };

    if (sierraSeleccionada) {
      fetchAfilados();
    }
  }, [sierraSeleccionada]);

  // Filtrar afilados según los filtros aplicados (solo por fecha en este caso)
  const filteredAfilados = afilados.filter(afilado => {
    // Filtro por fecha desde
    if (fechaDesde && new Date(afilado.fecha_afilado) < fechaDesde) {
      return false;
    }
    
    // Filtro por fecha hasta
    if (fechaHasta && new Date(afilado.fecha_afilado) > fechaHasta) {
      return false;
    }
    
    return true;
  });

  // Ordenar afilados por fecha (más reciente primero)
  const sortedAfilados = [...filteredAfilados].sort((a, b) => 
    new Date(b.fecha_afilado) - new Date(a.fecha_afilado)
  );

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Buscar sierra por código
  const handleSearchSierra = async () => {
    if (!codigoSierra.trim()) return;
    
    setLoading(true);
    try {
      const response = await sierraService.searchSierraByCodigo(codigoSierra);
      if (response.success && response.data) {
        setSierras([response.data]);
        setSierraSeleccionada(response.data.id);
        
        // Actualizar filtros de cliente y sucursal para reflejar la sierra seleccionada
        if (response.data.sucursales?.cliente_id) {
          setClienteFilter(response.data.sucursales.cliente_id.toString());
        }
        if (response.data.sucursal_id) {
          setSucursalFilter(response.data.sucursal_id.toString());
        }
      } else {
        setError('No se encontró ninguna sierra con ese código');
        setSierras([]);
        setSierraSeleccionada(null);
      }
    } catch (error) {
      console.error('Error al buscar sierra:', error);
      setError('Error al buscar la sierra. Por favor, inténtelo de nuevo.');
    } finally {
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

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (!sierraSeleccionada || filteredAfilados.length === 0) {
      alert('Primero seleccione una sierra con historial de afilados');
      return;
    }
    
    // Obtener la sierra seleccionada
    const sierra = sierras.find(s => s.id === sierraSeleccionada);
    if (!sierra) return;
    
    // Crear filas de datos para el CSV
    const rows = [
      ['Código Sierra', 'Tipo Sierra', 'Cliente', 'Sucursal', 'Tipo Afilado', 'Fecha Afilado', 'Fecha Salida', 'Estado', 'Observaciones'],
      ...filteredAfilados.map(a => [
        sierra.codigo_barra || sierra.codigo,
        sierra.tipos_sierra?.nombre || 'No especificado',
        sierra.sucursales?.clientes?.razon_social || 'No especificado',
        sierra.sucursales?.nombre || 'No especificada',
        a.tipo_afilado?.nombre || 'No especificado',
        formatDate(a.fecha_afilado),
        a.fecha_salida ? formatDate(a.fecha_salida) : 'Pendiente',
        a.fecha_salida ? 'Completado' : 'Pendiente',
        a.observaciones || ''
      ])
    ];
    
    // Convertir a CSV
    const csvContent = rows.map(row => row.join(',')).join('\n');
    
    // Crear blob y enlace para descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_sierra_${sierra.codigo_barra || sierra.codigo}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para imprimir reporte
  const printReport = () => {
    window.print();
  };

  // Preparar datos para el gráfico de línea de tiempo
  const prepareChartData = () => {
    if (!filteredAfilados.length) return [];
    
    return filteredAfilados.map(afilado => ({
      fecha: formatDate(afilado.fecha_afilado),
      fechaTimestamp: new Date(afilado.fecha_afilado).getTime(),
      tipo: afilado.tipo_afilado?.nombre || 'No especificado',
      completado: afilado.fecha_salida ? 1 : 0,
      pendiente: !afilado.fecha_salida ? 1 : 0,
      diasProceso: afilado.fecha_salida 
        ? Math.round((new Date(afilado.fecha_salida) - new Date(afilado.fecha_afilado)) / (1000 * 60 * 60 * 24))
        : Math.round((new Date() - new Date(afilado.fecha_afilado)) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => a.fechaTimestamp - b.fechaTimestamp);
  };

  const chartData = prepareChartData();

  // Obtener la sierra seleccionada
  const sierraActual = sierras.find(s => s.id === sierraSeleccionada);

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/reportes" color="inherit">
          Reportes
        </MuiLink>
        <Typography color="text.primary">Historial de Sierras</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Historial de Afilados por Sierra
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
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            disabled={!sierraSeleccionada || filteredAfilados.length === 0}
            sx={{ mr: 1 }}
          >
            Exportar CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={printReport}
            disabled={!sierraSeleccionada || filteredAfilados.length === 0}
          >
            Imprimir
          </Button>
        </Box>
      </Box>

      {/* Filtros y selección de sierra */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selección de Sierra
          </Typography>
          <Grid container spacing={2}>
            {/* Búsqueda por código */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código de Sierra"
                variant="outlined"
                size="small"
                value={codigoSierra}
                onChange={(e) => setCodigoSierra(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        aria-label="buscar sierra"
                        onClick={handleSearchSierra}
                        edge="end"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSierra();
                  }
                }}
              />
            </Grid>
            
            {/* Filtro de Cliente */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="cliente-filter-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-filter-label"
                  value={clienteFilter}
                  onChange={(e) => {
                    setClienteFilter(e.target.value);
                    setSierraSeleccionada(null);
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
            
            {/* Filtro de Sucursal */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" disabled={!clienteFilter}>
                <InputLabel id="sucursal-filter-label">Sucursal</InputLabel>
                <Select
                  labelId="sucursal-filter-label"
                  value={sucursalFilter}
                  onChange={(e) => {
                    setSucursalFilter(e.target.value);
                    setSierraSeleccionada(null);
                  }}
                  label="Sucursal"
                >
                  <MenuItem value="">Todas las sucursales</MenuItem>
                  {sucursales.map((sucursal) => (
                    <MenuItem key={sucursal.id} value={sucursal.id.toString()}>
                      {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Selección de Sierra */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="sierra-select-label">Seleccionar Sierra</InputLabel>
                <Select
                  labelId="sierra-select-label"
                  value={sierraSeleccionada || ''}
                  onChange={(e) => setSierraSeleccionada(e.target.value)}
                  label="Seleccionar Sierra"
                >
                  <MenuItem value="">Seleccione una sierra</MenuItem>
                  {sierras.map((sierra) => (
                    <MenuItem key={sierra.id} value={sierra.id}>
                      {sierra.codigo_barra || sierra.codigo} - {sierra.tipos_sierra?.nombre || 'No especificado'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Filtros de fecha - solo visibles si hay una sierra seleccionada */}
            {sierraSeleccionada && (
              <>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha Desde"
                      value={fechaDesde}
                      onChange={(newValue) => {
                        setFechaDesde(newValue);
                        setPage(0);
                      }}
                      slotProps={{ 
                        textField: { 
                          size: 'small',
                          fullWidth: true
                        } 
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha Hasta"
                      value={fechaHasta}
                      onChange={(newValue) => {
                        setFechaHasta(newValue);
                        setPage(0);
                      }}
                      slotProps={{ 
                        textField: { 
                          size: 'small',
                          fullWidth: true
                        } 
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Resumen de la sierra seleccionada */}
      {sierraSeleccionada && sierraActual && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={1}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'primary.lighter',
                    borderRadius: '50%',
                    width: 80,
                    height: 80
                  }}
                >
                  <SierraIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Typography variant="h5" gutterBottom>
                  {sierraActual.codigo_barra || sierraActual.codigo}
                </Typography>
                <Typography variant="body1">
                  Tipo: <Chip label={sierraActual.tipos_sierra?.nombre || 'No especificado'} size="small" color="primary" sx={{ ml: 1 }} />
                </Typography>
                <Typography variant="body1">
                  Estado: <Chip 
                    label={sierraActual.estados_sierra?.nombre || (sierraActual.activo ? 'Activa' : 'Inactiva')} 
                    size="small" 
                    color={sierraActual.activo ? 'success' : 'error'}
                    sx={{ ml: 1 }} 
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="body1" gutterBottom>
                  <BusinessIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Cliente: {sierraActual.sucursales?.clientes?.razon_social || 'No especificado'}
                </Typography>
                <Typography variant="body1">
                  <SucursalIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Sucursal: {sierraActual.sucursales?.nombre || 'No especificada'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Paper 
                    sx={{ 
                      p: 1, 
                      bgcolor: 'primary.lighter', 
                      color: 'primary.dark', 
                      borderRadius: 2,
                      textAlign: 'center',
                      width: '48%'
                    }}
                  >
                    <Typography variant="body2">Total Afilados</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {filteredAfilados.length}
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    sx={{ 
                      p: 1, 
                      bgcolor: 'warning.lighter', 
                      color: 'warning.dark', 
                      borderRadius: 2,
                      textAlign: 'center',
                      width: '48%'
                    }}
                  >
                    <Typography variant="body2">Pendientes</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {filteredAfilados.filter(a => !a.fecha_salida).length}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : !sierraSeleccionada ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Seleccione una sierra para ver su historial de afilados
        </Alert>
      ) : filteredAfilados.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          La sierra seleccionada no tiene historial de afilados en el período seleccionado
        </Alert>
      ) : (
        <>
          {/* Gráfico de línea temporal */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolución Temporal de Afilados
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === 'diasProceso') return [`${value} días`, 'Tiempo de proceso'];
                        return [value, name === 'completado' ? 'Completado' : name === 'pendiente' ? 'Pendiente' : name];
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#000" />
                    <Line type="monotone" dataKey="diasProceso" name="Días de Proceso" stroke={theme.palette.info.main} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Línea de tiempo de afilados */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Línea de Tiempo de Afilados
              </Typography>
              <Box sx={{ my: 2 }}>
                <Timeline position="alternate">
                  {sortedAfilados.slice(0, 10).map((afilado, index) => (
                    <TimelineItem key={afilado.id}>
                      <TimelineOppositeContent color="text.secondary">
                        {formatDate(afilado.fecha_afilado)}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot 
                          color={afilado.fecha_salida ? "success" : "warning"}
                          variant={afilado.fecha_salida ? "filled" : "outlined"}
                        >
                          <AfiladoIcon />
                        </TimelineDot>
                        {index < sortedAfilados.slice(0, 10).length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" component="span" fontWeight="bold">
                            {afilado.tipo_afilado?.nombre || 'Afilado'}
                          </Typography>
                          <Typography variant="body2">
                            Estado: {' '}
                            <Chip 
                              size="small" 
                              label={afilado.fecha_salida ? 'Completado' : 'Pendiente'} 
                              color={afilado.fecha_salida ? 'success' : 'warning'}
                            />
                          </Typography>
                          {afilado.fecha_salida && (
                            <Typography variant="body2">
                              Entregado: {formatDate(afilado.fecha_salida)}
                            </Typography>
                          )}
                          {afilado.observaciones && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {afilado.observaciones}
                            </Typography>
                          )}
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
                
                {sortedAfilados.length > 10 && (
                  <Box textAlign="center" mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Mostrando los 10 afilados más recientes. La tabla a continuación muestra el historial completo.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Tabla de historial completo */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial Completo de Afilados
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo Afilado</TableCell>
                      <TableCell>Fecha Afilado</TableCell>
                      <TableCell>Fecha Salida</TableCell>
                      <TableCell>Días Proceso</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Responsable</TableCell>
                      <TableCell>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedAfilados
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((afilado) => {
                        // Calcular días de proceso
                        const fechaInicio = new Date(afilado.fecha_afilado);
                        const fechaFin = afilado.fecha_salida ? new Date(afilado.fecha_salida) : new Date();
                        const diasProceso = Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <TableRow key={afilado.id}>
                            <TableCell>{afilado.tipo_afilado?.nombre || 'No especificado'}</TableCell>
                            <TableCell>{formatDate(afilado.fecha_afilado)}</TableCell>
                            <TableCell>
                              {afilado.fecha_salida ? formatDate(afilado.fecha_salida) : 'Pendiente'}
                            </TableCell>
                            <TableCell>{diasProceso} días</TableCell>
                            <TableCell>
                              <Chip 
                                icon={afilado.fecha_salida ? <CompletedIcon /> : <PendingIcon />}
                                label={afilado.fecha_salida ? 'Completado' : 'Pendiente'} 
                                color={afilado.fecha_salida ? 'success' : 'warning'} 
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{afilado.usuarios?.nombre || 'No especificado'}</TableCell>
                            <TableCell>{afilado.observaciones || '-'}</TableCell>
                          </TableRow>
                        );
                      })}

                    {/* Mensaje cuando no hay resultados */}
                    {sortedAfilados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                          <Typography variant="body1" color="text.secondary">
                            No hay historiales de afilado para esta sierra en el período seleccionado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={sortedAfilados.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                />
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Botón flotante de acciones */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <Tooltip title="Exportar CSV">
          <IconButton 
            color="primary" 
            size="large" 
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 3,
              mr: 1
            }}
            onClick={exportToCSV}
            disabled={!sierraSeleccionada || filteredAfilados.length === 0}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Imprimir">
          <IconButton 
            color="primary" 
            size="large" 
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 3 
            }}
            onClick={printReport}
            disabled={!sierraSeleccionada || filteredAfilados.length === 0}
          >
            <PrintIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Estilos para impresión */}
      <style jsx="true">{`
        @media print {
          @page { size: landscape; }
          body * {
            visibility: hidden;
          }
          .MuiContainer-root, .MuiContainer-root * {
            visibility: visible;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default ReporteHistorialSierras;