// src/theme/theme.js
import { createTheme } from '@mui/material/styles';
import { themeColors } from './colors';

// Función para crear el tema según el modo
export const createAppTheme = (darkMode) => {
  // Configuración común para ambos temas
  const commonThemeSettings = {
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 600, fontSize: '2.5rem' },
      h2: { fontWeight: 600, fontSize: '2rem' },
      h3: { fontWeight: 600, fontSize: '1.75rem' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: themeColors.primary.dark,
            },
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: themeColors.secondary.dark,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            borderRadius: 16,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : themeColors.grey[200],
          },
          head: {
            fontWeight: 600,
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : themeColors.grey[50],
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : themeColors.grey[50],
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#1E1E1E' : '#ffffff',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: darkMode ? 'rgba(21, 101, 192, 0.2)' : 'rgba(21, 101, 192, 0.12)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            '&.MuiChip-outlined': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 42,
          },
        },
      },
    },
  };

  // Colores para modo oscuro
  const darkThemeColors = {
    primary: themeColors.primary,
    secondary: themeColors.secondary,
    success: themeColors.success,
    error: themeColors.error,
    warning: themeColors.warning,
    info: themeColors.info,
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#686868',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  };

  // Colores para modo claro (mantener los originales)
  const lightThemeColors = {
    primary: themeColors.primary,
    secondary: themeColors.secondary,
    success: themeColors.success,
    error: themeColors.error,
    warning: themeColors.warning,
    info: themeColors.info,
    background: themeColors.background,
    text: themeColors.text,
  };

  // Crear y devolver el tema según el modo
  return createTheme({
    ...commonThemeSettings,
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode ? darkThemeColors : lightThemeColors),
    },
  });
};

// Exportar tema por defecto (modo claro)
const theme = createAppTheme(false);
export default theme;