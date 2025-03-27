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
import userService from '../../services/userService';
import { format, subDays, formatDistance } from 'date-fns';
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
  
  // Estado para valores previos (para comparaciones)
  const [prevStats, setPrevStats] = useState({
    afiladosCount: null,
    afiladosPendientes: null,
    afiladosUltimos30Dias: null,
    rendimientoPromedio: null
  });
  
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
  
  // Función para calcular tiempo transcurrido
  const calcularTiempoTranscurrido = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const fecha = new Date(dateString);
      return formatDistance(fecha, new Date(), { 
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para calcular rendimiento promedio de afilados
  const calcularRendimientoPromedio = (afilados) => {
    if (!afilados || afilados.length === 0) return 0;
    
    // Filtrar afilados que tienen campo de rendimiento
    const afiladosConRendimiento = afilados.filter(a => a.rendimiento);
    if (afiladosConRendimiento.length === 0) return 0;
    
    // Calcular promedio
    const sumaRendimientos = afiladosConRendimiento.reduce((total, afilado) => {
      return total + (parseFloat(afilado.rendimiento) || 0);
    }, 0);
    
    return Math.round(sumaRendimientos / afiladosConRendimiento.length);
  };

  // Función para obtener los datos de afilados de los últimos 30 días
  const obtenerAfiladosUltimos30Dias = (afilados) => {
    if (!afilados || !Array.isArray(afilados)) return [];
    
    const fechaLimite = subDays(new Date(), 30);
    return afilados.filter(afilado => {
      if (!afilado.fecha_afilado) return false;
      try {
        const fechaAfilado = new Date(afilado.fecha_afilado);
        return fechaAfilado >= fechaLimite;
      } catch (e) {
        console.error("Error al procesar fecha:", e);
        return false;
      }
    });
  };

  // Función para obtener los clientes con más actividad
  const obtenerClientesTop = async (afilados, sierras) => {
    try {
      // Obtener todos los clientes
      const clientesResponse = await clienteService.getAllClientes();
      if (!clientesResponse.success) throw new Error("Error al obtener clientes");
      
      const clientes = clientesResponse.data;
      
      // Crear mapa de afilados por cliente
      const afiladosPorCliente = {};
      const sierrasPorCliente = {};
      
      // Inicializar conteo para cada cliente
      clientes.forEach(cliente => {
        afiladosPorCliente[cliente.id] = 0;
        sierrasPorCliente[cliente.id] = 0;
      });
      
      // Contar afilados por cliente
      afilados.forEach(afilado => {
        // Asumiendo que afilado tiene información anidada de sierra > sucursal > cliente
        const clienteId = afilado.sierras?.sucursales?.cliente_id;
        if (clienteId && afiladosPorCliente[clienteId] !== undefined) {
          afiladosPorCliente[clienteId]++;
        }
      });
      
      // Contar sierras por cliente
      sierras.forEach(sierra => {
        const clienteId = sierra.sucursales?.cliente_id;
        if (clienteId && sierrasPorCliente[clienteId] !== undefined) {
          sierrasPorCliente[clienteId]++;
        }
      });
      
      // Combinar datos y ordenar por número de afilados
      const clientesConDatos = clientes.map(cliente => ({
        id: cliente.id,
        nombre: cliente.razon_social,
        afilados: afiladosPorCliente[cliente.id] || 0,
        sierras: sierrasPorCliente[cliente.id] || 0
      }))
      .filter(cliente => cliente.afilados > 0 || cliente.sierras > 0); // Solo mostrar clientes con actividad
      
      // Ordenar y tomar los 4 con más afilados
      return clientesConDatos
        .sort((a, b) => b.afilados - a.afilados)
        .slice(0, 4);
      
    } catch (error) {
      console.error("Error al calcular clientes top:", error);
      return [];
    }
  };

  // Función para manejar el cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Obtener datos de usuarios
        let usuariosCount = 0;
        if (isAdmin) {
          const usuariosResponse = await userService.getAllUsers();
          console.log('Respuesta de usuarios:', usuariosResponse); // Log para depuración
          if (usuariosResponse.success) {
            usuariosCount = usuariosResponse.data.length;
            console.log('Número real de usuarios:', usuariosCount); // Log para depuración
          }
        }
        
        // Obtener datos de clientes
        const clientesResponse = await clienteService.getAllClientes();
        const clientesCount = clientesResponse.success ? clientesResponse.data.length : 0;
        
        // Obtener datos de sucursales
        const sucursalesResponse = await sucursalService.getAllSucursales();
        const sucursalesCount = sucursalesResponse.success ? sucursalesResponse.data.length : 0;
        
        // Obtener datos de sierras
        const sierrasResponse = await sierraService.getAllSierras();
        const sierras = sierrasResponse.success ? sierrasResponse.data : [];
        const sierrasCount = sierras.length;
        
        // Obtener sierras recientes (ordenadas por fecha de registro)
        const sierrasRecientes = [...sierras]
          .sort((a, b) => new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0))
          .slice(0, 3)
          .map(sierra => ({
            id: sierra.id,
            codigo: sierra.codigo,
            tipo: sierra.tipo_sierra?.nombre || 'No especificado',
            sucursal: sierra.sucursales?.nombre || 'No especificada',
            cliente: sierra.sucursales?.clientes?.razon_social || 'No especificado',
            fechaRegistro: sierra.fecha_registro
          }));
        
        setSierrasRecientes(sierrasRecientes);
        
        // Obtener datos de afilados
        const afiladosResponse = await afiladoService.getAllAfilados();
        const afilados = afiladosResponse.success ? afiladosResponse.data : [];
        const afiladosCount = afilados.length;
        
        // Obtener afilados pendientes
        const pendientesResponse = await afiladoService.getAfiladosPendientes();
        const afiladosPendientes = pendientesResponse.success ? pendientesResponse.data : [];
        setAfiladosPendientes(afiladosPendientes.slice(0, 5));
        
        // Calcular afilados completados
        const afiladosCompletados = afilados.filter(afilado => afilado.fecha_salida).length;
        
        // Calcular afilados de los últimos 30 días
        const afiladosUltimos30Dias = obtenerAfiladosUltimos30Dias(afilados).length;
        
        // Calcular rendimiento promedio
        const rendimientoPromedio = calcularRendimientoPromedio(afilados);
        
        // Obtener clientes top
        const clientesTopData = await obtenerClientesTop(afilados, sierras);
        setClientesTop(clientesTopData);
        
        // Calcular valores previos (para mostrar tendencias)
        // En un sistema real, estos vendrían de datos históricos
        // Aquí hacemos una simulación para mostrar la funcionalidad
        const prevAfiladosCount = Math.max(0, afiladosCount - Math.floor(afiladosCount * 0.05));
        const prevAfiladosPendientes = Math.max(0, afiladosPendientes.length + 2);
        const prevAfiladosUltimos30Dias = Math.max(0, afiladosUltimos30Dias - 5);
        const prevRendimientoPromedio = Math.max(0, rendimientoPromedio - 3);
        
        setPrevStats({
          afiladosCount: prevAfiladosCount,
          afiladosPendientes: prevAfiladosPendientes,
          afiladosUltimos30Dias: prevAfiladosUltimos30Dias,
          rendimientoPromedio: prevRendimientoPromedio
        });
        
        // Actualizar estadísticas
        setStats({
          usuariosCount,
          clientesCount,
          sucursalesCount,
          sierrasCount,
          afiladosCount,
          afiladosPendientes: afiladosPendientes.length,
          afiladosCompletados,
          afiladosUltimos30Dias,
          rendimientoPromedio
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

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
                                Ingreso: {formatDate(afilado.fecha_afilado)} ({calcularTiempoTranscurrido(afilado.fecha_afilado)})
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