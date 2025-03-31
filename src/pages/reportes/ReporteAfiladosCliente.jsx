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
  Warning as PendingIcon,
  PictureAsPdf as PdfIcon,
  FilePresent as ExcelIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import clienteService from '../../services/clienteService';
import afiladoService from '../../services/afiladoService';
import * as XLSX from 'xlsx';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import logoImg from '../../assets/logo.png';

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

  // Función para cargar datos reales
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar clientes
      const clientesResponse = await clienteService.getAllClientes();
      if (clientesResponse.success) {
        setClientes(clientesResponse.data);
      }
      
      // Cargar datos de afilados reales
      const afiladosResponse = await afiladoService.getAllAfilados();
      if (afiladosResponse.success) {

      




// Código actualizado para usar el nuevo endpoint con fecha_registro
const procesados = afiladosResponse.data.map(afilado => {
  // Obtener objeto sierra
  const sierraObj = afilado.sierras || {};
  
  // Ahora el nuevo endpoint debería proporcionar fecha_registro
  const fechaRegistroSierra = sierraObj.fecha_registro;
  
  // Fecha de afilado
  const fechaAfiladoStr = afilado.fecha_afilado;
  
  // Calcular días entre fechas
  let dias = 0;
  
  if (fechaRegistroSierra && fechaAfiladoStr) {
    try {
      const fechaRegistro = new Date(fechaRegistroSierra);
      const fechaAfilado = new Date(fechaAfiladoStr);
      
      if (!isNaN(fechaRegistro) && !isNaN(fechaAfilado)) {
        // Calcular días transcurridos, asegurando valor no negativo
        dias = Math.max(0, differenceInDays(fechaAfilado, fechaRegistro));
        
        // Log opcional para verificar funcionamiento
        console.log(`Afilado ID ${afilado.id} - Cálculo de días:`, {
          fechaRegistro: fechaRegistro.toISOString(),
          fechaAfilado: fechaAfilado.toISOString(),
          dias
        });
      }
    } catch (error) {
      console.error(`Error calculando días para afilado ID ${afilado.id}:`, error);
    }
  } else {
    // Fallback a created_at si por alguna razón fecha_registro no está disponible
    const fechaAlternativa = sierraObj.created_at || afilado.created_at;
    
    if (fechaAlternativa && fechaAfiladoStr) {
      try {
        const fechaCreacion = new Date(fechaAlternativa);
        const fechaAfilado = new Date(fechaAfiladoStr);
        
        if (!isNaN(fechaCreacion) && !isNaN(fechaAfilado)) {
          dias = Math.max(0, differenceInDays(fechaAfilado, fechaCreacion));
        }
      } catch (error) {
        console.error(`Error con fecha alternativa para afilado ID ${afilado.id}:`, error);
      }
    }
  }
  
  return {
    id: afilado.id,
    sucursal: sierraObj.sucursales?.nombre || 'No especificada',
    tipo_sierra: sierraObj.tipos_sierra?.nombre || 'No especificado',
    codigo_sierra: sierraObj.codigo_barra || sierraObj.codigo || 'No especificado',
    tipo_afilado: afilado.tipos_afilado?.nombre || 'No especificado',
    estado: !!afilado.fecha_salida, // true si tiene fecha de salida (completado)
    fecha_afilado: fechaAfiladoStr,
    fecha_salida: afilado.fecha_salida,
    fecha_creacion: fechaRegistroSierra || sierraObj.created_at || afilado.created_at || 'No disponible',
    dias: dias,
    cliente: {
      id: sierraObj.sucursales?.clientes?.id || 0,
      razon_social: sierraObj.sucursales?.clientes?.razon_social || 'No especificado'
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

  // Quitar acentos de un texto
  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Calcular estadísticas
  const totalAfilados = filteredAfilados.length;
  const afiladosPendientes = filteredAfilados.filter(a => !a.estado).length;
  const afiladosCompletados = filteredAfilados.filter(a => a.estado).length;
  const promedioDias = filteredAfilados.reduce((sum, a) => sum + a.dias, 0) / (totalAfilados || 1);

  // Función para exportar a Excel (XLSX)
  const exportToExcel = () => {
    // Título del reporte
    const title = [['REPORTE DE AFILADOS POR CLIENTE']];
    const subtitle = [[`Generado el ${new Date().toLocaleDateString()}`]];
    const blank = [['']];
    
    // Encabezados
    const headers = [['Sucursal', 'Tipo Sierra', 'Codigo Sierra', 'Tipo Afilado', 'Estado', 'Fecha Afilado', 'Fecha Salida', 'Fecha Creacion', 'Dias']];
    
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
      a.dias
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
      {wch: 10}  // Días
    ];
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, "Afilados");
    
    // Generar archivo y descargar
    XLSX.writeFile(wb, `reporte_afilados_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Ya no añadimos el logo
    // try {
    //   const img = new Image();
    //   img.src = logoImg;
    //   doc.addImage(img, 'PNG', 10, 10, 30, 30);
    // } catch (error) {
    //   console.error('Error al cargar el logo:', error);
    // }
    
    // Ajustar posición del título (elevarlo ya que no hay logo)
    doc.setFontSize(18);
    doc.text('REPORTE DE AFILADOS POR CLIENTE', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    // Ajustar posición del subtítulo
    doc.setFontSize(12);
    doc.text(`Generado el ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, 25, { align: 'center' });
    
    // Ajustar posición de las estadísticas
    doc.setFontSize(10);
    doc.text(`Total: ${totalAfilados}  |  Completados: ${afiladosCompletados}  |  Pendientes: ${afiladosPendientes}  |  Promedio Dias: ${promedioDias.toFixed(1)}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // El resto del código sigue igual
    // Definir encabezados y datos de tabla
    const headers = [['Sucursal', 'Tipo Sierra', 'Codigo Sierra', 'Tipo Afilado', 'Estado', 'Fecha Afilado', 'Fecha Salida', 'Fecha Creacion', 'Dias']];
    
    const data = filteredAfilados.map(a => [
      a.sucursal,
      a.tipo_sierra,
      a.codigo_sierra,
      a.tipo_afilado,
      a.estado ? 'Completado' : 'Pendiente',
      formatDate(a.fecha_afilado),
      formatDate(a.fecha_salida),
      formatDate(a.fecha_creacion),
      a.dias
    ]);
    
    // Usar método alternativo para crear la tabla si doc.autoTable no funciona
    // Aquí puedes usar la implementación manual que te proporcioné anteriormente
    // o intentar usar autoTable nuevamente
    
    // Si estás usando la biblioteca autoTable correctamente importada:
    if (typeof autoTable === 'function') {
      autoTable(doc, {
        startY: 45, // Ajustado porque eliminamos el logo
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 45 },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 8
        },
        columnStyles: {
          8: { halign: 'right' }
        }
      });
    } else {
      // Aquí implementación manual si autoTable no está disponible
      console.warn('autoTable no está disponible, usando método alternativo');
      // ... código alternativo ...
    }
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Pagina ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }
    
    // Guardar el PDF
    doc.save(`reporte_afilados_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Función para imprimir reporte
  const printReport = () => {
    // Guardar estado original
    const originalTitle = document.title;
    
    // Cambiar título para la impresión
    document.title = `Reporte de Afilados - ${new Date().toLocaleDateString()}`;
    
    // Imprimir
    window.print();
    
    // Restaurar título original
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
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
            color="success"
            startIcon={<ExcelIcon />}
            onClick={exportToExcel}
            sx={{ mr: 1 }}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<PdfIcon />}
            onClick={exportToPDF}
            sx={{ mr: 1 }}
          >
            PDF
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
          <Typography variant="subtitle2" color="text.secondary">Promedio Dias</Typography>
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
                    <TableCell>Codigo Sierra</TableCell>
                    <TableCell>Tipo Afilado</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Afilado</TableCell>
                    <TableCell>Fecha Salida</TableCell>
                    <TableCell>Fecha Creacion</TableCell>
                    <TableCell>Dias</TableCell>
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
                        <TableCell>{afilado.dias}</TableCell>
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
              boxShadow: 3,
              mr: 1
            }}
            onClick={exportToExcel}
          >
            <ExcelIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="PDF">
          <IconButton 
            color="error" 
            size="large" 
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 3,
              mr: 1
            }}
            onClick={exportToPDF}
          >
            <PdfIcon />
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
          
          /* Ocultar elementos que no queremos imprimir */
          nav, header, footer, button, .no-print {
            display: none !important;
          }
          
          /* Asegurar que el contenido principal sea visible */
          .MuiTableContainer-root, 
          .MuiTableContainer-root *,
          .MuiCard-root,
          .MuiCard-root * {
            visibility: visible !important;
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          /* Estilos específicos para la impresión */
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Hacer que las estadísticas siempre sean visibles en impresión */
          .print-only {
            display: block !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default ReporteAfiladosCliente;