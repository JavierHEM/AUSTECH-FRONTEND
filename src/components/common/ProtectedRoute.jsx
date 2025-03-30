// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

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
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si hay roles requeridos y el usuario no tiene ninguno de ellos
  if (requiredRoles.length > 0 && 
      (!user?.rol || !requiredRoles.includes(user.rol))) {
    
    // Si es un cliente intentando acceder a rutas de admin, redirigir a rutas de cliente
    if (user?.rol === 'Cliente') {
      // Intentar mapear rutas administrativas a rutas de cliente
      if (location.pathname.startsWith('/sierras')) {
        return <Navigate to="/mis-sierras" replace />;
      } else if (location.pathname.startsWith('/afilados')) {
        return <Navigate to="/mis-afilados" replace />;
      } else if (location.pathname.startsWith('/sucursales')) {
        return <Navigate to="/mis-sucursales" replace />;
      } else if (location.pathname.startsWith('/reportes')) {
        return <Navigate to="/mis-reportes" replace />;
      }
    }
    
    // Si el Administrador intenta acceder a rutas solo para Gerente
    if (user?.rol === 'Administrador' && location.pathname.startsWith('/usuarios')) {
      return <Navigate to="/acceso-denegado" replace />;
    }
    
    // Redirigir a una página de acceso denegado
    return <Navigate to="/acceso-denegado" replace />;
  }

  // Si todo está bien, renderizar los componentes hijos
  return <Outlet />;
};

export default ProtectedRoute;