// src/services/sucursalService.js
import api from './api';

const sucursalService = {
  // Obtener todas las sucursales
  getAllSucursales: async () => {
    try {
      const response = await api.get('/sucursales');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sucursales',
      };
    }
  },

  // Obtener sucursal por ID
  getSucursalById: async (id) => {
    try {
      const response = await api.get(`/sucursales/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sucursal',
      };
    }
  },

  // Obtener sucursales por cliente
  getSucursalesByCliente: async (clienteId) => {
    try {
      const response = await api.get(`/sucursales/cliente/${clienteId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sucursales del cliente',
      };
    }
  },

  // Obtener sucursales vinculadas al usuario actual
  obtenerSucursalesVinculadasUsuario: async () => {
    try {
      const response = await api.get('/sucursales/vinculadas');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error al obtener sucursales vinculadas:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sucursales vinculadas al usuario',
      };
    }
  },
  
  // Crear una nueva sucursal
  createSucursal: async (sucursalData) => {
    try {
      const response = await api.post('/sucursales', sucursalData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear sucursal',
      };
    }
  },

  // Actualizar una sucursal existente
  updateSucursal: async (id, sucursalData) => {
    try {
      const response = await api.put(`/sucursales/${id}`, sucursalData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar sucursal',
      };
    }
  },

  // Eliminar una sucursal
  deleteSucursal: async (id) => {
    try {
      const response = await api.delete(`/sucursales/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar sucursal',
      };
    }
  }
};

export default sucursalService;