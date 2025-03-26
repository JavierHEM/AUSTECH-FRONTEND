// src/services/sucursalService.js
import api from './api';

const sucursalService = {
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