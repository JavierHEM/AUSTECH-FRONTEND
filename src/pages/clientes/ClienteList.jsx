// src/pages/clientes/ClienteList.jsx
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
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ClienteList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para manejar si el usuario puede agregar/editar clientes
  const canManageClientes = user?.rol === 'Gerente' || user?.rol === 'Administrador';

  // Función para cargar la lista de clientes
  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/clientes');
      if (response.data.success) {
        setClientes(response.data.data);
      } else {
        setError('Error al cargar los clientes');
      }
    } catch (err) {
      console.error('Error al obtener clientes:', err);
      setError('Error al cargar los clientes. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
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

  // Función para filtrar clientes
  const filteredClientes = clientes.filter((cliente) => {
    const searchFields = [
      cliente.razon_social,
      cliente.rut,
      cliente.email,
      cliente.direccion,
    ].join(' ').toLowerCase();
    
    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Función para manejar la eliminación de un cliente
  const handleDeleteCliente = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        const response = await api.delete(`/clientes/${id}`);
        if (response.data.success) {
          loadClientes(); // Recargar la lista
        } else {
          alert('Error al eliminar el cliente');
        }
      } catch (err) {
        console.error('Error al eliminar cliente:', err);
        alert('Error al eliminar el cliente. Por favor, inténtelo de nuevo.');
      }
    }
  };

  return (
    <Box>
      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Clientes
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadClientes}
            sx={{ mr: 1 }}
          >
            Actualizar
          </Button>
          {canManageClientes && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/clientes/nuevo')}
            >
              Nuevo Cliente
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar clientes..."
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
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de clientes */}
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
                    <TableCell>Razón Social</TableCell>
                    <TableCell>RUT</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Sucursales</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClientes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <BusinessIcon 
                              fontSize="small" 
                              color="primary" 
                              sx={{ mr: 1 }} 
                            />
                            <Typography fontWeight="medium">
                              {cliente.razon_social}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{cliente.rut}</TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell>{cliente.direccion}</TableCell>
                        <TableCell>{cliente.telefono}</TableCell>
                        <TableCell>
                          {cliente.sucursales && Array.isArray(cliente.sucursales) ? (
                            <Chip 
                              label={`${cliente.sucursales.length} sucursales`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              onClick={() => navigate(`/sucursales?cliente=${cliente.id}`)} 
                            />
                          ) : (
                            <Chip 
                              label="Sin sucursales" 
                              size="small" 
                              color="default" 
                              variant="outlined" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/clientes/${cliente.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {canManageClientes && (
                            <>
                              <Tooltip title="Editar">
                                <IconButton
                                  color="secondary"
                                  onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteCliente(cliente.id)}
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
                  {filteredClientes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron clientes
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredClientes.length}
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

export default ClienteList;