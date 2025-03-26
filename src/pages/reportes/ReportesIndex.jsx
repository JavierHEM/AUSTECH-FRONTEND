// src/pages/reportes/ReportesIndex.jsx
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
  Paper
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  KeyboardArrowRight as ArrowIcon,
  Timeline as TimelineIcon,
  DateRange as DateRangeIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ReportesIndex = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verificar si el usuario tiene permisos
  const canAccess = user?.rol === 'Administrador' || user?.rol === 'Gerente';

  // Reportes disponibles
  const reportes = [
    {
      id: 'afilados-cliente',
      title: 'Afilados por Cliente',
      description: 'Reporte de todos los afilados realizados para cada cliente, con filtros por fecha y sucursal.',
      icon: <BusinessIcon fontSize="large" color="primary" />,
      path: '/reportes/afilados-cliente',
      color: 'primary.lighter'
    },
    {
      id: 'afilados-sucursal',
      title: 'Afilados por Sucursal',
      description: 'Análisis detallado de los afilados por sucursal, permitiendo comparar el rendimiento entre diferentes ubicaciones.',
      icon: <SucursalIcon fontSize="large" color="secondary" />,
      path: '/reportes/afilados-sucursal',
      color: 'secondary.lighter'
    },
    {
      id: 'historial-sierras',
      title: 'Historial de Sierras',
      description: 'Seguimiento completo del historial de afilados para cada sierra, mostrando todos los servicios realizados en el tiempo.',
      icon: <SierraIcon fontSize="large" color="info" />,
      path: '/reportes/historial-sierras',
      color: 'info.lighter'
    },
    {
      id: 'afilados-tiempo',
      title: 'Análisis Temporal',
      description: 'Análisis de tendencias y estadísticas de afilados a lo largo del tiempo, visualizando patrones estacionales o periódicos.',
      icon: <TimelineIcon fontSize="large" color="warning" />,
      path: '/reportes/afilados-tiempo',
      color: 'warning.lighter'
    }
  ];

  if (!canAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Acceso Restringido
          </Typography>
          <Typography variant="body1">
            No tienes permisos para acceder al módulo de reportes. Por favor, contacta al administrador si necesitas acceso.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </Paper>
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
        <Typography color="text.primary">Reportes</Typography>
      </Breadcrumbs>

      {/* Encabezado */}
      <Box display="flex" alignItems="center" mb={4}>
        <ReportIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Reportes del Sistema
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        En esta sección puedes generar diferentes reportes para analizar los datos del sistema.
        Selecciona una de las siguientes opciones para visualizar el reporte deseado.
      </Typography>

      {/* Tarjetas de reportes */}
      <Grid container spacing={3}>
        {reportes.map((reporte) => (
          <Grid item xs={12} md={6} key={reporte.id}>
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
              onClick={() => navigate(reporte.path)}
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
                      backgroundColor: reporte.color,
                      borderRadius: '8px',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {reporte.icon}
                  </Box>
                  <Typography variant="h5" component="h2" fontWeight="medium">
                    {reporte.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {reporte.description}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    <DateRangeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Incluye filtros por fecha
                  </Typography>
                  <Button 
                    variant="contained"
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={() => navigate(reporte.path)}
                  >
                    Generar
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
          Acceso rápido a reportes:
        </Typography>
        <Card>
          <List>
            {reportes.map((reporte, index) => (
              <React.Fragment key={reporte.id}>
                {index > 0 && <Divider />}
                <ListItemButton onClick={() => navigate(reporte.path)}>
                  <ListItemIcon>
                    {reporte.icon}
                  </ListItemIcon>
                  <ListItemText primary={reporte.title} />
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

export default ReportesIndex;