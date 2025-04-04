// src/services/afiladoService.js
import api from './api';

const afiladoService = {
  getAfiladoById: async (id) => {
    try {
      console.log(`Obteniendo afilado con ID: ${id}`);
      const response = await api.get(`/afilados/${id}`);
      console.log('Respuesta del servidor (getAfiladoById):', response.data);
      
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        console.error('La respuesta no contiene datos esperados:', response.data);
        return {
          success: false,
          error: 'No se encontró información del afilado'
        };
      }
    } catch (error) {
      console.error('Error al obtener afilado por ID:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener afilado'
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

  getAllAfilados: async () => {
    try {
      const response = await api.get('/afilados/todos');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener todos los afilados',
      };
    }
  },

  getAfiladosByCliente: async (clienteId) => {
    try {
      const response = await api.get(`/afilados/cliente/${clienteId}`);
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

  createAfilado: async (afiladoData) => {
    try {
      console.log('Datos a enviar al crear afilado:', afiladoData);
      
      const response = await api.post('/afilados', afiladoData);
      console.log('Respuesta al crear afilado:', response.data);
      
      // Asegurarnos de que la respuesta tiene la estructura esperada
      if (!response.data || !response.data.data) {
        console.error('La respuesta no contiene los datos esperados:', response.data);
        return {
          success: false,
          error: 'Error en el formato de respuesta del servidor'
        };
      }
      
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error al crear afilado:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      // Mejorar el mensaje de error
      let errorMessage = 'Error al crear afilado';
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Método para registrar salida de múltiples afilados de una vez
  registrarSalidaMasiva: async (afiladoIds) => {
    try {
      const response = await api.post('/afilados/salida-masiva', { afilado_ids: afiladoIds });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || `Se registró la salida de ${afiladoIds.length} afilados correctamente`,
        error: null
      };
    } catch (error) {
      console.error('Error al registrar salida masiva:', error);
      return {
        success: false,
        data: null,
        message: null,
        error: getApiErrorMessage(error) || 'Error al registrar salida masiva'
      };
    }
  },

  registrarSalida: async (afiladoId) => {
    try {
      const response = await api.put(`/afilados/${afiladoId}/salida`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar salida',
      };
    }
  }
};

/**
 * Marca múltiples afilados como "último afilado" de forma masiva
 * @param {Array} afiladoIds - Array con los IDs de los afilados a marcar
 * @returns {Promise} - Promesa con el resultado de la operación
 */
const marcarUltimoAfiladoMasivo = async (afiladoIds) => {
  try {
    const response = await api.post('/afilados/ultimo-afilado-masivo', { afiladoIds });
    
    if (response.status === 200) {
      return { 
        success: true, 
        data: response.data 
      };
    } else {
      return { 
        success: false, 
        error: response.data.message || 'Error al marcar afilados como último afilado'
      };
    }
  } catch (error) {
    console.error('Error en marcarUltimoAfiladoMasivo:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Error al conectar con el servidor'
    };
  }
};

export default afiladoService;