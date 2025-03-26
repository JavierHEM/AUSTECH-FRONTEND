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
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import catalogoService from '../../services/catalogoService';
import sucursalService from '../../services/sucursalService';
import clienteService from '../../services/clienteService';

// Esquema de validación para formulario de usuario
const createUserSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no debe exceder los 100 caracteres'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Ingrese un email válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('La confirmación de contraseña es requerida'),
  rol: yup
    .string()
    .required('El rol es requerido'),
  cliente_id: yup
    .number()
    .nullable()
    .when('rol', {
      is: 'Cliente',
      then: () => yup.number().required('El cliente es requerido').typeError('Debe seleccionar un cliente'),
      otherwise: () => yup.number().nullable()
    }),
  sucursales: yup
    .array()
    .when('rol', {
      is: 'Cliente',
      then: () => yup.array().min(1, 'Debe seleccionar al menos una sucursal'),
      otherwise: () => yup.array()
    }),
  activo: yup
    .boolean()
});

// Esquema para editar usuario (sin contraseña requerida)
const editUserSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no debe exceder los 100 caracteres'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Ingrese un email válido'),
  password: yup
    .string()
    .nullable()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir'),
  rol: yup
    .string()
    .required('El rol es requerido'),
  cliente_id: yup
    .number()
    .nullable()
    .when('rol', {
      is: 'Cliente',
      then: () => yup.number().required('El cliente es requerido').typeError('Debe seleccionar un cliente'),
      otherwise: () => yup.number().nullable()
    }),
  sucursales: yup
    .array()
    .when('rol', {
      is: 'Cliente',
      then: () => yup.array().min(1, 'Debe seleccionar al menos una sucursal'),
      otherwise: () => yup.array()
    }),
  activo: yup
    .boolean()
});

const UserForm = ({ user, onSubmit, onCancel, loading, error }) => {
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Elegir el esquema de validación según si es creación o edición
  const schema = user ? editUserSchema : createUserSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: user ? {
      nombre: user.nombre || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      rol: user.rol || '',
      cliente_id: user.cliente_id || null,
      sucursales: user.sucursales || [],
      activo: user.activo !== undefined ? user.activo : true
    } : {
      nombre: '',
      email: '',
      password: '',
      password_confirmation: '',
      rol: '',
      cliente_id: null,
      sucursales: [],
      activo: true
    }
  });

  const watchRol = watch('rol');
  const watchClienteId = watch('cliente_id');

  // Cargar catálogos
  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        // Cargar roles
        const rolesResponse = await catalogoService.getRoles();
        if (rolesResponse.success) {
          setRoles(rolesResponse.data);
        }
        
        // Cargar clientes
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    fetchCatalogos();
  }, []);

  // Actualizar selectedCliente cuando cambia cliente_id
  useEffect(() => {
    if (watchClienteId) {
      setSelectedCliente(watchClienteId);
    } else {
      setSelectedCliente(null);
    }
  }, [watchClienteId]);

  // Cargar sucursales cuando se selecciona un cliente
  useEffect(() => {
    const fetchSucursales = async () => {
      if (selectedCliente) {
        try {
          const response = await sucursalService.getSucursalesByCliente(selectedCliente);
          if (response.success) {
            setSucursales(response.data);
          }
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        }
      } else {
        setSucursales([]);
      }
    };

    fetchSucursales();
  }, [selectedCliente]);

  // Limpiar campos cliente y sucursales si el rol no es Cliente
  useEffect(() => {
    if (watchRol !== 'Cliente') {
      setValue('cliente_id', null);
      setValue('sucursales', []);
    }
  }, [watchRol, setValue]);

  const handleFormSubmit = async (data) => {
    setSuccess(false);
    const result = await onSubmit(data);
    if (result && result.success) {
      setSuccess(true);
      if (!user) {
        reset();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Usuario {user ? 'actualizado' : 'creado'} correctamente
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Nombre */}
            <Grid item xs={12} md={6}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nombre Completo"
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            {/* Email */}
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            {/* Contraseña */}
            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={user ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    required={!user}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Confirmación de contraseña */}
            <Grid item xs={12} md={6}>
              <Controller
                name="password_confirmation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirmar Contraseña"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    error={!!errors.password_confirmation}
                    helperText={errors.password_confirmation?.message}
                    required={!user}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            edge="end"
                          >
                            {showPasswordConfirmation ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Rol */}
            <Grid item xs={12} md={6}>
              <Controller
                name="rol"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.rol}>
                    <InputLabel id="rol-label" required>Rol</InputLabel>
                    <Select
                      {...field}
                      labelId="rol-label"
                      label="Rol"
                      disabled={loadingCatalogos}
                    >
                      <MenuItem value="">
                        <em>Seleccione un rol</em>
                      </MenuItem>
                      {roles.map((rol) => (
                        <MenuItem key={rol.id} value={rol.nombre}>
                          {rol.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.rol && (
                      <FormHelperText>{errors.rol.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Estado activo/inactivo */}
            <Grid item xs={12} md={6}>
              <Controller
                name="activo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Usuario Activo"
                  />
                )}
              />
            </Grid>
            
            {/* Cliente (solo visible si el rol es Cliente) */}
            {watchRol === 'Cliente' && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="cliente_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cliente_id}>
                      <InputLabel id="cliente-label" required>Cliente</InputLabel>
                      <Select
                        {...field}
                        labelId="cliente-label"
                        label="Cliente"
                        value={field.value || ''}
                        disabled={loadingCatalogos}
                      >
                        <MenuItem value="">
                          <em>Seleccione un cliente</em>
                        </MenuItem>
                        {clientes.map((cliente) => (
                          <MenuItem key={cliente.id} value={cliente.id}>
                            {cliente.razon_social}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.cliente_id && (
                        <FormHelperText>{errors.cliente_id.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            )}
            
            {/* Sucursales (solo visible si el rol es Cliente y hay un cliente seleccionado) */}
            {watchRol === 'Cliente' && selectedCliente && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="sucursales"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.sucursales}>
                      <InputLabel id="sucursales-label" required>Sucursales</InputLabel>
                      <Select
                        {...field}
                        labelId="sucursales-label"
                        label="Sucursales"
                        multiple
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const sucursal = sucursales.find(s => s.id === value);
                              return (
                                <Chip key={value} label={sucursal ? sucursal.nombre : value} size="small" />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {sucursales.map((sucursal) => (
                          <MenuItem key={sucursal.id} value={sucursal.id}>
                            <Checkbox checked={field.value.indexOf(sucursal.id) > -1} />
                            <ListItemText primary={sucursal.nombre} />
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.sucursales && (
                        <FormHelperText>{errors.sucursales.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
        
        <Divider />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            startIcon={<CancelIcon />}
            sx={{ mr: 1 }}
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
            {user ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Card>
    </form>
  );
};

export default UserForm;