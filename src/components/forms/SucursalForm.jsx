// src/components/forms/SucursalForm.jsx
// Componente de formulario para crear y editar sucursales
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import clienteService from '../../services/clienteService';

const SucursalForm = ({ sucursal, onSubmit, onCancel, loading, error, clientePreseleccionado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    cliente_id: clientePreseleccionado || '',
    notas: ''
  });
  
  const [clientes, setClientes] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [clientesError, setClientesError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Cargar datos de la sucursal si estamos en modo edición
  useEffect(() => {
    if (sucursal) {
      setFormData({
        nombre: sucursal.nombre || '',
        direccion: sucursal.direccion || '',
        telefono: sucursal.telefono || '',
        cliente_id: sucursal.cliente_id || '',
        notas: sucursal.notas || ''
      });
    }
  }, [sucursal]);

  // Cargar la lista de clientes
  useEffect(() => {
    const loadClientes = async () => {
      if (clientePreseleccionado && !sucursal) {
        // Si hay un cliente preseleccionado, no necesitamos cargar todos
        return;
      }
      
      setClientesLoading(true);
      setClientesError(null);
      try {
        const response = await clienteService.getAllClientes();
        if (response.success) {
          setClientes(response.data);
        } else {
          setClientesError('Error al cargar la lista de clientes');
        }
      } catch (err) {
        console.error('Error al obtener clientes:', err);
        setClientesError('Error al cargar la lista de clientes');
      } finally {
        setClientesLoading(false);
      }
    };
    
    loadClientes();
  }, [clientePreseleccionado, sucursal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Eliminar el error del campo cuando el usuario empieza a corregirlo
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre de la sucursal es obligatorio';
    }
    
    if (!formData.direccion.trim()) {
      errors.direccion = 'La dirección es obligatoria';
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{7,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
      errors.telefono = 'Número de teléfono inválido';
    }
    
    if (!formData.cliente_id) {
      errors.cliente_id = 'Debe seleccionar un cliente';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Enviar datos
    const result = await onSubmit(formData);
    if (result && result.success) {
      setSubmitSuccess(true);
    }
  };

  return (
    <Card>
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {clientesError && <Alert severity="error" sx={{ mb: 3 }}>{clientesError}</Alert>}
        {submitSuccess && <Alert severity="success" sx={{ mb: 3 }}>Datos guardados correctamente</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="nombre"
                label="Nombre de la Sucursal"
                fullWidth
                required
                value={formData.nombre}
                onChange={handleChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.cliente_id} disabled={!!clientePreseleccionado || loading}>
                <InputLabel id="cliente-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-label"
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleChange}
                  label="Cliente"
                >
                  {clientesLoading ? (
                    <MenuItem value="" disabled>
                      Cargando clientes...
                    </MenuItem>
                  ) : clientes.length === 0 ? (
                    <MenuItem value="" disabled>
                      No hay clientes disponibles
                    </MenuItem>
                  ) : (
                    clientes.map(cliente => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.razon_social}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formErrors.cliente_id && (
                  <FormHelperText error>{formErrors.cliente_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="direccion"
                label="Dirección"
                fullWidth
                required
                value={formData.direccion}
                onChange={handleChange}
                error={!!formErrors.direccion}
                helperText={formErrors.direccion}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="telefono"
                label="Teléfono"
                fullWidth
                required
                value={formData.telefono}
                onChange={handleChange}
                error={!!formErrors.telefono}
                helperText={formErrors.telefono}
                disabled={loading}
                placeholder="Ej. +56 9 1234 5678"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notas"
                label="Notas adicionales"
                fullWidth
                multiline
                rows={4}
                value={formData.notas}
                onChange={handleChange}
                disabled={loading}
                placeholder="Información adicional sobre la sucursal..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onCancel}
                  disabled={loading}
                  startIcon={<CancelIcon />}
                  sx={{ mr: 2 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                >
                  {loading ? 'Guardando...' : sucursal ? 'Actualizar Sucursal' : 'Crear Sucursal'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default SucursalForm;