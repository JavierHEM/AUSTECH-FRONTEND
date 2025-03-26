// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardHeader, 
  Divider, 
  Button,
  useTheme,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Person as PersonIcon,
  Business as BusinessIcon,
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  AccessTime as TimeIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  CheckCircleOutline as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService'; 
import sierraService from '../../services/sierraService';
import afiladoService from '../../services/afiladoService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para mostrar métricas
const StatCard = ({ title, value, prevValue, icon, color, onClick, isLoading, isPercentage }) => {
  const theme = useTheme();
  const { darkMode } = useThemeMode();
  
  // Calcular el cambio porcentual
  const calculateChange = () => {
    if (!prevValue || prevValue === 0) return 0;
    return ((value - prevValue) / prevValue) * 100;
  };
  
  const changePercent = calculateChange();
  const isPositive = changePercent > 0;
  const showTrend = prevValue !== undefined && prevValue !== null;

  return (
    <Card
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box
              sx={{
                backgroundColor: `${color}.${darkMode ? 'dark' : 'lighter'}`,
                borderRadius: '12px',
                height: 64,
                width: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {React.cloneElement(icon, { 
                style: { fontSize: 32, color: theme.palette[color][darkMode ? 'light' : 'main'] } 
              })}
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h4" fontWeight="bold">
                {isLoading ? <CircularProgress size={24} /> : isPercentage ? `${value}%` : value}
              </Typography>
              
              {showTrend && !isLoading && (
                <Chip
                  size="small"
                  icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${isPositive ? '+' : ''}${changePercent.toFixed(1)}%`}
                  color={isPositive ? 'success' : 'error'}
                  sx={{ ml: 1, height: 24 }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Componente para pestañas
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { darkMode } = useThemeMode();
  const [tabValue, setTabValue] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    usuariosCount: null,
    clientesCount: null,
    sucursalesCount: null,
    sierrasCount: null,
    afiladosCount: null,
    afiladosPendientes: null,
    afiladosCompletados: null,
    afiladosUltimos30Dias: null,
    rendimientoPromedio: null
  });
  
  const [afiladosPendientes, setAfiladosPendientes] = useState([]);
  const [sierrasRecientes, setSierrasRecientes] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  
  // Estado para manejar si el usuario puede agregar/editar clientes
  const isAdmin = user?.rol === 'Gerente' || user?.rol === 'Administrador';

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // En una aplicación real, tendrías un endpoint específico para el dashboard
        // Aquí simulamos cargando datos de varios endpoints
        
        // Cargar estadísticas básicas
        const pendientesResponse = await afiladoService.getAfiladosPendientes();
        let pendientes = [];
        if (pendientesResponse.success) {
          pendientes = pendientesResponse.data;
          setAfiladosPendientes(pendientes.slice(0, 5)); // Tomar los 5 primeros
        }
        
        // Simulación de estadísticas (en producción vendrían del backend)
        setTimeout(() => {
          setStats({
            usuariosCount: 24,
            clientesCount: 18,
            sucursalesCount: 35,
            sierrasCount: 156,
            afiladosCount: 487,
            afiladosPendientes: pendientes.length,
            afiladosCompletados: 452,
            afiladosUltimos30Dias: 78,
            rendimientoPromedio: 92
          });
          
          // Simulación de sierras recientes
          setSierrasRecientes([
            { id: 1, codigo: 'SIERRA001', tipo: 'Sierra Cinta', sucursal: 'Sucursal Central', cliente: 'Empresa A', fechaRegistro: '2023-01-15' },
            { id: 2, codigo: 'SIERRA002', tipo: 'Sierra Circular', sucursal: 'Sucursal Norte', cliente: 'Empresa B', fechaRegistro: '2023-01-18' },
            { id: 3, codigo: 'SIERRA003', tipo: 'Sierra Cinta', sucursal: 'Sucursal Sur', cliente: 'Empresa C', fechaRegistro: '2023-01-20' },
          ]);
          
          // Simulación de clientes top
          setClientesTop([
            { id: 1, nombre: 'Empresa A', afilados: 45, sierras: 12 },
            { id: 2, nombre: 'Empresa B', afilados: 32, sierras: 8 },
            { id: 3, nombre: 'Empresa C', afilados: 28, sierras: 9 },
            { id: 4, nombre: 'Empresa D', afilados: 21, sierras: 5 },
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Función para manejar el cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Bienvenido, {user?.nombre || 'Usuario'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Resumen del sistema de afilado de sierras
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas principales */}
      <Grid container spacing={3} mb={4}>
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Usuarios"
              value={stats.usuariosCount}
              icon={<PersonIcon />}
              color="primary"
              onClick={() => navigate('/usuarios')}
              isLoading={loading}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clientes"
            value={stats.clientesCount}
            icon={<BusinessIcon />}
            color="info"
            onClick={() => navigate('/clientes')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sucursales"
            value={stats.sucursalesCount}
            icon={<SucursalIcon />}
            color="secondary"
            onClick={() => navigate('/sucursales')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sierras"
            value={stats.sierrasCount}
            icon={<SierraIcon />}
            color="success"
            onClick={() => navigate('/sierras')}
            isLoading={loading}
          />
        </Grid>
      </Grid>

      {/* Estadísticas de afilados */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Afilados Totales"
            value={stats.afiladosCount}
            prevValue={430} // Valor anterior de comparación
            icon={<AfiladoIcon />}
            color="warning"
            onClick={() => navigate('/afilados')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Afilados Pendientes"
            value={stats.afiladosPendientes}
            prevValue={42} // Valor anterior para comparar
            icon={<WarningIcon />}
            color="error"
            onClick={() => navigate('/afilados?pendientes=true')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Últimos 30 días"
            value={stats.afiladosUltimos30Dias}
            prevValue={65} // Anterior
            icon={<TimelineIcon />}
            color="info"
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rendimiento"
            value={stats.rendimientoPromedio}
            prevValue={88} // Anterior
            icon={<PieChartIcon />}
            color="success"
            isLoading={loading}
            isPercentage={true}
          />
        </Grid>
      </Grid>

      {/* Pestañas para diferentes secciones */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Afilados Pendientes" icon={<WarningIcon />} iconPosition="start" />
            <Tab label="Sierras Recientes" icon={<SierraIcon />} iconPosition="start" />
            <Tab label="Clientes Top" icon={<BusinessIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* Panel de Afilados Pendientes */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardHeader 
              title="Afilados Pendientes de Entrega" 
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/afilados?pendientes=true')}
                >
                  Ver Todos
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : afiladosPendientes.length === 0 ? (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  No hay afilados pendientes de entrega. ¡Todo al día!
                </Alert>
              ) : (
                <List>
                  {afiladosPendientes.map((afilado) => (
                    <ListItem
                      key={afilado.id}
                      secondaryAction={
                        <Tooltip title="Ver Detalle">
                          <IconButton 
                            edge="end" 
                            onClick={() => navigate(`/afilados/${afilado.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      }
                      divider
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'warning.light',
                            color: 'warning.contrastText'
                          }}
                        >
                          <AfiladoIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            Sierra: {afilado.sierras?.codigo || 'No especificada'} 
                            <Chip 
                              size="small" 
                              label={afilado.tipos_afilado?.nombre || 'No especificado'} 
                              sx={{ ml: 1 }}
                              variant="outlined"
                            />
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Cliente: {afilado.sierras?.sucursales?.clientes?.razon_social || 'No especificado'}
                            </Typography>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                              <Typography variant="caption">
                                Fecha de ingreso: {formatDate(afilado.fecha_afilado)}
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Panel de Sierras Recientes */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader 
              title="Sierras Recientemente Registradas" 
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/sierras')}
                >
                  Ver Todas
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : sierrasRecientes.length === 0 ? (
                <Alert severity="info">
                  No hay sierras registradas recientemente.
                </Alert>
              ) : (
                <List>
                  {sierrasRecientes.map((sierra) => (
                    <ListItem
                      key={sierra.id}
                      secondaryAction={
                        <Tooltip title="Ver Detalle">
                          <IconButton 
                            edge="end" 
                            onClick={() => navigate(`/sierras/${sierra.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      }
                      divider
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'secondary.light',
                            color: 'secondary.contrastText'
                          }}
                        >
                          <SierraIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {sierra.codigo} 
                            <Chip 
                              size="small" 
                              label={sierra.tipo} 
                              sx={{ ml: 1 }}
                              variant="outlined"
                              color="secondary"
                            />
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {sierra.cliente} - {sierra.sucursal}
                            </Typography>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                              <Typography variant="caption">
                                Registrada: {formatDate(sierra.fechaRegistro)}
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Panel de Clientes Top */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader 
              title="Clientes con Mayor Actividad" 
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/clientes')}
                >
                  Ver Todos
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : clientesTop.length === 0 ? (
                <Alert severity="info">
                  No hay datos de actividad de clientes disponibles.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {clientesTop.map((cliente) => (
                    <Grid item xs={12} md={6} key={cliente.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'info.light',
                                color: 'info.contrastText',
                                mr: 2
                              }}
                            >
                              <BusinessIcon />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {cliente.nombre}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Afilados
                              </Typography>
                              <Typography variant="h6" color="info.main">
                                {cliente.afilados}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Sierras
                              </Typography>
                              <Typography variant="h6" color="secondary.main">
                                {cliente.sierras}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                              onClick={() => navigate(`/clientes/${cliente.id}`)}
                            >
                              Ver Detalle
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Box>

      {/* Sección de acciones rápidas */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Acciones Rápidas" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SierraIcon />}
                onClick={() => navigate('/sierras/nueva')}
              >
                Registrar Sierra
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<AfiladoIcon />}
                onClick={() => navigate('/afilados/nuevo')}
              >
                Nuevo Afilado
              </Button>
            </Grid>
            {isAdmin && (
              <Grid item>
                <Button 
                  variant="contained" 
                  color="info"
                  startIcon={<BusinessIcon />}
                  onClick={() => navigate('/clientes/nuevo')}
                >
                  Registrar Cliente
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button 
                variant="outlined" 
                color="warning"
                startIcon={<AnalyticsIcon />}
                onClick={() => navigate('/reportes')}
              >
                Ver Reportes
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;