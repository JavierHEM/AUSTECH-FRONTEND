// src/services/sierraService.js
import api from './api';
import { transformSierraToApi, transformSierraToFrontend, getApiErrorMessage } from '../utils/dataTransformUtils';

const sierraService = {

  getSierraById: async (id) => {
    try {
      const response = await api.get(`/sierras/${id}`);
      return { 
        success: true, 
        data: transformSierraToFrontend(response.data.data) 
      };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al obtener sierra por ID',
      };
    }
  },

  getSierraByCodigo: async (codigo) => {
    try {
      const response = await api.get(`/sierras/codigo/${codigo}`);
      return { 
        success: true, 
        data: transformSierraToFrontend(response.data.data) 
      };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al obtener sierra por código',
      };
    }
  },

  getSierrasBySucursal: async (sucursalId) => {
    try {
      const response = await api.get(`/sierras/sucursal/${sucursalId}`);
      return { 
        success: true, 
        data: response.data.data.map(sierra => transformSierraToFrontend(sierra)) 
      };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al obtener sierras de la sucursal',
      };
    }
  },

  getAllSierras: async () => {
    try {
      const response = await api.get('/sierras/todas');
      return { 
        success: true, 
        data: response.data.data.map(sierra => transformSierraToFrontend(sierra)) 
      };
    } catch (error) {
      console.error("Error detallado:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al obtener todas las sierras',
      };
    }
  },

  getSierrasByCliente: async (clienteId) => {
    try {
      const response = await api.get(`/sierras/cliente/${clienteId}`);
      return { 
        success: true, 
        data: response.data.data.map(sierra => transformSierraToFrontend(sierra)) 
      };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al obtener sierras del cliente',
      };
    }
  },

  createSierra: async (sierraData) => {
    try {
      // Transformar datos al formato de la API
      const apiData = transformSierraToApi(sierraData);
      
      console.log('Datos a enviar al crear sierra:', apiData);
      
      const response = await api.post('/sierras', apiData);
      console.log('Respuesta al crear sierra:', response.data);
      
      // Transformar la respuesta al formato del frontend
      const frontendData = transformSierraToFrontend(response.data.data);
      
      return { success: true, data: frontendData };
    } catch (error) {
      console.error('Error detallado al crear sierra:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al crear sierra',
      };
    }
  },

  updateSierra: async (id, sierraData) => {
    try {
      // Transformar datos al formato de la API
      const apiData = transformSierraToApi(sierraData);
      
      const response = await api.put(`/sierras/${id}`, apiData);
      
      // Transformar la respuesta al formato del frontend
      const frontendData = transformSierraToFrontend(response.data.data);
      
      return { success: true, data: frontendData };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al actualizar sierra',
      };
    }
  },
  
  searchSierraByCodigo: async (codigo) => {
    try {
      const response = await api.get(`/sierras/buscar?codigo=${encodeURIComponent(codigo)}`);
      return { 
        success: true, 
        data: transformSierraToFrontend(response.data.data) 
      };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || 'Error al buscar sierra por código',
      };
    }
  },

  // Método para verificar si una sierra tiene afilados pendientes
  verificarAfiladosPendientes: async (sierraId) => {
    try {
      // Este endpoint debe devolver el último afilado de la sierra
      const response = await api.get(`/sierras/${sierraId}/ultimo-afilado`);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: getApiErrorMessage(error) || 'Error al verificar afilados pendientes'
      };
    }
  },

  // Método para marcar una sierra como "último afilado"
  marcarUltimoAfilado: async (sierraId, esUltimoAfilado) => {
    try {
      // Usamos el endpoint de actualización de sierra que ya debe existir
      const sierraData = {
        activo: !esUltimoAfilado // Si esUltimoAfilado=true, entonces activo=false
      };
      
      const response = await api.put(`/sierras/${sierraId}`, sierraData);
      
      return {
        success: true,
        data: transformSierraToFrontend(response.data.data),
        error: null
      };
    } catch (error) {
      console.error('Error en marcarUltimoAfilado:', error);
      return {
        success: false,
        data: null,
        error: getApiErrorMessage(error) || 'Error al marcar como último afilado'
      };
    }
  },
  
  // Método para obtener el historial de afilados de una sierra
  getHistorialAfilados: async (sierraId) => {
    try {
      const response = await api.get(`/sierras/${sierraId}/afilados`);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: getApiErrorMessage(error) || 'Error al obtener historial de afilados'
      };
    }
  },
  
  // Método para actualizar el estado de la sierra
  actualizarEstadoSierra: async (sierraId, estadoId) => {
    try {
      const response = await api.patch(`/sierras/${sierraId}/estado-sierra`, {
        estado_sierra_id: estadoId
      });
      
      return {
        success: true,
        data: transformSierraToFrontend(response.data.data),
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: getApiErrorMessage(error) || 'Error al actualizar estado de la sierra'
      };
    }
  },
  
  // Método para generar el código QR de una sierra
  generarCodigoQR: async (sierraId) => {
    try {
      const response = await api.get(`/sierras/${sierraId}/qr-code`);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: getApiErrorMessage(error) || 'Error al generar código QR'
      };
    }
  },
  
  // Método para registrar una nueva sierra de forma rápida durante el proceso de afilado
  registroRapidoSierra: async (sierraData) => {
    try {
      const apiData = {
        codigo_barra: sierraData.codigo_barra,
        tipo_sierra_id: sierraData.tipo_sierra_id,
        sucursal_id: sierraData.sucursal_id,
        estado_sierra_id: sierraData.estado_sierra_id || 1, // Estado por defecto (activa)
        activo: true,
        rapido: true // Indicador de que es un registro rápido
      };
      
      const response = await api.post('/sierras/registro-rapido', apiData);
      
      return {
        success: true,
        data: transformSierraToFrontend(response.data.data),
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: getApiErrorMessage(error) || 'Error al registrar sierra rápidamente'
      };
    }
  },
  
  // Método para validar si una sierra puede recibir un nuevo afilado
  validarSierraParaAfilado: async (sierraId) => {
    try {
      // 1. Obtener los datos de la sierra
      const sierraResponse = await api.get(`/sierras/${sierraId}`);
      const sierra = sierraResponse.data.data;
      
      // Verificar si la sierra está activa
      if (!sierra.activo) {
        return {
          success: false,
          puede_afilar: false,
          mensaje: "Esta sierra ha sido marcada como último afilado y no puede recibir nuevos afilados.",
          data: sierra
        };
      }
      
      // 2. Obtener los afilados de la sierra para verificar si hay pendientes
      const afiladosResponse = await api.get(`/afilados/sierra/${sierraId}`);
      const afilados = afiladosResponse.data.data;
      
      // Ordenar por fecha descendente para obtener el más reciente
      const afiladosOrdenados = afilados.sort((a, b) => 
        new Date(b.fecha_afilado) - new Date(a.fecha_afilado)
      );
      
      // Verificar si el último afilado está pendiente (sin fecha_salida)
      if (afiladosOrdenados.length > 0 && !afiladosOrdenados[0].fecha_salida) {
        return {
          success: true,
          puede_afilar: false,
          mensaje: "Esta sierra ya tiene un afilado pendiente que no ha sido retirado.",
          data: {
            sierra,
            ultimoAfilado: afiladosOrdenados[0]
          }
        };
      }
      
      // Si pasa todas las validaciones, puede recibir un nuevo afilado
      return {
        success: true,
        puede_afilar: true,
        mensaje: "Sierra validada correctamente.",
        data: {
          sierra,
          ultimoAfilado: afiladosOrdenados[0] || null
        }
      };
    } catch (error) {
      console.error('Error en validarSierraParaAfilado:', error);
      return {
        success: false,
        puede_afilar: false,
        mensaje: getApiErrorMessage(error) || 'Error al validar sierra para afilado',
        error: getApiErrorMessage(error) || 'Error al validar sierra para afilado'
      };
    }
  },
  
  // Método para eliminar una sierra (baja lógica)
  eliminarSierra: async (sierraId) => {
    try {
      const response = await api.delete(`/sierras/${sierraId}`);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: getApiErrorMessage(error) || 'Error al eliminar sierra'
      };
    }
  }
};

export default sierraService;