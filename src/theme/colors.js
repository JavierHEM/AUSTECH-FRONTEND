// src/theme/colors.js
// Colores primarios
const primary = {
    main: '#1565C0',      // Azul oscuro - Color principal
    light: '#4A8FE7',     // Azul claro
    dark: '#0D47A1',      // Azul más oscuro
    contrastText: '#FFF', // Texto en fondos de color primario
  };
  
  // Colores secundarios
  const secondary = {
    main: '#26A69A',      // Verde azulado - Acento
    light: '#4DBCB0',     // Verde azulado claro
    dark: '#00897B',      // Verde azulado oscuro
    contrastText: '#FFF', // Texto en fondos de color secundario
  };
  
  // Colores de éxito, error, advertencia e información
  const success = {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
  };
  
  const error = {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
  };
  
  const warning = {
    main: '#F57C00',
    light: '#FFB74D',
    dark: '#E65100',
  };
  
  const info = {
    main: '#0288D1',
    light: '#4FC3F7',
    dark: '#01579B',
  };
  
  // Grises
  const grey = {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  };
  
  // Fondo, papel y texto
  const background = {
    default: '#F5F7FA',  // Fondo de la aplicación
    paper: '#FFFFFF',    // Fondo de las tarjetas/elementos
  };
  
  const text = {
    primary: '#263238',   // Texto principal
    secondary: '#546E7A', // Texto secundario
    disabled: '#9E9E9E',  // Texto deshabilitado
  };
  
  export const themeColors = {
    primary,
    secondary,
    success,
    error,
    warning,
    info,
    grey,
    background,
    text
  };