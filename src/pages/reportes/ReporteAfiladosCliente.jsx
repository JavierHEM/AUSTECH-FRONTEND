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
  DateRange as DateRangeIcon,
  Business as BusinessIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  CheckCircleOutline as CompletedIcon,
  Warning as PendingIcon,
  FilePresent as ExcelIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import clienteService from '../../services/clienteService';
import afiladoService from '../../services/afiladoService';
import sucursalService from '../../services/sucursalService';
import * as XLSX from 'xlsx';

const ReporteAfiladosCliente = ({ clienteFilter = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados para los datos
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState(null); // ID del cliente para filtrar
  const [clienteInfo, setClienteInfo] = useState(null);
  const [afilados, setAfilados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [selectedClienteFilter, setSelectedClienteFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [tipoAfiladoFilter, setTipoAfiladoFilter] = useState('');
  const [tipoSierraFilter, setTipoSierraFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos'); // 'todos', 'pendientes', 'completados'
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Función para cargar datos del cliente actual si es necesario
  const loadClienteData = async () => {
    // Si clienteFilter es true, el usuario es un cliente y debemos filtrar por su cliente_id
    if (clienteFilter && user) {
      try {
        // Obtener sucursales vinculadas para determinar el cliente
        const sucursalesResponse = await sucursalService.obtenerSucursalesVinculadasUsuario();
        
        if (sucursalesResponse.success && sucursalesResponse.data.length > 0) {
          const clienteId = sucursalesResponse.data[0].cliente_id;
          setClienteId(clienteId);
          
          // Intentar obtener info del cliente si está disponible
          if (sucursalesResponse.data[0].cliente) {
            setClienteInfo(sucursalesResponse.data[0].cliente);
          } else {
            // Para el cliente Imperial, establecer datos manuales conocidos
            setClienteInfo({
              id: clienteId,
              razon_social: 'Imperial S.A.',
              rut: '76821330-5',
              direccion: 'Av. Santa Rosa N°7.876, oficina 401',
              telefono: '223997000',
              email: 'jeferret@imperial.cl'
            });
          }
          
          // Establecer el filtro automáticamente
          setSelectedClienteFilter(clienteId.toString());
          
          return clienteId;
        }
      } catch (error) {
        console.error("Error al obtener cliente del usuario:", error);
        setError("No se pudo determinar su cliente. Contacte al administrador.");
      }
    }
    return null;
  };

  // Función para cargar datos reales
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Si es cliente, determinar su cliente_id
      const filteredClienteId = await loadClienteData();
      
      // Cargar clientes (solo para administradores/gerentes)
      if (!clienteFilter) {
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
        }
      }
      
      // Cargar datos de afilados reales - filtrados por cliente si es necesario
      const afiladosResponse = filteredClienteId 
        ? await afiladoService.getAfiladosByCliente(filteredClienteId)
        : await afiladoService.getAllAfilados();
      
      if (afiladosResponse.success) {
        // Procesar los datos de afilados
      // Modificar la función de procesamiento de datos en loadData()
      const procesados = afiladosResponse.data.map(afilado => {
        // Obtener objeto sierra
        const sierraObj = afilado.sierras || {};
        
        // Fecha de afilado
        const fechaAfiladoStr = afilado.fecha_afilado;
        
        return {
          id: afilado.id,
          sucursal: sierraObj.sucursales?.nombre || 'No especificada',
          tipo_sierra: sierraObj.tipos_sierra?.nombre || 'No especificado',
          codigo_sierra: sierraObj.codigo_barra || sierraObj.codigo || 'No especificado',
          tipo_afilado: afilado.tipos_afilado?.nombre || 'No especificado',
          estado: !!afilado.fecha_salida, // true si tiene fecha de salida (completado)
          fecha_afilado: fechaAfiladoStr,
          fecha_salida: afilado.fecha_salida,
          fecha_creacion: sierraObj.fecha_registro || sierraObj.created_at || afilado.created_at || 'No disponible',
          ultimo_afilado: afilado.ultimo_afilado === true, // Cargar último afilado
          cliente: {
            id: sierraObj.sucursales?.cliente_id || 0,
            razon_social: sierraObj.sucursales?.cliente?.razon_social || 'No especificado'
          }
        };
      });
        
        setAfilados(procesados);
      } else {
        setError('Error al cargar los datos de afilados');
      }
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError('Error al cargar los datos. Por favor, intentelo de nuevo.');
      
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar afilados según los filtros aplicados
  const filteredAfilados = afilados.filter(afilado => {
    // Filtro por cliente (si no es un cliente viendo su propio reporte)
    if (!clienteFilter && selectedClienteFilter && afilado.cliente.id !== parseInt(selectedClienteFilter)) {
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

  // Quitar acentos de un texto
  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Función para exportar a Excel (XLSX) actualizada
  const exportToExcel = () => {
    // Título del reporte
    const title = [['REPORTE DE AFILADOS POR CLIENTE']];
    const subtitle = [[`Generado el ${new Date().toLocaleDateString()}`]];
    const blank = [['']];
    
    // Encabezados actualizados
    const headers = [['Sucursal', 'Tipo Sierra', 'Codigo Sierra', 'Tipo Afilado', 'Estado', 'Fecha Afilado', 'Fecha Salida', 'Fecha Creacion', 'Último Afilado']];
    
    // Datos para el excel - sin acentos
    const data = filteredAfilados.map(a => [
      removeAccents(a.sucursal),
      removeAccents(a.tipo_sierra),
      a.codigo_sierra,
      removeAccents(a.tipo_afilado),
      a.estado ? 'Completado' : 'Pendiente',
      formatDate(a.fecha_afilado),
      formatDate(a.fecha_salida),
      formatDate(a.fecha_creacion),
      a.ultimo_afilado === true ? 'Activa' : 'Inactiva' // Cambiado a mostrar estado en lugar de fecha
    ]);
    
    // Crear workbook
    const ws = XLSX.utils.aoa_to_sheet([...title, ...subtitle, ...blank, ...headers, ...data]);
    const wb = XLSX.utils.book_new();
    
    // Estilizar título (merge cells)
    const titleRange = {s: {r: 0, c: 0}, e: {r: 0, c: 8}};
    const subtitleRange = {s: {r: 1, c: 0}, e: {r: 1, c: 8}};
    
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(titleRange);
    ws['!merges'].push(subtitleRange);
    
    // Ajustar el ancho de las columnas
    const wscols = [
      {wch: 15}, // Sucursal
      {wch: 15}, // Tipo Sierra
      {wch: 15}, // Código Sierra
      {wch: 15}, // Tipo Afilado
      {wch: 15}, // Estado
      {wch: 15}, // Fecha Afilado
      {wch: 15}, // Fecha Salida
      {wch: 15}, // Fecha Creación
      {wch: 15}  // Último Afilado
    ];
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, "Afilados");
    
    // Generar archivo y descargar
    XLSX.writeFile(wb, `reporte_afilados_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
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
        <Typography color="text.primary">
          {clienteFilter && clienteInfo 
            ? `Afilados de ${clienteInfo.razon_social}` 
            : "Afilados por Cliente"}
        </Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {clienteFilter && clienteInfo 
            ? `Reporte de Afilados - ${clienteInfo.razon_social}` 
            : "Reporte de Afilados por Cliente"}
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
            color="success"
            startIcon={<ExcelIcon />}
            onClick={exportToExcel}
            sx={{ mr: 1 }}
          >
            Excel
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
            {/* Filtro de Cliente - Solo visible para gerentes/administradores */}
            {!clienteFilter && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="cliente-filter-label">Cliente</InputLabel>
                  <Select
                    labelId="cliente-filter-label"
                    value={selectedClienteFilter}
                    onChange={(e) => {
                      setSelectedClienteFilter(e.target.value);
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
            )}
            
            {/* Filtro de Fecha Desde */}
            <Grid item xs={12} md={clienteFilter ? 3 : 2}>
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
            <Grid item xs={12} md={clienteFilter ? 3 : 2}>
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
            <Grid item xs={12} md={clienteFilter ? 2 : 2}>
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
            <Grid item xs={12} md={clienteFilter ? 2 : 2}>
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
            <Grid item xs={12} md={clienteFilter ? 2 : 1}>
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
                    <TableCell>Codigo Sierra</TableCell>
                    <TableCell>Tipo Afilado</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Afilado</TableCell>
                    <TableCell>Fecha Salida</TableCell>
                    <TableCell>Fecha Creacion</TableCell>
                    <TableCell>Estado Sierra</TableCell>
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
                        <TableCell>{formatDate(afilado.fecha_salida)}</TableCell>
                        <TableCell>{formatDate(afilado.fecha_creacion)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={afilado.ultimo_afilado ? 'Activa' : 'Inactiva'} 
                            color={afilado.ultimo_afilado ? 'success' : 'error'} 
                            variant={afilado.ultimo_afilado ? 'filled' : 'outlined'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredAfilados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
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
                labelRowsPerPage="Filas por pagina:"
              />
            </>
          )}
        </TableContainer>
      </Card>
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
        <Tooltip title="Excel">
          <IconButton 
            color="success" 
            size="large" 
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 3
            }}
            onClick={exportToExcel}
          >
            <ExcelIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ReporteAfiladosCliente;