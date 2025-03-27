// src/components/forms/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  FormHelperText,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Typography,
  Autocomplete,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import catalogoService from '../../services/catalogoService';
import clienteService from '../../services/clienteService';

// Esquema de validación
const createUserSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido'),
  apellido: yup
    .string()
    .required('El apellido es requerido'),
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('La confirmación de contraseña es requerida'),
  rol_id: yup
    .number()
    .required('El rol es requerido'),
  cliente_id: yup
    .number()
    .nullable()
    .when('rol_id', {
      is: (value) => value === 3, // ID del rol 'Cliente'
      then: yup.number().required('El cliente es requerido para usuarios tipo Cliente')
    }),
  sucursales: yup
    .array()
    .when('rol_id', {
      is: (value) => value === 3, // ID del rol 'Cliente'
      then: yup.array().min(1, 'Seleccione al menos una sucursal')
    })
});

// Esquema para edición (contraseña opcional)
const editUserSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido'),
  apellido: yup
    .string()
    .required('El apellido es requerido'),
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .nullable()
    .transform(value => value || null)
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  password_confirmation: yup
    .string()
    .nullable()
    .transform(value => value || null)
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir'),
  rol_id: yup
    .number()
    .required('El rol es requerido'),
  cliente_id: yup
    .number()
    .nullable()
    .when('rol_id', {
      is: (value) => value === 3, // ID del rol 'Cliente'
      then: yup.number().required('El cliente es requerido para usuarios tipo Cliente')
    }),
  sucursales: yup
    .array()
    .when('rol_id', {
      is: (value) => value === 3, // ID del rol 'Cliente'
      then: yup.array().min(1, 'Seleccione al menos una sucursal')
    })
});

const UserForm = ({ user = null, onSubmit, onCancel, loading = false, error = null, isSelfAccount = false }) => {
  const { user: currentUser } = useAuth();
  const isEdit = !!user;
  
  const [roles, setRoles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [selectedRol, setSelectedRol] = useState(user?.rol_id || null);
  const [selectedCliente, setSelectedCliente] = useState(user?.cliente_id || null);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmation: false
  });
  const [loadingData, setLoadingData] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Usar esquema de validación apropiado según si es creación o edición
  const validationSchema = isEdit ? editUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      email: user?.email || '',
      password: '',
      password_confirmation: '',
      rol_id: user?.rol_id ? parseInt(user.rol_id, 10) : '',
      cliente_id: user?.cliente_id || null,
      sucursales: user?.sucursales || []
    }
  });

  // Observar cambios en el rol seleccionado
  const watchRolId = watch('rol_id');
  const watchClienteId = watch('cliente_id');
  const isClienteRol = watchRolId === 3; // ID del rol 'Cliente'

  // Cargar datos necesarios
  useEffect(() => {
    const loadFormData = async () => {
      setLoadingData(true);
      try {
        // Cargar roles
        const rolesResponse = await catalogoService.getRoles();
        if (rolesResponse.success) {
          setRoles(rolesResponse.data);
        } else {
          console.error('Error al cargar roles:', rolesResponse.error);
        }

        // Cargar clientes
        const clientesResponse = await clienteService.getAllClientes();
        if (clientesResponse.success) {
          setClientes(clientesResponse.data);
        } else {
          console.error('Error al cargar clientes:', clientesResponse.error);
        }

        // Si estamos editando y hay un cliente seleccionado, cargar sus sucursales
        if (isEdit && user.cliente_id) {
          loadSucursalesByCliente(user.cliente_id);
        }
      } catch (err) {
        console.error('Error al cargar datos del formulario:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, [isEdit, user]);

  // Cargar sucursales cuando cambia el cliente seleccionado
  useEffect(() => {
    if (watchClienteId) {
      loadSucursalesByCliente(watchClienteId);
    } else {
      setSucursales([]);
    }
  }, [watchClienteId]);

  // Función para cargar sucursales por cliente
  const loadSucursalesByCliente = async (clienteId) => {
    try {
      const response = await clienteService.getSucursalesByCliente(clienteId);
      if (response.success) {
        setSucursales(response.data);
      } else {
        console.error('Error al cargar sucursales:', response.error);
        setSucursales([]);
      }
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setSucursales([]);
    }
  };

  // Manejar cambio de rol
  const handleRolChange = (event) => {
    const rolId = parseInt(event.target.value, 10);
    setSelectedRol(rolId);
    setValue('rol_id', rolId);
    
    // Limpiar campos de cliente y sucursales si no es rol de Cliente
    if (rolId !== 3) {
      setValue('cliente_id', null);
      setValue('sucursales', []);
    }
  };

  // Manejar cambio de cliente
  const handleClienteChange = (event) => {
    const clienteId = event.target.value;
    setSelectedCliente(clienteId);
    setValue('cliente_id', clienteId);
    setValue('sucursales', []); // Limpiar sucursales al cambiar de cliente
  };

  // Alternar visibilidad de contraseña
  const handleTogglePassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  // Manejar envío del formulario
  const onFormSubmit = async (data) => {
    setFormSubmitting(true);
    
    // Asegurarse de que rol_id sea un número
    if (data.rol_id) {
      data.rol_id = parseInt(data.rol_id, 10);
    }
    
    // Eliminar campos innecesarios según el rol
    if (data.rol_id !== 3) {
      delete data.cliente_id;
      delete data.sucursales;
    }
    
    // Si editamos y no hay contraseña, eliminar campos relacionados
    if (isEdit && !data.password) {
      delete data.password;
      delete data.password_confirmation;
    }
    
    console.log('Datos que se envían al servidor:', data);
    
    try {
      const result = await onSubmit(data);
      if (!result?.success) {
        setFormSubmitting(false);
      }
    } catch (err) {
      console.error('Error al enviar formulario:', err);
      setFormSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
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

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Grid container spacing={3}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Información básica
              </Typography>
            </Grid>

            {/* Nombre */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                variant="outlined"
                {...register('nombre')}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Apellido */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido"
                variant="outlined"
                {...register('apellido')}
                error={!!errors.apellido}
                helperText={errors.apellido?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Contraseña */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={isEdit ? "Nueva Contraseña (opcional)" : "Contraseña"}
                variant="outlined"
                type={showPassword.password ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SecurityIcon color="action" />
                    </InputAdornment>
                  ),
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
                  ),
                }}
              />
            </Grid>

            {/* Confirmar Contraseña */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={isEdit ? "Confirmar Nueva Contraseña" : "Confirmar Contraseña"}
                variant="outlined"
                type={showPassword.confirmation ? 'text' : 'password'}
                {...register('password_confirmation')}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SecurityIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleTogglePassword('confirmation')}
                        edge="end"
                      >
                        {showPassword.confirmation ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Permisos y asignaciones */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Permisos y asignaciones
              </Typography>
            </Grid>

            {/* Rol */}
            <Grid item xs={12} md={isClienteRol ? 6 : 12}>
              <FormControl 
                fullWidth 
                error={!!errors.rol_id} 
                disabled={isSelfAccount && currentUser?.rol !== 'Administrador'}
              >
                <InputLabel id="rol-label">Rol</InputLabel>
                <Select
                  labelId="rol-label"
                  value={selectedRol || ''}
                  label="Rol"
                  onChange={handleRolChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <SecurityIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value={1}>Gerente</MenuItem>
                  <MenuItem value={2}>Administrador</MenuItem>
                  <MenuItem value={3}>Cliente</MenuItem>
                </Select>
                {errors.rol_id && (
                  <FormHelperText>{errors.rol_id.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Cliente (solo para rol de Cliente) */}
            {isClienteRol && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.cliente_id}>
                  <InputLabel id="cliente-label">Cliente</InputLabel>
                  <Select
                    labelId="cliente-label"
                    value={selectedCliente || ''}
                    label="Cliente"
                    onChange={handleClienteChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessIcon color="action" />
                      </InputAdornment>
                    }
                    {...register('cliente_id')}
                  >
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
              </Grid>
            )}

            {/* Sucursales (solo para rol de Cliente y si hay cliente seleccionado) */}
            {isClienteRol && selectedCliente && (
              <Grid item xs={12}>
                <Controller
                  name="sucursales"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.sucursales}>
                      <Autocomplete
                        multiple
                        id="sucursales-autocomplete"
                        options={sucursales}
                        getOptionLabel={(option) => option.nombre}
                        value={field.value || []}
                        onChange={(_, newValue) => {
                          field.onChange(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sucursales"
                            placeholder="Seleccionar sucursales"
                            error={!!errors.sucursales}
                            helperText={errors.sucursales?.message}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <LocationIcon color="action" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              )
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option.nombre}
                              {...getTagProps({ index })}
                              key={option.id}
                            />
                          ))
                        }
                      />
                    </FormControl>
                  )}
                />
              </Grid>
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
              disabled={formSubmitting || loading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={formSubmitting || loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
              disabled={formSubmitting || loading}
            >
              {isEdit ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;