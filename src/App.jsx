// src/App.jsx
import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Importar nuestro ThemeProvider
import { useThemeMode } from './context/ThemeContext'; // Importar hook para acceder al tema
import { createAppTheme } from './theme/theme'; // Importar la función de creación de tema
import AppRoutes from './routes';

// Componente que selecciona el tema según el modo
const ThemedApp = () => {
  const { darkMode } = useThemeMode();
  const theme = createAppTheme(darkMode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={5000}
      >
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;