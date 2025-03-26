// src/services/clienteService.js
import api from './api';

const clienteService = {
  getAllClientes: async () => {
    try {
      const response = await api.get('/clientes');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener clientes',
      };
    }
  },

  getClienteById: async (id) => {
    try {
      const response = await api.get(`/clientes/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener cliente',
      };
    }
  },

  createCliente: async (clienteData) => {
    try {
      const response = await api.post('/clientes', clienteData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear cliente',
      };
    }
  },

  updateCliente: async (id, clienteData) => {
    try {
      const response = await api.put(`/clientes/${id}`, clienteData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar cliente',
      };
    }
  },

  deleteCliente: async (id) => {
    try {
      const response = await api.delete(`/clientes/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar cliente',
      };
    }
  }
};

export default clienteService;