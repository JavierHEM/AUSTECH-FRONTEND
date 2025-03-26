// src/pages/catalogos/TipoSierraList.jsx
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
  Block as BlockIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import catalogoService from '../../services/catalogoService';

const TipoSierraList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactivosOnly, setShowInactivosOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estado para el diálogo de crear/editar
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' o 'edit'
  const [currentTipo, setCurrentTipo] = useState({ nombre: '', descripcion: '', activo: true });
  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Estado para el diálogo de eliminar
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState(null);

  // Verificar si el usuario tiene permisos
  const canManage = user?.rol === 'Administrador' || user?.rol === 'Gerente';

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await catalogoService.getTiposSierra();
      if (response.success) {
        setTipos(response.data);
      } else {
        setError('Error al cargar los tipos de sierra');
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

  // Filtrar tipos de sierra
  const filteredTipos = tipos.filter((tipo) => {
    const searchFields = [
      tipo.nombre,
      tipo.descripcion || '',
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesActivo = showInactivosOnly ? !tipo.activo : true;
    
    return matchesSearch && matchesActivo;
  });

  // Funciones para manejar el diálogo de crear/editar
  const handleOpenCreateDialog = () => {
    setCurrentTipo({ nombre: '', descripcion: '', activo: true });
    setDialogMode('create');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (tipo) => {
    setCurrentTipo({ ...tipo });
    setDialogMode('edit');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogError('');
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'activo') {
      setCurrentTipo({ ...currentTipo, [name]: checked });
    } else {
      setCurrentTipo({ ...currentTipo, [name]: value });
    }
  };

  const handleSaveTipo = async () => {
    // Validación básica
    if (!currentTipo.nombre.trim()) {
      setDialogError('El nombre es requerido');
      return;
    }

    setDialogLoading(true);
    setDialogError('');

    try {
      let response;
      if (dialogMode === 'create') {
        response = await catalogoService.createTipoSierra(currentTipo);
      } else {
        response = await catalogoService.updateTipoSierra(currentTipo.id, currentTipo);
      }

      if (response.success) {
        handleCloseDialog();
        loadData(); // Recargar la lista
      } else {
        setDialogError(response.error || `Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el tipo de sierra`);
      }
    } catch (err) {
      console.error('Error:', err);
      setDialogError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el tipo de sierra`);
    } finally {
      setDialogLoading(false);
    }
  };

  // Funciones para manejar el diálogo de eliminar
  const handleOpenDeleteDialog = (tipo) => {
    setTipoToDelete(tipo);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTipoToDelete(null);
  };

  const handleDeleteTipo = async () => {
    if (!tipoToDelete) return;

    setLoading(true);
    try {
      const response = await catalogoService.deleteTipoSierra(tipoToDelete.id);
      if (response.success) {
        loadData(); // Recargar la lista
      } else {
        setError(response.error || 'Error al eliminar el tipo de sierra');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar el tipo de sierra');
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
        <Typography color="text.primary">Tipos de Sierra</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Tipos de Sierra
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
              Nuevo Tipo
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
                placeholder="Buscar tipos de sierra..."
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
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactivosOnly}
                    onChange={(e) => setShowInactivosOnly(e.target.checked)}
                  />
                }
                label="Mostrar solo inactivos"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de tipos de sierra */}
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
                    <TableCell>Estado</TableCell>
                    {canManage && <TableCell align="right">Acciones</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTipos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tipo) => (
                      <TableRow key={tipo.id} sx={{ opacity: tipo.activo ? 1 : 0.6 }}>
                        <TableCell>
                          <Typography fontWeight="medium">{tipo.nombre}</Typography>
                        </TableCell>
                        <TableCell>{tipo.descripcion}</TableCell>
                        <TableCell>
                          <Chip
                            icon={tipo.activo ? <CheckIcon /> : <BlockIcon />}
                            label={tipo.activo ? 'Activo' : 'Inactivo'}
                            color={tipo.activo ? 'success' : 'default'}
                            variant={tipo.activo ? 'filled' : 'outlined'}
                            size="small"
                          />
                        </TableCell>
                        {canManage && (
                          <TableCell align="right">
                            <Tooltip title="Editar">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenEditDialog(tipo)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDeleteDialog(tipo)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredTipos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canManage ? 4 : 3} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron tipos de sierra
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredTipos.length}
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

      {/* Diálogo para crear/editar tipos de sierra */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Crear Nuevo Tipo de Sierra' : 'Editar Tipo de Sierra'}
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
            value={currentTipo.nombre}
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
            value={currentTipo.descripcion || ''}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                name="activo"
                checked={currentTipo.activo}
                onChange={handleInputChange}
              />
            }
            label="Activo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveTipo}
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
            ¿Está seguro de que desea eliminar el tipo de sierra "{tipoToDelete?.nombre}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteTipo} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TipoSierraList;