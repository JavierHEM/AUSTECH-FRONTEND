// src/services/afiladoService.js
import api from './api';

const afiladoService = {
  registrarAfilado: async (afiladoData) => {
    try {
      const response = await api.post('/afilados', afiladoData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar afilado',
      };
    }
  },

  registrarSalida: async (id) => {
    try {
      const response = await api.put(`/afilados/${id}/salida`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar salida',
      };
    }
  },

  getAfiladosBySierra: async (sierraId) => {
    try {
      const response = await api.get(`/afilados/sierra/${sierraId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener afilados de la sierra',
      };
    }
  },

  getAfiladosBySucursal: async (sucursalId, params = {}) => {
    try {
      let url = `/afilados/sucursal/${sucursalId}`;
      
      // Agregar parámetros opcionales si están presentes
      const queryParams = new URLSearchParams();
      if (params.desde) queryParams.append('desde', params.desde);
      if (params.hasta) queryParams.append('hasta', params.hasta);
      if (params.pendientes) queryParams.append('pendientes', params.pendientes);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await api.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener afilados de la sucursal',
      };
    }
  },

  getAfiladosByCliente: async (clienteId, params = {}) => {
    try {
      let url = `/afilados/cliente/${clienteId}`;
      
      // Agregar parámetros opcionales si están presentes
      const queryParams = new URLSearchParams();
      if (params.desde) queryParams.append('desde', params.desde);
      if (params.hasta) queryParams.append('hasta', params.hasta);
      if (params.pendientes) queryParams.append('pendientes', params.pendientes);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await api.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener afilados del cliente',
      };
    }
  },

  getAfiladosPendientes: async () => {
    try {
      const response = await api.get('/afilados/pendientes');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener afilados pendientes',
      };
    }
  },

  getAllAfilados: async () => {
    try {
      const response = await api.get('/afilados/todos');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error detallado:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener todos los afilados',
      };
    }
  }
};

export default afiladoService;