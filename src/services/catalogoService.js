// src/services/catalogoService.js
import api from './api';

const catalogoService = {
  // Tipos de Sierra
  getTiposSierra: async () => {
    try {
      const response = await api.get('/catalogos/tipos-sierra');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error detallado:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener tipos de sierra',
      };
    }
  },

  createTipoSierra: async (data) => {
    try {
      const response = await api.post('/catalogos/tipos-sierra', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear tipo de sierra',
      };
    }
  },

  updateTipoSierra: async (id, data) => {
    try {
      const response = await api.put(`/catalogos/tipos-sierra/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar tipo de sierra',
      };
    }
  },

  deleteTipoSierra: async (id) => {
    try {
      const response = await api.delete(`/catalogos/tipos-sierra/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar tipo de sierra',
      };
    }
  },

  // Tipos de Afilado
  getTiposAfilado: async () => {
    try {
      const response = await api.get('/catalogos/tipos-afilado');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener tipos de afilado',
      };
    }
  },

  createTipoAfilado: async (data) => {
    try {
      const response = await api.post('/catalogos/tipos-afilado', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear tipo de afilado',
      };
    }
  },

  updateTipoAfilado: async (id, data) => {
    try {
      const response = await api.put(`/catalogos/tipos-afilado/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar tipo de afilado',
      };
    }
  },

  deleteTipoAfilado: async (id) => {
    try {
      const response = await api.delete(`/catalogos/tipos-afilado/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar tipo de afilado',
      };
    }
  },

  // Estados de Sierra
  getEstadosSierra: async () => {
    try {
      const response = await api.get('/catalogos/estados-sierra');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estados de sierra',
      };
    }
  },

  createEstadoSierra: async (data) => {
    try {
      const response = await api.post('/catalogos/estados-sierra', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear estado de sierra',
      };
    }
  },

  updateEstadoSierra: async (id, data) => {
    try {
      const response = await api.put(`/catalogos/estados-sierra/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar estado de sierra',
      };
    }
  },

  deleteEstadoSierra: async (id) => {
    try {
      const response = await api.delete(`/catalogos/estados-sierra/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar estado de sierra',
      };
    }
  },

  // Roles
  getRoles: async () => {
    try {
      const response = await api.get('/catalogos/roles');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener roles',
      };
    }
  }
};

export default catalogoService;