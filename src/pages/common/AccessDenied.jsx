// src/pages/common/AccessDenied.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Grid,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          mt: 8,
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <SecurityIcon color="error" sx={{ fontSize: 80 }} />
        </Box>
        
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Acceso Denegado
        </Typography>
        
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          No tienes permisos para acceder a esta página.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Tu cuenta de usuario no tiene los permisos necesarios para acceder a esta sección. 
          Si crees que deberías tener acceso, por favor contacta al administrador del sistema.
        </Typography>

        {user && (
          <Box sx={{ mb: 4, mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Sesión actual:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {user.nombre} ({user.email})
            </Typography>
            <Typography variant="body2" color="primary">
              Rol: {user.rol}
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
              size="large"
            >
              Ir al Dashboard
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Volver atrás
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={logout}
              size="large"
            >
              Cerrar Sesión
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AccessDenied;