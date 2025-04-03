// src/pages/dashboard/DashboardRouter.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Alert, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Importar los diferentes dashboards
import Dashboard from './Dashboard'; // Dashboard para Gerente y Administrador
import ClientDashboard from './ClientDashboard'; // Dashboard para Clientes

const DashboardRouter = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [debug, setDebug] = useState(false);

  // Mostrar información de debugging en consola
  useEffect(() => {
    console.log("DashboardRouter - Datos del usuario:", {
      isAuthenticated,
      loading,
      user: user || 'No hay usuario',
      rol: user?.rol || 'No definido'
    });
  }, [user, isAuthenticated, loading]);

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
    console.log("Usuario no autenticado, redirigiendo a login");
    return <Navigate to="/login" />;
  }

  // IMPORTANTE: Normalizar el rol para hacer la comparación más robusta
  // Convertir a minúsculas y eliminar espacios
  const userRole = user.rol ? String(user.rol).trim().toLowerCase() : '';
  
  console.log(`Rol normalizado para comparación: "${userRole}"`);
  
  const showClientDashboard = userRole === 'cliente';
  const showAdminDashboard = userRole === 'gerente' || userRole === 'administrador';
  
  console.log("¿Mostrar dashboard de Cliente?", showClientDashboard);
  console.log("¿Mostrar dashboard de Admin/Gerente?", showAdminDashboard);

  // Decidir qué dashboard mostrar según el rol normalizado
  if (showClientDashboard) {
    console.log("▶️ Renderizando ClientDashboard para rol Cliente");
    return <ClientDashboard />;
  } else if (showAdminDashboard) {
    console.log("▶️ Renderizando Dashboard para rol Gerente/Administrador");
    return <Dashboard />;
  } else {
    // Si el rol no es reconocido, mostrar una alerta con debugging
    console.warn("⚠️ Rol no reconocido o no compatible:", user.rol);
    
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Su rol ({user.rol || 'No definido'}) no tiene un dashboard asignado. Por favor, contacte con el administrador del sistema.
        </Alert>
        
        <Button 
          variant="outlined" 
          color="info" 
          size="small"
          onClick={() => setDebug(!debug)}
          sx={{ my: 1 }}
        >
          {debug ? "Ocultar información de diagnóstico" : "Mostrar información de diagnóstico"}
        </Button>
        
        {debug && (
          <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid #ddd">
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Información de diagnóstico:
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Usuario autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'} <br />
              <strong>Rol detectado:</strong> {user.rol || 'Ninguno'} <br /> 
              <strong>Rol normalizado:</strong> {userRole} <br />
              <strong>Dashboard Cliente:</strong> {showClientDashboard ? 'Sí' : 'No'} <br />
              <strong>Dashboard Admin:</strong> {showAdminDashboard ? 'Sí' : 'No'} <br />
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom fontWeight="bold" mt={2}>
              Datos completos del usuario:
            </Typography>
            <Box 
              component="pre" 
              sx={{ 
                bgcolor: '#f5f5f5', 
                p: 1, 
                borderRadius: 1, 
                overflow: 'auto', 
                maxHeight: 200,
                fontSize: '0.75rem'
              }}
            >
              {JSON.stringify(user, null, 2)}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
};

export default DashboardRouter;