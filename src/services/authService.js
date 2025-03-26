// src/services/authService.js
import api from './api';
import jwt_decode from 'jwt-decode';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        const { token, usuario } = response.data.data;
        
        // Verificar que usuario existe y tiene las propiedades necesarias
        if (!usuario || !usuario.nombre) {
          return {
            success: false,
            error: 'La respuesta del servidor no incluye información completa del usuario'
          };
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        return { success: true, data: response.data.data };
      }
      return { success: false, error: 'Respuesta no válida del servidor' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener perfil',
      };
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Verificar que el token no haya expirado
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  }
};

export default authService;