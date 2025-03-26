// src/pages/reportes/ReporteAfiladosSucursal.jsx
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
  PieChart as ChartIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import clienteService from '../../services/clienteService';
import afiladoService from '../../services/afiladoService';
import sucursalService from '../../services/sucursalService';

const ReporteAfiladosSucursal = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Estados para los datos
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [afilados, setAfilados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [clienteFilter, setClienteFilter] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [estadoFilter, setEstadoFilter] = useState('todos'); // 'todos', 'pendientes', 'completados'
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Colores para gráficos
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.grey[500]
  ];

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
      
      // Cargar sucursales
      const sucursalesResponse = await sucursalService.getAllSucursales();
      if (sucursalesResponse.success) {
        setSucursales(sucursalesResponse.data);
      }
      
      // Cargar datos de afilados (simulados para este ejemplo)
      // En una implementación real, esto se obtendría del API
      setTimeout(() => {
        // Simulación de datos de afilado
        const datosSimulados = [
          {
            id: 1,
            sucursal: {
              id: 1,
              nombre: 'AS',
              cliente: {
                id: 1,
                razon_social: 'Cliente A'
              }
            },
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'lomo',
            estado: true,
            fecha_afilado: '2025-03-03',
            fecha_creacion: '2025-02-18',
            dias: 13
          },
          {
            id: 2,
            sucursal: {
              id: 1,
              nombre: 'AS',
              cliente: {
                id: 1,
                razon_social: 'Cliente A'
              }
            },
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'lomo',
            estado: true,
            fecha_afilado: '2025-03-10',
            fecha_creacion: '2025-02-18',
            dias: 20
          },
          {
            id: 3,
            sucursal: {
              id: 1,
              nombre: 'AS',
              cliente: {
                id: 1,
                razon_social: 'Cliente A'
              }
            },
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'pecho',
            estado: true,
            fecha_afilado: '2025-03-03',
            fecha_creacion: '2025-02-18',
            dias: 13
          },
          {
            id: 4,
            sucursal: {
              id: 1,
              nombre: 'AS',
              cliente: {
                id: 1,
                razon_social: 'Cliente A'
              }
            },
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'pecho',
            estado: false,
            fecha_afilado: '2025-03-28',
            fecha_creacion: '2025-02-18',
            dias: 38
          },
          {
            id: 5,
            sucursal: {
              id: 2,
              nombre: 'BS',
              cliente: {
                id: 2,
                razon_social: 'Cliente B'
              }
            },
            tipo_sierra: 'Cinta',
            codigo_sierra: 'S-0002',
            tipo_afilado: 'lomo',
            estado: true,
            fecha_afilado: '2025-03-15',
            fecha_creacion: '2025-02-20',
            dias: 23
          },
          {
            id: 6,
            sucursal: {
              id: 2,
              nombre: 'BS',
              cliente: {
                id: 2,
                razon_social: 'Cliente B'
              }
            },
            tipo_sierra: 'Cinta',
            codigo_sierra: 'S-0002',
            tipo_afilado: 'pecho',
            estado: false,
            fecha_afilado: '2025-03-22',
            fecha_creacion: '2025-02-20',
            dias: 30
          },
          {
            id: 7,
            sucursal: {
              id: 3,
              nombre: 'CS',
              cliente: {
                id: 3,
                razon_social: 'Cliente C'
              }
            },
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0003',
            tipo_afilado: 'lomo',
            estado: true,
            fecha_afilado: '2025-03-18',
            fecha_creacion: '2025-02-25',
            dias: 21
          },
          {
            id: 8,
            sucursal: {
              id: 3,
              nombre: 'CS',
              cliente: {
                id: 3,
                razon_social: 'Cliente C'
              }
            },
            tipo_sierra: 'Cinta',
            codigo_sierra: 'S-0004',
            tipo_afilado: 'pecho',
            estado: true,
            fecha_afilado: '2025-03-20',
            fecha_creacion: '2025-02-28',
            dias: 20
          }
        ];
        
        setAfilados(datosSimulados);
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
  }, []);

  // Filtrar afilados según los filtros aplicados
  const filteredAfilados = afilados.filter(afilado => {
    // Filtro por cliente
    if (clienteFilter && afilado.sucursal.cliente.id !== parseInt(clienteFilter)) {
      return false;
    }
    
    // Filtro por sucursal
    if (sucursalFilter && afilado.sucursal.id !== parseInt(sucursalFilter)) {
      return false;
    }
    
    // Filtro por fecha desde
    if (fechaDesde && new Date(afilado.fecha_afilado) < fechaDesde) {
      return false;
    }
    
    // Filtro por fecha hasta
    if (fechaHasta && new Date(afilado.fecha_afilado) > fechaHasta) {
      return false;
    }
    
    // Filtro por estado
    if (estadoFilter === 'pendientes' && afilado.estado) {
      return false;
    }
    if (estadoFilter === 'completados' && !afilado.estado) {
      return false;
    }
    
    return true;
  });

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
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
    // Crear filas de datos para el CSV
    const rows = [
      ['Sucursal', 'Cliente', 'Tipo Sierra', 'Código Sierra', 'Tipo Afilado', 'Estado', 'Fecha Afilado', 'Días'],
      ...filteredAfilados.map(a => [
        a.sucursal.nombre,
        a.sucursal.cliente.razon_social,
        a.tipo_sierra,
        a.codigo_sierra,
        a.tipo_afilado,
        a.estado ? 'Completado' : 'Pendiente',
        formatDate(a.fecha_afilado),
        a.dias
      ])
    ];
    
    // Convertir a CSV
    const csvContent = rows.map(row => row.join(',')).join('\n');
    
    // Crear blob y enlace para descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_afilados_sucursal_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para imprimir reporte
  const printReport = () => {
    window.print();
  };

  // Preparar datos para gráficos
  // Afilados por sucursal
  const afiladosPorSucursal = [];
  const sucursalCounts = {};
  
  filteredAfilados.forEach(afilado => {
    const sucursalNombre = afilado.sucursal.nombre;
    if (!sucursalCounts[sucursalNombre]) {
      sucursalCounts[sucursalNombre] = {
        name: sucursalNombre,
        total: 0,
        completados: 0,
        pendientes: 0
      };
    }
    
    sucursalCounts[sucursalNombre].total += 1;
    if (afilado.estado) {
      sucursalCounts[sucursalNombre].completados += 1;
    } else {
      sucursalCounts[sucursalNombre].pendientes += 1;
    }
  });
  
  Object.values(sucursalCounts).forEach(item => {
    afiladosPorSucursal.push(item);
  });
  
  // Datos para gráfico de pastel (distribución por estado)
  const estadoData = [
    { name: 'Completados', value: filteredAfilados.filter(a => a.estado).length },
    { name: 'Pendientes', value: filteredAfilados.filter(a => !a.estado).length }
  ];

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
        <Typography color="text.primary">Afilados por Sucursal</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Reporte de Afilados por Sucursal
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
            sx={{ mr: 1 }}
          >
            Exportar CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={printReport}
          >
            Imprimir
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="center">
            {/* Filtro de Cliente */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="cliente-filter-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-filter-label"
                  value={clienteFilter}
                  onChange={(e) => {
                    setClienteFilter(e.target.value);
                    if (e.target.value === '') {
                      setSucursalFilter('');
                    }
                    setPage(0);
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
            
            {/* Filtro de Sucursal */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="sucursal-filter-label">Sucursal</InputLabel>
                <Select
                  labelId="sucursal-filter-label"
                  value={sucursalFilter}
                  onChange={(e) => {
                    setSucursalFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Sucursal"
                  disabled={!clienteFilter}
                >
                  <MenuItem value="">Todas las sucursales</MenuItem>
                  {sucursales
                    .filter(s => !clienteFilter || s.cliente_id === parseInt(clienteFilter))
                    .map((sucursal) => (
                      <MenuItem key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Filtro de Fecha Desde */}
            <Grid item xs={12} md={2}>
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
            
            {/* Filtro de Fecha Hasta */}
            <Grid item xs={12} md={2}>
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
            
            {/* Filtro de Estado */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="estado-filter-label">Estado</InputLabel>
                <Select
                  labelId="estado-filter-label"
                  value={estadoFilter}
                  onChange={(e) => {
                    setEstadoFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Estado"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="pendientes">Pendientes</MenuItem>
                  <MenuItem value="completados">Completados</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Gráficos y estadísticas */}
      <Box sx={{ mb: 3 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <ChartIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Gráficos y Análisis</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Gráfico de barras por sucursal */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Afilados por Sucursal
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {afiladosPorSucursal.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={afiladosPorSucursal}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="completados" name="Completados" fill={theme.palette.success.main} />
                          <Bar dataKey="pendientes" name="Pendientes" fill={theme.palette.warning.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography variant="body2" color="text.secondary">
                          No hay datos suficientes para generar el gráfico
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              {/* Gráfico de pie de estado */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Distribución por Estado
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {filteredAfilados.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={estadoData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {estadoData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? theme.palette.success.main : theme.palette.warning.main} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography variant="body2" color="text.secondary">
                          No hay datos suficientes para generar el gráfico
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Tabla de afilados */}
      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sucursal</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo Sierra</TableCell>
                    <TableCell>Código Sierra</TableCell>
                    <TableCell>Tipo Afilado</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Afilado</TableCell>
                    <TableCell>Días</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAfilados
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((afilado) => (
                      <TableRow key={afilado.id}>
                        <TableCell>{afilado.sucursal.nombre}</TableCell>
                        <TableCell>{afilado.sucursal.cliente.razon_social}</TableCell>
                        <TableCell>{afilado.tipo_sierra}</TableCell>
                        <TableCell>{afilado.codigo_sierra}</TableCell>
                        <TableCell>{afilado.tipo_afilado}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={afilado.estado ? <CompletedIcon /> : <PendingIcon />}
                            label={afilado.estado ? 'Completado' : 'Pendiente'} 
                            color={afilado.estado ? 'success' : 'warning'} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(afilado.fecha_afilado)}</TableCell>
                        <TableCell>{afilado.dias}</TableCell>
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredAfilados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="text.secondary">
                          No se encontraron afilados que coincidan con los filtros aplicados
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

      {/* Botón flotante de acciones  */}
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

export default ReporteAfiladosSucursal;