// src/pages/common/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Grid
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

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
          <ErrorIcon color="error" sx={{ fontSize: 80 }} />
        </Box>
        
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Página no encontrada
        </Typography>
        
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Lo sentimos, la página que estás buscando no existe.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          La página que intentas visitar podría haber sido eliminada, renombrada 
          o estar temporalmente no disponible.
        </Typography>
        
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
        </Grid>
      </Paper>
    </Container>
  );
};

export default NotFound;