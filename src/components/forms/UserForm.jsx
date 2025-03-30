// src/components/forms/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon
} from '@mui/icons-material';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService'; // Importar sucursalService

// Esquema de validación
const userSchema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido'),
  apellido: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Email no válido').required('El email es requerido'),
  rol_id: yup.mixed().required('El rol es requerido'),
  // Condicional para rol de cliente (rol_id = 3)
  cliente_id: yup.mixed().when('rol_id', {
    is: (val) => val == 3, // Usar == para comparar tanto string como número
    then: () => yup.mixed().required('El cliente es requerido para usuarios con rol de Cliente'),
    otherwise: () => yup.mixed().nullable()
  }),
  sucursales: yup.array().when('rol_id', {
    is: (val) => val == 3, // Usar == para comparar tanto string como número
    then: () => yup.array().min(1, 'Debe seleccionar al menos una sucursal'),
    otherwise: () => yup.array().nullable()
  }),
  // Password solo requerido para nuevos usuarios
  password: yup.string().when('isNewUser', {
    is: true,
    then: () => yup.string().required('La contraseña es requerida').min(6, 'Mínimo 6 caracteres'),
    otherwise: () => yup.string().nullable().transform(value => (value === "" ? null : value))
  }),
  password_confirmation: yup.string().when('password', {
    is: (password) => password && password.length > 0,
    then: () => yup.string()
      .required('Confirmación requerida')
      .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir'),
    otherwise: () => yup.string().nullable()
  })
});

const UserForm = ({ user, onSubmit, onCancel, loading, error, isSelfAccount }) => {
  const isNewUser = !user;
  
  // Estados para la carga de datos relacionados
  const [roles, setRoles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmation: false
  });

  // Configurar el formulario
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      isNewUser: isNewUser,
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      email: user?.email || '',
      rol_id: user?.rol_id || '',
      cliente_id: user?.cliente_id || '',
      sucursales: user?.sucursales || [],
      activo: user ? user.activo : true
    }
  });

  const watchRolId = watch('rol_id');
  const isClienteRole = watchRolId === 3 || watchRolId === '3';

  // Efecto para cargar datos relacionados (roles, clientes, sucursales)
  useEffect(() => {
    const loadRelatedData = async () => {
      setLoadingData(true);
      
      try {
        // Cargar roles (simulado aquí - debe conectarse a un servicio real)
        const rolesData = [
          { id: 1, nombre: 'Gerente' },
          { id: 2, nombre: 'Administrador' },
          { id: 3, nombre: 'Cliente' }
        ];
        setRoles(rolesData);
        
        // Cargar clientes (esta debe ser una llamada real a la API)
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
          
          // Si el usuario tiene un cliente_id, cargamos sus sucursales
          if (user && user.cliente_id) {
            const cliente = clientesResponse.data.find(c => c.id === user.cliente_id);
            if (cliente) {
              setSelectedCliente(cliente);
              // Cargar sucursales del cliente seleccionado usando sucursalService
              loadSucursales(cliente.id);
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        // Si estamos en modo de desarrollo, usamos datos de ejemplo
        setClientes([
          { id: 1, razon_social: 'Cliente 1' },
          { id: 2, razon_social: 'Cliente 2' },
          { id: 3, razon_social: 'Cliente 3' }
        ]);
        
        setSucursales([
          { id: 1, nombre: 'Sucursal A', cliente_id: 1 },
          { id: 2, nombre: 'Sucursal B', cliente_id: 1 },
          { id: 3, nombre: 'Sucursal C', cliente_id: 2 },
          { id: 4, nombre: 'Sucursal D', cliente_id: 3 }
        ]);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadRelatedData();
  }, [user]);

  // Función para cargar sucursales de un cliente usando sucursalService
  const loadSucursales = async (clienteId) => {
    if (!clienteId) return;
    
    try {
      const sucursalesResponse = await sucursalService.getSucursalesByCliente(clienteId);
      if (sucursalesResponse.success) {
        setSucursales(sucursalesResponse.data);
        if (!user) {
          // Si es un nuevo usuario, limpiar las sucursales seleccionadas previamente
          setValue('sucursales', []);
        }
      } else {
        console.error("Error al cargar sucursales:", sucursalesResponse.error);
        // Datos de ejemplo para desarrollo
        setSucursales([
          { id: 1, nombre: 'Sucursal A', cliente_id: clienteId },
          { id: 2, nombre: 'Sucursal B', cliente_id: clienteId }
        ]);
      }
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      // Datos de ejemplo para desarrollo
      setSucursales([
        { id: 1, nombre: 'Sucursal A', cliente_id: clienteId },
        { id: 2, nombre: 'Sucursal B', cliente_id: clienteId }
      ]);
    }
  };

  // Efecto para actualizar sucursales cuando se selecciona un cliente
  useEffect(() => {
    if (selectedCliente) {
      loadSucursales(selectedCliente.id);
    } else {
      setSucursales([]);
      setValue('sucursales', []);
    }
  }, [selectedCliente, setValue]);

  // Manejar cambio de cliente seleccionado
  const handleClienteChange = (event, newCliente) => {
    setSelectedCliente(newCliente);
    if (newCliente) {
      setValue('cliente_id', newCliente.id);
    } else {
      setValue('cliente_id', '');
    }
  };

  // Manejar mostrar/ocultar contraseña
  const handleTogglePassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  // Manejar envío del formulario
  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            {/* Datos personales */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Datos Personales
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                {...register('nombre')}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido"
                {...register('apellido')}
                error={!!errors.apellido}
                helperText={errors.apellido?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* Configuración de acceso */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Configuración de Acceso
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.rol_id}>
                <InputLabel id="rol-label">Rol</InputLabel>
                <Controller
                  name="rol_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="rol-label"
                      label="Rol"
                      disabled={isSelfAccount}
                      startAdornment={
                        <InputAdornment position="start">
                          <SecurityIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {roles.map((rol) => (
                        <MenuItem key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.rol_id && (
                  <FormHelperText>{errors.rol_id.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                disabled={isSelfAccount}
                sx={{ visibility: isNewUser ? 'hidden' : 'visible' }}
              >
                <InputLabel id="activo-label">Estado</InputLabel>
                <Controller
                  name="activo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="activo-label"
                      label="Estado"
                    >
                      <MenuItem value={true}>Activo</MenuItem>
                      <MenuItem value={false}>Inactivo</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            
            {/* Campos de contraseña */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={isNewUser ? "Contraseña" : "Nueva Contraseña (opcional)"}
                type={showPassword.password ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message || (isNewUser ? '' : 'Dejar en blanco para mantener la contraseña actual')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleTogglePassword('password')}
                        edge="end"
                      >
                        {showPassword.password ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmar Contraseña"
                type={showPassword.confirmation ? 'text' : 'password'}
                {...register('password_confirmation')}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password confirmation visibility"
                        onClick={() => handleTogglePassword('confirmation')}
                        edge="end"
                      >
                        {showPassword.confirmation ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* Sección de Cliente (solo visible para rol Cliente) */}
            {isClienteRole && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Asociación de Cliente
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="cliente_id"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        id="cliente-select"
                        options={clientes}
                        getOptionLabel={(option) => option.razon_social || ''}
                        value={selectedCliente}
                        onChange={(e, newValue) => {
                          handleClienteChange(e, newValue);
                          onChange(newValue ? newValue.id : '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Cliente"
                            error={!!errors.cliente_id}
                            helperText={errors.cliente_id?.message}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <BusinessIcon color="action" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              )
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.sucursales}>
                    <InputLabel id="sucursales-label">Sucursales</InputLabel>
                    <Controller
                      name="sucursales"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="sucursales-label"
                          label="Sucursales"
                          multiple
                          disabled={!selectedCliente}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const sucursal = sucursales.find(s => s.id === value);
                                return (
                                  <Chip 
                                    key={value} 
                                    label={sucursal ? sucursal.nombre : value} 
                                    icon={<SucursalIcon />}
                                  />
                                );
                              })}
                            </Box>
                          )}
                          startAdornment={
                            <InputAdornment position="start">
                              <SucursalIcon color="action" />
                            </InputAdornment>
                          }
                        >
                          {sucursales.map((sucursal) => (
                            <MenuItem key={sucursal.id} value={sucursal.id}>
                              {sucursal.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.sucursales && (
                      <FormHelperText>{errors.sucursales.message}</FormHelperText>
                    )}
                    {!selectedCliente && (
                      <FormHelperText>Seleccione un cliente primero</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Botones de acción */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              sx={{ mr: 2 }}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
              disabled={loading}
            >
              {isNewUser ? 'Crear Usuario' : 'Actualizar Usuario'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;