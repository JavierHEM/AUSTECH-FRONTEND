// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles requeridos y el usuario no tiene ninguno de ellos
  if (requiredRoles.length > 0 && 
      (!user?.rol || !requiredRoles.includes(user.rol))) {
    // Redirigir a una página de acceso denegado
    return <Navigate to="/acceso-denegado" replace />;
  }

  // Si todo está bien, renderizar los componentes hijos
  return <Outlet />;
};

export default ProtectedRoute;