// src/pages/dashboard/ClientDashboard.jsx
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
  Tabs,
  LinearProgress
} from '@mui/material';
import { 
  StorefrontOutlined as SucursalIcon,
  ContentCut as SierraIcon,
  BuildCircle as AfiladoIcon,
  Visibility as VisibilityIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  CheckCircleOutline as CheckCircleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  ReceiptLong as ReceiptIcon,
  History as HistoryIcon,
  PendingActions as PendingIcon,
  DoneAll as DoneAllIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';

// Importación de servicios necesarios
import clienteService from '../../services/clienteService';
import sucursalService from '../../services/sucursalService'; 
import sierraService from '../../services/sierraService';
import afiladoService from '../../services/afiladoService';

// Utilidades de fechas
import { format, subDays, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para tarjetas de estadísticas
const StatCard = ({ title, value, icon, color, onClick, isLoading, subtitle }) => {
  const theme = useTheme();
  const { darkMode } = useThemeMode();
  
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
            <Typography variant="h4" fontWeight="bold">
              {isLoading ? <CircularProgress size={24} /> : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
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
      id={`client-dashboard-tabpanel-${index}`}
      aria-labelledby={`client-dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { darkMode } = useThemeMode();
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para datos
  const [loading, setLoading] = useState(true);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [stats, setStats] = useState({
    sucursalesCount: 0,
    sierrasCount: 0,
    afiladosCount: 0,
    afiladosPendientes: 0,
    afiladosUltimos30Dias: 0
  });
  
  const [afiladosPendientes, setAfiladosPendientes] = useState([]);
  const [afiladosRecientes, setAfiladosRecientes] = useState([]);
  const [sierrasRecientes, setSierrasRecientes] = useState([]);
  const [error, setError] = useState(null);

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

  // Función para manejar el cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchClientDashboardData = async () => {
      if (!user || !user.cliente_id) {
        console.error("No se encontró ID de cliente para el usuario");
        setLoading(false);
        setError("Su cuenta no está asociada a ningún cliente. Por favor, contacte con el administrador del sistema.");
        return;
      }

      setLoading(true);
      try {
        // Obtener información del cliente
        const clienteResponse = await clienteService.getClienteById(user.cliente_id);
        if (!clienteResponse.success) {
          throw new Error(clienteResponse.error || "Error al obtener información del cliente");
        }
        
        setClienteInfo(clienteResponse.data);
        
        // Obtener sucursales del cliente
        const sucursalesResponse = await sucursalService.getSucursalesByCliente(user.cliente_id);
        if (!sucursalesResponse.success) {
          throw new Error(sucursalesResponse.error || "Error al obtener sucursales del cliente");
        }
        
        const sucursalesData = sucursalesResponse.data;
        setSucursales(sucursalesData);
        
        // Obtener todas las sierras del cliente
        const sierrasResponse = await sierraService.getSierrasByCliente(user.cliente_id);
        if (!sierrasResponse.success) {
          throw new Error(sierrasResponse.error || "Error al obtener sierras del cliente");
        }
        
        const todasLasSierras = sierrasResponse.data;
        
        // Obtener sierras recientes (ordenadas por fecha de registro)
        const sierrasRecientes = [...todasLasSierras]
          .sort((a, b) => new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0))
          .slice(0, 5)
          .map(sierra => ({
            id: sierra.id,
            codigo: sierra.codigo_barra || sierra.codigo,
            tipo: sierra.tipos_sierra?.nombre || 'No especificado',
            sucursal: sierra.sucursales?.nombre || 'No especificada',
            fechaRegistro: sierra.fecha_registro
          }));
        
        setSierrasRecientes(sierrasRecientes);
        
        // Obtener afilados relacionados con el cliente
        const afiladosResponse = await afiladoService.getAfiladosByCliente(user.cliente_id);
        if (!afiladosResponse.success) {
          throw new Error(afiladosResponse.error || "Error al obtener afilados del cliente");
        }
        
        const todosLosAfilados = afiladosResponse.data;
        
        // Obtener afilados pendientes
        const afiladosPendientes = todosLosAfilados.filter(afilado => !afilado.fecha_salida);
        setAfiladosPendientes(afiladosPendientes.slice(0, 5));
        
        // Obtener afilados recientes
        const afiladosRecientes = [...todosLosAfilados]
          .sort((a, b) => new Date(b.fecha_afilado || 0) - new Date(a.fecha_afilado || 0))
          .slice(0, 5);
        setAfiladosRecientes(afiladosRecientes);
        
        // Calcular afilados de los últimos 30 días
        const afiladosUltimos30Dias = obtenerAfiladosUltimos30Dias(todosLosAfilados).length;
        
        // Actualizar estadísticas
        setStats({
          sucursalesCount: sucursalesData.length,
          sierrasCount: todasLasSierras.length,
          afiladosCount: todosLosAfilados.length,
          afiladosPendientes: afiladosPendientes.length,
          afiladosUltimos30Dias
        });
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard del cliente:', error);
        setError(error.message || "Error al cargar datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDashboardData();
  }, [user]);

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Bienvenido, {user?.nombre || 'Cliente'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Panel de control de {clienteInfo?.razon_social || 'su empresa'}
        </Typography>
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Información del cliente */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Información de Cliente" 
          avatar={<BusinessIcon color="primary" />}
        />
        <Divider />
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : clienteInfo ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Razón Social
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {clienteInfo.razon_social || 'No disponible'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  RUT
                </Typography>
                <Typography variant="body1">
                  {clienteInfo.rut || 'No disponible'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dirección
                </Typography>
                <Typography variant="body1">
                  {clienteInfo.direccion || 'No disponible'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Teléfono
                </Typography>
                <Typography variant="body1">
                  {clienteInfo.telefono || 'No disponible'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {clienteInfo.email || 'No disponible'}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No se pudo cargar la información del cliente
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Tarjetas de estadísticas principales */}
      <Typography variant="h6" gutterBottom>
        Resumen
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Sucursales"
            value={stats.sucursalesCount}
            icon={<SucursalIcon />}
            color="primary"
            onClick={() => navigate('/mis-sucursales')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Sierras"
            value={stats.sierrasCount}
            icon={<SierraIcon />}
            color="secondary"
            onClick={() => navigate('/mis-sierras')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Afilados"
            value={stats.afiladosCount}
            icon={<AfiladoIcon />}
            color="success"
            onClick={() => navigate('/mis-afilados')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Afilados Pendientes"
            value={stats.afiladosPendientes}
            icon={<PendingIcon />}
            color="warning"
            onClick={() => navigate('/mis-afilados?pendientes=true')}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Afilados Recientes"
            value={stats.afiladosUltimos30Dias}
            subtitle="Últimos 30 días"
            icon={<HistoryIcon />}
            color="info"
            onClick={() => navigate('/mis-afilados?recientes=true')}
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
            aria-label="client dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Afilados Pendientes" icon={<PendingIcon />} iconPosition="start" />
            <Tab label="Afilados Recientes" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Mis Sierras" icon={<SierraIcon />} iconPosition="start" />
            <Tab label="Mis Sucursales" icon={<SucursalIcon />} iconPosition="start" />
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
                  onClick={() => navigate('/mis-afilados?pendientes=true')}
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
                  No tiene afilados pendientes de entrega. ¡Todo al día!
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
                            onClick={() => navigate(`/mis-afilados/${afilado.id}`)}
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
                            Sierra: {afilado.sierras?.codigo_barra || afilado.sierras?.codigo || 'No especificada'} 
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
                              Sucursal: {afilado.sierras?.sucursales?.nombre || 'No especificada'}
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
        
        {/* Panel de Afilados Recientes */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader 
              title="Afilados Recientes" 
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/mis-afilados')}
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
              ) : afiladosRecientes.length === 0 ? (
                <Alert severity="info">
                  No hay afilados registrados recientemente.
                </Alert>
              ) : (
                <List>
                  {afiladosRecientes.map((afilado) => (
                    <ListItem
                      key={afilado.id}
                      secondaryAction={
                        <Tooltip title="Ver Detalle">
                          <IconButton 
                            edge="end" 
                            onClick={() => navigate(`/mis-afilados/${afilado.id}`)}
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
                            bgcolor: afilado.fecha_salida ? 'success.light' : 'warning.light',
                            color: afilado.fecha_salida ? 'success.contrastText' : 'warning.contrastText'
                          }}
                        >
                          {afilado.fecha_salida ? <DoneAllIcon /> : <AfiladoIcon />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            Sierra: {afilado.sierras?.codigo_barra || afilado.sierras?.codigo || 'No especificada'} 
                            <Chip 
                              size="small" 
                              label={afilado.tipos_afilado?.nombre || 'No especificado'} 
                              sx={{ ml: 1 }}
                              variant="outlined"
                              color={afilado.fecha_salida ? "success" : "warning"}
                            />
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Estado: {afilado.fecha_salida ? 'Entregado' : 'Pendiente'}
                            </Typography>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                              <Typography variant="caption">
                                {afilado.fecha_salida 
                                  ? `Entregado: ${formatDate(afilado.fecha_salida)}` 
                                  : `Ingreso: ${formatDate(afilado.fecha_afilado)}`}
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
        
        {/* Panel de Sierras */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader 
              title="Mis Sierras" 
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/mis-sierras')}
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
                  No hay sierras registradas.
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
                            onClick={() => navigate(`/mis-sierras/${sierra.id}`)}
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
                              Sucursal: {sierra.sucursal}
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
        
        {/* Panel de Sucursales */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader 
              title="Mis Sucursales" 
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/mis-sucursales')}
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
              ) : sucursales.length === 0 ? (
                <Alert severity="info">
                  No tiene sucursales registradas.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {sucursales.map((sucursal) => (
                    <Grid item xs={12} md={6} key={sucursal.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                mr: 2
                              }}
                            >
                              <SucursalIcon />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {sucursal.nombre}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {sucursal.direccion || 'Sin dirección registrada'}
                          </Typography>
                          {sucursal.telefono && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Teléfono: {sucursal.telefono}
                            </Typography>
                          )}
                          {sucursal.email && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Email: {sucursal.email}
                            </Typography>
                          )}
                          <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                              onClick={() => navigate(`/mis-sucursales/${sucursal.id}`)}
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
                onClick={() => navigate('/mis-sierras')}
              >
                Ver Mis Sierras
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<AfiladoIcon />}
                onClick={() => navigate('/mis-afilados')}
              >
                Ver Mis Afilados
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="warning"
                startIcon={<PendingIcon />}
                onClick={() => navigate('/mis-afilados?pendientes=true')}
              >
                Afilados Pendientes
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                color="info"
                startIcon={<ReceiptIcon />}
                onClick={() => navigate('/mis-reportes')}
              >
                Reportes
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientDashboard;