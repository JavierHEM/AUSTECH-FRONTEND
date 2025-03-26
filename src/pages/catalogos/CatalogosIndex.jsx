// src/pages/catalogos/CatalogosIndex.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Alert
} from '@mui/material';
import {
  Category as CatalogIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  Assignment as EstadoIcon,
  KeyboardArrowRight as ArrowIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CatalogosIndex = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verificar si el usuario tiene permisos
  const canAccess = user?.rol === 'Administrador' || user?.rol === 'Gerente';

  // Catálogos disponibles
  const catalogos = [
    {
      id: 'tipos-sierra',
      title: 'Tipos de Sierra',
      description: 'Gestiona los diferentes tipos de sierras disponibles en el sistema.',
      icon: <SierraIcon fontSize="large" color="secondary" />,
      path: '/catalogos/tipos-sierra',
      color: 'secondary.light'
    },
    {
      id: 'tipos-afilado',
      title: 'Tipos de Afilado',
      description: 'Administra las categorías de afilado que se pueden aplicar a las sierras.',
      icon: <AfiladoIcon fontSize="large" color="primary" />,
      path: '/catalogos/tipos-afilado',
      color: 'primary.light'
    },
    {
      id: 'estados-sierra',
      title: 'Estados de Sierra',
      description: 'Configura los posibles estados en los que puede encontrarse una sierra.',
      icon: <EstadoIcon fontSize="large" color="info" />,
      path: '/catalogos/estados-sierra',
      color: 'info.light'
    }
  ];

  if (!canAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No tienes permisos para acceder a la gestión de catálogos.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Dashboard
        </MuiLink>
        <Typography color="text.primary">Catálogos</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" alignItems="center" mb={4}>
        <CatalogIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Catálogos del Sistema
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        En esta sección puedes administrar los diferentes catálogos utilizados en el sistema.
        Selecciona una de las siguientes opciones para gestionar sus registros.
      </Typography>

      {/* Tarjetas de catálogos */}
      <Grid container spacing={3}>
        {catalogos.map((catalogo) => (
          <Grid item xs={12} md={4} key={catalogo.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                }
              }}
              onClick={() => navigate(catalogo.path)}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Box 
                    sx={{ 
                      backgroundColor: catalogo.color,
                      borderRadius: '8px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {catalogo.icon}
                  </Box>
                  <Typography variant="h5" component="h2" fontWeight="medium">
                    {catalogo.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {catalogo.description}
                </Typography>
                
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    endIcon={<ArrowIcon />} 
                    color="primary"
                    onClick={() => navigate(catalogo.path)}
                  >
                    Acceder
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Lista alternativa para dispositivos móviles (visible solo en pantallas pequeñas) */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Acceso rápido:
        </Typography>
        <Card>
          <List>
            {catalogos.map((catalogo, index) => (
              <React.Fragment key={catalogo.id}>
                {index > 0 && <Divider />}
                <ListItemButton onClick={() => navigate(catalogo.path)}>
                  <ListItemIcon>
                    {catalogo.icon}
                  </ListItemIcon>
                  <ListItemText primary={catalogo.title} />
                  <ArrowIcon color="action" />
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Box>
    </Box>
  );
};

export default CatalogosIndex;