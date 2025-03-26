// src/pages/catalogos/EstadoSierraList.jsx
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Breadcrumbs,
  Link as MuiLink,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  ContentCut as SierraIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import catalogoService from '../../services/catalogoService';

const EstadoSierraList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estado para el diálogo de crear/editar
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' o 'edit'
  const [currentEstado, setCurrentEstado] = useState({ nombre: '', descripcion: '' });
  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Estado para el diálogo de eliminar
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [estadoToDelete, setEstadoToDelete] = useState(null);

  // Verificar si el usuario tiene permisos
  const canManage = user?.rol === 'Administrador' || user?.rol === 'Gerente';

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogoService.getEstadosSierra();
      if (response.success) {
        setEstados(response.data);
      } else {
        setError('Error al cargar los estados de sierra');
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

  // Filtrar estados de sierra
  const filteredEstados = estados.filter((estado) => {
    const searchFields = [
      estado.nombre,
      estado.descripcion || '',
    ].join(' ').toLowerCase();
    
    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Funciones para manejar el diálogo de crear/editar
  const handleOpenCreateDialog = () => {
    setCurrentEstado({ nombre: '', descripcion: '' });
    setDialogMode('create');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (estado) => {
    setCurrentEstado({ ...estado });
    setDialogMode('edit');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEstado({ ...currentEstado, [name]: value });
  };

  const handleSaveEstado = async () => {
    // Validación básica
    if (!currentEstado.nombre.trim()) {
      setDialogError('El nombre es requerido');
      return;
    }

    setDialogLoading(true);
    setDialogError('');

    try {
      let response;
      if (dialogMode === 'create') {
        response = await catalogoService.createEstadoSierra(currentEstado);
      } else {
        response = await catalogoService.updateEstadoSierra(currentEstado.id, currentEstado);
      }

      if (response.success) {
        handleCloseDialog();
        loadData(); // Recargar la lista
      } else {
        setDialogError(response.error || `Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el estado de sierra`);
      }
    } catch (err) {
      console.error('Error:', err);
      setDialogError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el estado de sierra`);
    } finally {
      setDialogLoading(false);
    }
  };

  // Funciones para manejar el diálogo de eliminar
  const handleOpenDeleteDialog = (estado) => {
    setEstadoToDelete(estado);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setEstadoToDelete(null);
  };

  const handleDeleteEstado = async () => {
    if (!estadoToDelete) return;

    setLoading(true);
    try {
      const response = await catalogoService.deleteEstadoSierra(estadoToDelete.id);
      if (response.success) {
        loadData(); // Recargar la lista
      } else {
        setError(response.error || 'Error al eliminar el estado de sierra');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar el estado de sierra');
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/catalogos" color="inherit">
          Catálogos
        </MuiLink>
        <Typography color="text.primary">Estados de Sierra</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Estados de Sierra
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
          {canManage && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Nuevo Estado
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Buscar estados de sierra..."
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

      {/* Tabla de estados de sierra */}
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
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    {canManage && <TableCell align="right">Acciones</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEstados
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((estado) => (
                      <TableRow key={estado.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SierraIcon 
                              fontSize="small" 
                              color="info" 
                              sx={{ mr: 1 }} 
                            />
                            <Typography fontWeight="medium">{estado.nombre}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{estado.descripcion}</TableCell>
                        {canManage && (
                          <TableCell align="right">
                            <Tooltip title="Editar">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenEditDialog(estado)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDeleteDialog(estado)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredEstados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canManage ? 3 : 2} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron estados de sierra
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredEstados.length}
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

      {/* Diálogo para crear/editar estados de sierra */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Crear Nuevo Estado de Sierra' : 'Editar Estado de Sierra'}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="nombre"
            label="Nombre"
            type="text"
            fullWidth
            value={currentEstado.nombre}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="descripcion"
            label="Descripción"
            type="text"
            fullWidth
            value={currentEstado.descripcion || ''}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEstado}
            variant="contained"
            color="primary"
            startIcon={dialogLoading ? <CircularProgress size={24} /> : <SaveIcon />}
            disabled={dialogLoading}
          >
            {dialogMode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el estado de sierra "{estadoToDelete?.nombre}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteEstado} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EstadoSierraList;