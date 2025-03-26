// src/services/sierraService.js
import api from './api';

const sierraService = {

  getSierraById: async (id) => {
    try {
      const response = await api.get(`/sierras/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sierra por ID',
      };
    }
  },

  getSierraByCodigo: async (codigo) => {
    try {
      const response = await api.get(`/sierras/codigo/${codigo}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sierra por código',
      };
    }
  },

  getSierrasBySucursal: async (sucursalId) => {
    try {
      const response = await api.get(`/sierras/sucursal/${sucursalId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sierras de la sucursal',
      };
    }
  },

  getAllSierras: async () => {
    try {
      const response = await api.get('/sierras/todas');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error detallado:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener todas las sierras',
      };
    }
  },

  getSierrasByCliente: async (clienteId) => {
    try {
      const response = await api.get(`/sierras/cliente/${clienteId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sierras del cliente',
      };
    }
  },

  createSierra: async (sierraData) => {
    try {
      const response = await api.post('/sierras', sierraData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear sierra',
      };
    }
  },

  updateSierra: async (id, sierraData) => {
    try {
      const response = await api.put(`/sierras/${id}`, sierraData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar sierra',
      };
    }
  }
};

export default sierraService;