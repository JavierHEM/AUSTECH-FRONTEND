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
  Link as MuiLink
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ContentCut as SierraIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import sucursalService from '../../services/sucursalService';
import clienteService from '../../services/clienteService';
import sierraService from '../../services/sierraService';

const SucursalList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sierrasPorSucursal, setSierrasPorSucursal] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para manejar si el usuario puede agregar/editar sucursales
  const canManageSucursales = user?.rol === 'Gerente' || user?.rol === 'Administrador';

  // Función para cargar la lista de sucursales
  const loadSucursales = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primero cargamos los clientes para tener la información completa
      const clientesResponse = await clienteService.getAllClientes();
      if (clientesResponse.success) {
        const clientesMap = {};
        clientesResponse.data.forEach(cliente => {
          clientesMap[cliente.id] = cliente;
        });
        setClientes(clientesResponse.data);
        
        // Luego cargamos las sucursales
        const response = await sucursalService.getAllSucursales();
        if (response.success) {
          // Enriquecemos los datos de las sucursales con información completa del cliente
          const sucursalesEnriquecidas = response.data.map(sucursal => {
            const clienteCompleto = clientesMap[sucursal.cliente_id];
            return {
              ...sucursal,
              clientes: clienteCompleto || sucursal.clientes
            };
          });
          
          setSucursales(sucursalesEnriquecidas);
          
          // Obtener la cantidad de sierras para cada sucursal
          const sierrasData = {};
          for (const sucursal of response.data) {
            try {
              const sierrasResponse = await sierraService.getSierrasBySucursal(sucursal.id);
              if (sierrasResponse.success) {
                sierrasData[sucursal.id] = sierrasResponse.data.length;
              } else {
                sierrasData[sucursal.id] = 0;
              }
            } catch (err) {
              console.error(`Error al obtener sierras para sucursal ${sucursal.id}:`, err);
              sierrasData[sucursal.id] = 0;
            }
          }
          setSierrasPorSucursal(sierrasData);
        } else {
          setError('Error al cargar las sucursales');
        }
      } else {
        setError('Error al cargar los clientes');
      }
    } catch (err) {
      console.error('Error al obtener sucursales o clientes:', err);
      setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSucursales();
  }, []);

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
      sucursal.nombre,
      sucursal.direccion,
      sucursal.telefono,
      sucursal.clientes?.razon_social || '',
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    // Filtrar por cliente
    const matchesCliente = clienteFilter === '' || sucursal.cliente_id === parseInt(clienteFilter);
    
    return matchesSearch && matchesCliente;
  });

  // Función para manejar la eliminación de una sucursal
  const handleDeleteSucursal = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta sucursal?')) {
      try {
        const response = await sucursalService.deleteSucursal(id);
        if (response.success) {
          loadSucursales(); // Recargar la lista
        } else {
          alert('Error al eliminar la sucursal');
        }
      } catch (err) {
        console.error('Error al eliminar sucursal:', err);
        alert('Error al eliminar la sucursal. Por favor, inténtelo de nuevo.');
      }
    }
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        <Typography color="text.primary">Sucursales</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Sucursales
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSucursales}
            sx={{ mr: 1 }}
          >
            Actualizar
          </Button>
          {canManageSucursales && (
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="cliente-filter-label">Filtrar por Cliente</InputLabel>
                <Select
                  labelId="cliente-filter-label"
                  value={clienteFilter}
                  onChange={(e) => setClienteFilter(e.target.value)}
                  label="Filtrar por Cliente"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon color="action" fontSize="small" />
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
                    <TableCell>Cliente</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell>Teléfono</TableCell>
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
                              color="secondary" 
                              sx={{ mr: 1 }} 
                            />
                            <Typography fontWeight="medium">
                              {sucursal.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {sucursal.cliente_id ? (
                            <Box 
                              component={Link} 
                              to={`/clientes/${sucursal.cliente_id}`}
                              sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'inherit',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {sucursal.clientes?.razon_social || (
                                <Typography component="span" color="warning.main">
                                  Cliente no disponible (ID: {sucursal.cliente_id})
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography color="error">
                              <BusinessIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                              Sin cliente asignado
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{sucursal.direccion}</TableCell>
                        <TableCell>{sucursal.telefono}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={<SierraIcon fontSize="small" />}
                            label={`${sierrasPorSucursal[sucursal.id] || 0} sierras`}
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            onClick={() => navigate(`/sierras?sucursal=${sucursal.id}`)} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/sucursales/${sucursal.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {canManageSucursales && (
                            <>
                              <Tooltip title="Editar">
                                <IconButton
                                  color="secondary"
                                  onClick={() => navigate(`/sucursales/${sucursal.id}/editar`)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteSucursal(sucursal.id)}
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
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="textSecondary">
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
    </Box>
  );
};

export default SucursalList;