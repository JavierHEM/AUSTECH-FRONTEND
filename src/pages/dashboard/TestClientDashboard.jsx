// src/pages/dashboard/TestClientDashboard.jsx
import React from 'react';
import { Typography, Box, Alert } from '@mui/material';
import ClientDashboard from './ClientDashboard'; // Usando la misma importación que DashboardRouter

const TestClientDashboard = () => {
  try {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Probando renderizado de ClientDashboard
        </Alert>
        <ClientDashboard />
      </Box>
    );
  } catch (error) {
    return (
      <Box>
        <Alert severity="error">
          Error al renderizar ClientDashboard: {error.message}
        </Alert>
        <Typography variant="body2" component="pre" sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5' }}>
          {error.stack}
        </Typography>
      </Box>
    );
  }
};

export default TestClientDashboard;