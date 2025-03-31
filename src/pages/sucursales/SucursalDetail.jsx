// src/pages/sucursales/SucursalDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme
} from '@mui/material';
import {
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  ContentCut as SierraIcon,
  InfoOutlined as InfoIcon,
  History as HistoryIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import sucursalService from '../../services/sucursalService';
import sierraService from '../../services/sierraService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SucursalDetail = ({ clienteFilter = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [sucursal, setSucursal] = useState(null);
  const [sierras, setSierras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Paginación para sierras
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Estado para manejar si el usuario puede editar sucursales
  const canManageSucursales = user?.rol === 'Gerente' || user?.rol === 'Administrador';

  useEffect(() => {
    const loadSucursalData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar sucursal
        const sucursalResponse = await sucursalService.getSucursalById(id);
        if (!sucursalResponse.success) {
          throw new Error(sucursalResponse.error);
        }
        setSucursal(sucursalResponse.data);
        
        // Verificar permisos para clientes
        if (clienteFilter && user?.cliente_id && sucursalResponse.data.cliente_id !== user.cliente_id) {
          navigate("/acceso-denegado");
          return;
        }
        
        // Cargar sierras
        const sierrasResponse = await sierraService.getSierrasBySucursal(id);
        if (sierrasResponse.success) {
          setSierras(sierrasResponse.data);
        }
      } catch (err) {
        console.error('Error al cargar datos de la sucursal:', err);
        setError('Error al cargar la información de la sucursal. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSucursalData();
  }, [id, clienteFilter, user, navigate]);

  const handleDelete = async () => {
    setConfirmDelete(false);
    setLoading(true);
    
    try {
      const response = await sucursalService.deleteSucursal(id);
      if (response.success) {
        navigate('/sucursales', { 
          state: { 
            message: 'Sucursal eliminada correctamente',
            severity: 'success'
          } 
        });
      } else {
        setError(response.error || 'Error al eliminar la sucursal');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al eliminar sucursal:', err);
      setError('Error al eliminar la sucursal. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  // Funciones para manejar la paginación de sierras
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!sucursal) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Sucursal no encontrada
      </Alert>
    );
  }

  return (
    <Box>
      {/* Navegación de migas de pan */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/sucursales" underline="hover" color="inherit">
          Sucursales
        </Link>
        <Typography color="text.primary">{sucursal.nombre}</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sucursales')}
        >
          Volver a Sucursales
        </Button>
        
        {canManageSucursales && (
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/sucursales/${id}/editar`)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar
            </Button>
          </Box>
        )}
      </Box>

      {/* Información principal de la sucursal */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={1}>
              <Box 
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LocationIcon sx={{ fontSize: 32 }} />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={11}>
              <Typography variant="h4" component="h1" gutterBottom>
                {sucursal.nombre}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  icon={<BusinessIcon />} 
                  label={sucursal.clientes?.razon_social || 'Cliente no disponible'} 
                  variant="outlined" 
                  component={RouterLink}
                  to={`/clientes/${sucursal.cliente_id}`}
                  clickable
                />
                <Chip 
                  icon={<PhoneIcon />} 
                  label={sucursal.telefono} 
                  variant="outlined" 
                  component="a"
                  href={`tel:${sucursal.telefono}`}
                  clickable
                />
                <Chip 
                  icon={<LocationIcon />} 
                  label={sucursal.direccion} 
                  variant="outlined" 
                  component="a"
                  href={`https://maps.google.com/?q=${encodeURIComponent(sucursal.direccion)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                />
                <Chip 
                  icon={<SierraIcon />} 
                  label={`${sierras.length} Sierras`} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección de Sierras */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Sierras de la Sucursal</Typography>
            {canManageSucursales && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/sierras/nueva', { 
                  state: { 
                    sucursalId: sucursal.id, 
                    sucursalNombre: sucursal.nombre,
                    clienteId: sucursal.cliente_id,
                    clienteNombre: sucursal.clientes?.razon_social 
                  } 
                })}
              >
                Nueva Sierra
              </Button>
            )}
          </Box>

          {sierras.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                Esta sucursal no tiene sierras registradas.
              </Typography>
              {canManageSucursales && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/sierras/nueva', { 
                    state: { 
                      sucursalId: sucursal.id, 
                      sucursalNombre: sucursal.nombre,
                      clienteId: sucursal.cliente_id,
                      clienteNombre: sucursal.clientes?.razon_social 
                    } 
                  })}
                  sx={{ mt: 2 }}
                >
                  Registrar Sierra
                </Button>
              )}
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="tabla de sierras">
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Registro</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sierras
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sierra) => (
                      <TableRow
                        key={sierra.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          <Box display="flex" alignItems="center">
                            <SierraIcon color="secondary" sx={{ mr: 1 }} />
                            <Typography fontWeight="medium">
                              {sierra.codigo_barra}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{sierra.tipos_sierra?.nombre || 'No especificado'}</TableCell>
                        <TableCell>{sierra.estados_sierra?.nombre || 'No especificado'}</TableCell>
                        <TableCell>{formatDate(sierra.fecha_registro)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={sierra.activo ? 'Activa' : 'Inactiva'} 
                            color={sierra.activo ? 'success' : 'error'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver Detalle">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/sierras/${sierra.id}`)}
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Registrar Afilado">
                            <IconButton
                              color="secondary"
                              onClick={() => navigate('/afilados/nuevo', {
                                state: { sierraId: sierra.id, sierraCodigo: sierra.codigo_barra }
                              })}
                            >
                              <BuildIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Historial de Afilados">
                            <IconButton
                              color="info"
                              onClick={() => navigate(`/afilados?sierra=${sierra.id}`)}
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                  {sierras.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay sierras registradas para esta sucursal
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sierras.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Eliminar sucursal?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar la sucursal "{sucursal.nombre}"? Esta acción no se puede deshacer y podría afectar a las sierras asociadas.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SucursalDetail;