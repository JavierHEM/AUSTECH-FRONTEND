// src/utils/dataTransformUtils.js

/**
 * Transforma los datos de una sierra del formato del frontend al formato de la API
 * @param {Object} frontendData - Datos en formato frontend
 * @returns {Object} - Datos en formato API
 */
export const transformSierraToApi = (frontendData) => {
    const apiData = {
      ...frontendData,
      codigo: frontendData.codigo_barra,
    };
    
    delete apiData.codigo_barra;
    
    return apiData;
  };
  
  /**
   * Transforma los datos de una sierra del formato de la API al formato del frontend
   * @param {Object} apiData - Datos en formato API
   * @returns {Object} - Datos en formato frontend
   */
  export const transformSierraToFrontend = (apiData) => {
    const frontendData = {
      ...apiData,
      codigo_barra: apiData.codigo || apiData.codigo_barra,
    };
    
    // Asegurarnos de que tenemos siempre codigo_barra
    if (!frontendData.codigo_barra && apiData.id) {
      frontendData.codigo_barra = `SIERRA-${apiData.id.toString().padStart(3, '0')}`;
    }
    
    return frontendData;
  };
  
  /**
   * Función genérica para transformar errores de la API a mensajes amigables
   * @param {Object} error - Error de Axios o similar
   * @returns {String} - Mensaje de error para el usuario
   */
  export const getApiErrorMessage = (error) => {
    if (error.response?.data?.errors && error.response.data.errors.length > 0) {
      return error.response.data.errors[0].msg || 'Error en la solicitud';
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    return error.message || 'Error desconocido';
  };