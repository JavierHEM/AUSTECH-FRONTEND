// src/pages/dashboard/DashboardRouter.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Importar los diferentes dashboards
import Dashboard from './Dashboard'; // Dashboard para Gerente y Administrador
import ClientDashboard from './ClientDashboard'; // Dashboard para Clientes

const DashboardRouter = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Mostrar carga mientras se verifica la autenticación
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Decidir qué dashboard mostrar según el rol del usuario
  const rol = user.rol;
  
  if (rol === 'Cliente') {
    return <ClientDashboard />;
  } else if (rol === 'Gerente' || rol === 'Administrador') {
    return <Dashboard />;
  } else {
    // Si el rol no es reconocido, mostrar una alerta
    return (
      <Box p={3}>
        <Alert severity="error">
          Su rol ({rol || 'No definido'}) no tiene un dashboard asignado. Por favor, contacte con el administrador del sistema.
        </Alert>
      </Box>
    );
  }
};

export default DashboardRouter;