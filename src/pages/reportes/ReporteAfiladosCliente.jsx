// src/pages/reportes/ReporteAfiladosCliente.jsx
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
  AccordionDetails
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
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  CheckCircleOutline as CompletedIcon,
  Warning as PendingIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import clienteService from '../../services/clienteService';
import afiladoService from '../../services/afiladoService';

const ReporteAfiladosCliente = () => {
  const navigate = useNavigate();
  
  // Estados para los datos
  const [clientes, setClientes] = useState([]);
  const [afilados, setAfilados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [clienteFilter, setClienteFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [tipoAfiladoFilter, setTipoAfiladoFilter] = useState('');
  const [tipoSierraFilter, setTipoSierraFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos'); // 'todos', 'pendientes', 'completados'
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      
      // Cargar datos de afilados (simulados para este ejemplo)
      // En una implementación real, esto se obtendría del API
      setTimeout(() => {
        // Simulación de datos de afilado basado en el ejemplo proporcionado
        const datosSimulados = [
          {
            id: 1,
            sucursal: 'AS',
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'lomo',
            estado: true,
            fecha_afilado: '2025-03-03',
            fecha_creacion: '2025-02-18',
            dias: 13,
            cliente: {
              id: 1,
              razon_social: 'Cliente A'
            }
          },
          {
            id: 2,
            sucursal: 'AS',
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'lomo',
            estado: true,
            fecha_afilado: '2025-03-10',
            fecha_creacion: '2025-02-18',
            dias: 20,
            cliente: {
              id: 1,
              razon_social: 'Cliente A'
            }
          },
          {
            id: 3,
            sucursal: 'AS',
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'pecho',
            estado: true,
            fecha_afilado: '2025-03-03',
            fecha_creacion: '2025-02-18',
            dias: 13,
            cliente: {
              id: 1,
              razon_social: 'Cliente A'
            }
          },
          {
            id: 4,
            sucursal: 'AS',
            tipo_sierra: 'Circular',
            codigo_sierra: 'S-0001',
            tipo_afilado: 'pecho',
            estado: false,
            fecha_afilado: '2025-03-28',
            fecha_creacion: '2025-02-18',
            dias: 38,
            cliente: {
              id: 1,
              razon_social: 'Cliente A'
            }
          },
          {
            id: 5,
            sucursal: 'BS',
            tipo_sierra: 'Cinta',
            codigo_sierra: 'S-0002',
            tipo_afilado: 'lomo',
            estado: true,
            fecha_afilado: '2025-03-15',
            fecha_creacion: '2025-02-20',
            dias: 23,
            cliente: {
              id: 2,
              razon_social: 'Cliente B'
            }
          },
          {
            id: 6,
            sucursal: 'BS',
            tipo_sierra: 'Cinta',
            codigo_sierra: 'S-0002',
            tipo_afilado: 'pecho',
            estado: false,
            fecha_afilado: '2025-03-22',
            fecha_creacion: '2025-02-20',
            dias: 30,
            cliente: {
              id: 2,
              razon_social: 'Cliente B'
            }
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
    if (clienteFilter && afilado.cliente.id !== parseInt(clienteFilter)) {
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
    
    // Filtro por tipo de afilado
    if (tipoAfiladoFilter && afilado.tipo_afilado !== tipoAfiladoFilter) {
      return false;
    }
    
    // Filtro por tipo de sierra
    if (tipoSierraFilter && afilado.tipo_sierra !== tipoSierraFilter) {
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

  // Obtener tipos de sierra únicos para filtro
  const tiposSierra = [...new Set(afilados.map(afilado => afilado.tipo_sierra))];
  
  // Obtener tipos de afilado únicos para filtro
  const tiposAfilado = [...new Set(afilados.map(afilado => afilado.tipo_afilado))];

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
      ['Sucursal', 'Tipo Sierra', 'Código Sierra', 'Tipo Afilado', 'Estado', 'Fecha Afilado', 'Fecha Creación', 'Días'],
      ...filteredAfilados.map(a => [
        a.sucursal,
        a.tipo_sierra,
        a.codigo_sierra,
        a.tipo_afilado,
        a.estado ? 'Completado' : 'Pendiente',
        formatDate(a.fecha_afilado),
        formatDate(a.fecha_creacion),
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
    link.setAttribute('download', `reporte_afilados_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para imprimir reporte
  const printReport = () => {
    window.print();
  };

  // Calcular estadísticas
  const totalAfilados = filteredAfilados.length;
  const afiladosPendientes = filteredAfilados.filter(a => !a.estado).length;
  const afiladosCompletados = filteredAfilados.filter(a => a.estado).length;
  const promedioDias = filteredAfilados.reduce((sum, a) => sum + a.dias, 0) / (totalAfilados || 1);

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
        <Typography color="text.primary">Afilados por Cliente</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Reporte de Afilados por Cliente
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
                    setPage(0);
                  }}
                  label="Cliente"
                  startAdornment={
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" />
                    </InputAdornment>
                  }
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
                      fullWidth: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }
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
                      fullWidth: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Filtro de Tipo Sierra */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="tipo-sierra-filter-label">Tipo Sierra</InputLabel>
                <Select
                  labelId="tipo-sierra-filter-label"
                  value={tipoSierraFilter}
                  onChange={(e) => {
                    setTipoSierraFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Tipo Sierra"
                  startAdornment={
                    <InputAdornment position="start">
                      <SierraIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todos los tipos</MenuItem>
                  {tiposSierra.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Filtro de Tipo Afilado */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="tipo-afilado-filter-label">Tipo Afilado</InputLabel>
                <Select
                  labelId="tipo-afilado-filter-label"
                  value={tipoAfiladoFilter}
                  onChange={(e) => {
                    setTipoAfiladoFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Tipo Afilado"
                  startAdornment={
                    <InputAdornment position="start">
                      <AfiladoIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todos los tipos</MenuItem>
                  {tiposAfilado.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Filtro de Estado */}
            <Grid item xs={12} md={1}>
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

      {/* Estadísticas */}
      <Box className="print-only" sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'primary.lighter', borderLeft: 3, borderColor: 'primary.main' }}>
          <Typography variant="subtitle2" color="text.secondary">Total Afilados</Typography>
          <Typography variant="h4" color="primary.dark">{totalAfilados}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'success.lighter', borderLeft: 3, borderColor: 'success.main' }}>
          <Typography variant="subtitle2" color="text.secondary">Completados</Typography>
          <Typography variant="h4" color="success.dark">{afiladosCompletados}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'warning.lighter', borderLeft: 3, borderColor: 'warning.main' }}>
          <Typography variant="subtitle2" color="text.secondary">Pendientes</Typography>
          <Typography variant="h4" color="warning.dark">{afiladosPendientes}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'info.lighter', borderLeft: 3, borderColor: 'info.main' }}>
          <Typography variant="subtitle2" color="text.secondary">Promedio Días</Typography>
          <Typography variant="h4" color="info.dark">{promedioDias.toFixed(1)}</Typography>
        </Paper>
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
                    <TableCell>Tipo Sierra</TableCell>
                    <TableCell>Código Sierra</TableCell>
                    <TableCell>Tipo Afilado</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Afilado</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                    <TableCell>Días</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAfilados
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((afilado) => (
                      <TableRow key={afilado.id}>
                        <TableCell>{afilado.sucursal}</TableCell>
                        <TableCell>{afilado.tipo_sierra}</TableCell>
                        <TableCell>{afilado.codigo_sierra}</TableCell>
                        <TableCell>{afilado.tipo_afilado}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={afilado.estado ? <CompletedIcon /> : <PendingIcon />}
                            label={afilado.estado ? 'Completado' : 'Pendiente'} 
                            color={afilado.estado ? 'success' : 'warning'} 
                            variant={afilado.estado ? 'filled' : 'outlined'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(afilado.fecha_afilado)}</TableCell>
                        <TableCell>{formatDate(afilado.fecha_creacion)}</TableCell>
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

export default ReporteAfiladosCliente;