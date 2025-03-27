// src/pages/usuarios/UserList.jsx
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as UserIcon,
  SupervisorAccount as SupervisorIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../../services/userService';
import catalogoService from '../../services/catalogoService';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Mapeo de IDs de rol a nombres
  const rolMapping = {
    1: 'Gerente',
    2: 'Administrador',
    3: 'Cliente'
  };

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar usuarios
      const usersResponse = await userService.getAllUsers();
      if (usersResponse.success) {
        // Mapear roles de los usuarios según rolMapping
        const mappedUsers = usersResponse.data.map(user => ({
          ...user,
          rol: user.rol_id ? rolMapping[user.rol_id] : user.rol || 'Desconocido'
        }));
        setUsers(mappedUsers);
      } else {
        setError('Error al cargar los usuarios');
      }
      
      // Configurar roles para el filtro usando el rolMapping
      const roleOptions = Object.entries(rolMapping).map(([id, nombre]) => ({
        id: parseInt(id, 10),
        nombre
      }));
      setRoles(roleOptions);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
      
      // Para demo, simulación de datos
      const demoUsers = [
        { 
          id: 1, 
          nombre: 'Admin Usuario', 
          email: 'admin@example.com', 
          rol_id: 2,
          rol: 'Administrador',
          activo: true 
        },
        { 
          id: 2, 
          nombre: 'Gerente Usuario', 
          email: 'gerente@example.com', 
          rol_id: 1,
          rol: 'Gerente',
          activo: true 
        },
        { 
          id: 3, 
          nombre: 'Cliente Usuario', 
          email: 'cliente@example.com', 
          rol_id: 3,
          rol: 'Cliente',
          activo: true 
        },
        { 
          id: 4, 
          nombre: 'Usuario Inactivo', 
          email: 'inactivo@example.com', 
          rol_id: 3,
          rol: 'Cliente',
          activo: false 
        }
      ];
      
      setUsers(demoUsers);
      
      const demoRoles = [
        { id: 1, nombre: 'Gerente' },
        { id: 2, nombre: 'Administrador' },
        { id: 3, nombre: 'Cliente' }
      ];
      setRoles(demoRoles);
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

  // Función para filtrar usuarios
  const filteredUsers = users.filter((user) => {
    // Filtrar por término de búsqueda
    const searchFields = [
      user.nombre,
      user.email,
      user.rol,
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    // Filtrar por rol (usando el ID del rol o el nombre)
    const matchesRole = roleFilter === '' || 
                        user.rol_id === parseInt(roleFilter, 10) || 
                        user.rol === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Función para manejar la eliminación de un usuario
  const handleDeleteUser = (user) => {
    setConfirmDelete(user);
  };

  // Confirmar eliminación
  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;
    
    try {
      const response = await userService.deleteUser(confirmDelete.id);
      if (response.success) {
        loadData(); // Recargar los datos
      } else {
        alert('Error al eliminar el usuario: ' + response.error);
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('Error al eliminar el usuario. Por favor, inténtelo de nuevo.');
    } finally {
      setConfirmDelete(null);
    }
  };

  // Función para obtener el icono de rol
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrador':
        return <AdminIcon />;
      case 'Gerente':
        return <SupervisorIcon />;
      case 'Cliente':
        return <UserIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Función para obtener el color de rol
  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrador':
        return 'error';
      case 'Gerente':
        return 'warning';
      case 'Cliente':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        <Typography color="text.primary">Usuarios</Typography>
      </Breadcrumbs>

      {/* Encabezado y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Gestión de Usuarios
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
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/usuarios/nuevo')}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar usuarios..."
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
              <FormControl fullWidth size="small">
                <InputLabel id="role-filter-label">Filtrar por Rol</InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Filtrar por Rol"
                >
                  <MenuItem value="">Todos los roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id.toString()}>
                      {role.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
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
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow 
                        key={user.id}
                        sx={{ opacity: user.activo ? 1 : 0.6 }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <PersonIcon 
                              sx={{ 
                                mr: 1,
                                color: user.activo ? 'primary.main' : 'text.disabled' 
                              }} 
                            />
                            <Typography fontWeight="medium">
                              {user.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={getRoleIcon(user.rol)} 
                            label={user.rol} 
                            color={getRoleColor(user.rol)} 
                            variant={user.activo ? 'filled' : 'outlined'} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={user.activo ? <CheckCircleIcon /> : <BlockIcon />} 
                            label={user.activo ? 'Activo' : 'Inactivo'} 
                            color={user.activo ? 'success' : 'default'} 
                            variant={user.activo ? 'filled' : 'outlined'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => navigate(`/usuarios/${user.id}`)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </span> 
                          </Tooltip>
                          <Tooltip title="Editar">
                          <span>
                              <IconButton
                                color="secondary"
                                onClick={() => navigate(`/usuarios/${user.id}/editar`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </span> 
                          </Tooltip>

                          <Tooltip title="Eliminar">
                          <span>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.rol === 'Administrador'}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span> 
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Mensaje cuando no hay resultados */}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="text.secondary">
                          No se encontraron usuarios
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredUsers.length}
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

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar al usuario <strong>{confirmDelete?.nombre}</strong> con email <strong>{confirmDelete?.email}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={confirmDeleteUser} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;