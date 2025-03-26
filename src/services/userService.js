// src/services/userService.js
import api from './api';

const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/usuarios');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuarios',
      };
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuario',
      };
    }
  },

  createUser: async (userData) => {
    try {
      // Mapeo de nombres de rol a IDs (ajusta estos IDs según tu backend)
      const rolMapping = {
        'Gerente': 1,
        'Administrador': 2,
        'Cliente': 3
      };
      
      // Si userData contiene un campo 'rol' en lugar de 'rol_id', haz la conversión
      if (userData.rol && !userData.rol_id) {
        userData.rol_id = rolMapping[userData.rol] || null;
        delete userData.rol; // Eliminar el campo 'rol' para enviar solo 'rol_id'
      }
      
      const response = await api.post('/usuarios', userData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear usuario',
      };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, userData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar usuario',
      };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar usuario',
      };
    }
  },

  changePassword: async (id, passwordData) => {
    try {
      const response = await api.put(`/usuarios/${id}/cambiar-password`, passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar contraseña',
      };
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/usuarios/rol/${role}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuarios por rol',
      };
    }
  },

  assignSucursalesToUser: async (userId, sucursalIds) => {
    try {
      const response = await api.post(`/usuarios/${userId}/sucursales`, { sucursales: sucursalIds });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al asignar sucursales',
      };
    }
  },

  getSucursalesByUser: async (userId) => {
    try {
      const response = await api.get(`/usuarios/${userId}/sucursales`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener sucursales del usuario',
      };
    }
  }
};

export default userService;