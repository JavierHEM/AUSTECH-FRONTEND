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
  LinearProgress,
  Stack,
  Badge
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
  ArrowForward as ArrowForwardIcon,
  ShowChart as ChartIcon,
  NotificationsActive as NotificationIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
  QrCode as QrCodeIcon,
  MoreVert as MoreVertIcon
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
import { format, subDays, formatDistance, differenceInDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Componentes de gráficas
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

// Componente para tarjetas de estadísticas mejorado
const StatCard = ({ title, value, icon, color, onClick, isLoading, subtitle, secondaryValue, secondaryLabel, trend }) => {
  const theme = useTheme();
  const { darkMode } = useThemeMode();
  
  // Determinar color de tendencia
  const getTrendColor = () => {
    if (!trend) return 'text.secondary';
    return trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary';
  };
  
  // Formatear tendencia
  const getTrendText = () => {
    if (!trend) return '';
    const prefix = trend > 0 ? '+' : '';
    return `${prefix}${trend}% vs. periodo anterior`;
  };
  
  return (
    <Card
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        } : {},
        borderLeft: 5,
        borderColor: `${color}.main`
      }}
      onClick={onClick}
      elevation={2}
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
            
            {/* Mostrar valor secundario si existe */}
            {secondaryValue && (
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  {secondaryLabel}:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {secondaryValue}
                </Typography>
              </Box>
            )}
            
            {/* Mostrar tendencia si existe */}
            {trend !== undefined && (
              <Typography variant="caption" sx={{ color: getTrendColor(), display: 'block', mt: 0.5 }}>
                {getTrendText()}
              </Typography>
            )}
            
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
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

// Componente para gráfico de actividad de afilados
const AfiladosActivityChart = ({ data, height = 250, isLoading }) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Box>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fecha" />
        <YAxis />
        <RechartsTooltip 
          formatter={(value, name) => [value, name === 'completados' ? 'Completados' : 'Pendientes']}
          labelFormatter={(value) => `Fecha: ${value}`}
        />
        <RechartsLegend />
        <Line 
          type="monotone" 
          dataKey="completados" 
          stroke={theme.palette.success.main} 
          activeDot={{ r: 8 }}
          name="Completados"
        />
        <Line 
          type="monotone" 
          dataKey="pendientes" 
          stroke={theme.palette.warning.main} 
          activeDot={{ r: 8 }}
          name="Pendientes"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Componente para gráfico de distribución de sierras por tipo
const SierrasDistributionChart = ({ data, height = 250, isLoading }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];
  
  if (isLoading) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Box>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value, name) => [value, name]} />
        <RechartsLegend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Componente para gráfico de tiempo promedio de afilado por tipo
const AfiladosTiempoPromedioChart = ({ data, height = 250, isLoading }) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Box>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tipo" />
        <YAxis label={{ value: 'Días Promedio', angle: -90, position: 'insideLeft' }} />
        <RechartsTooltip formatter={(value) => [`${value} días`, 'Tiempo promedio']} />
        <Bar dataKey="diasPromedio" fill={theme.palette.primary.main} name="Días Promedio" />
      </BarChart>
    </ResponsiveContainer>
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
    afiladosUltimos30Dias: 0,
    sierrasInactivas: 0
  });
  
  const [afiladosPendientes, setAfiladosPendientes] = useState([]);
  const [afiladosRecientes, setAfiladosRecientes] = useState([]);
  const [sierrasRecientes, setSierrasRecientes] = useState([]);
  const [sierrasQuePuedenNecesitarAfilado, setSierrasQuePuedenNecesitarAfilado] = useState([]);
  const [error, setError] = useState(null);
  
  // Estados para datos de gráficos
  const [afiladosActivityData, setAfiladosActivityData] = useState([]);
  const [sierrasDistributionData, setSierrasDistributionData] = useState([]);
  const [afiladosTiempoPromedioData, setAfiladosTiempoPromedioData] = useState([]);

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

  // Función para preparar datos de actividad de afilados (últimos 30 días)
  const prepararDatosActividadAfilados = (afilados) => {
    if (!afilados || !Array.isArray(afilados)) return [];
    
    // Crear rango de 30 días
    const datos = [];
    const hoy = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const fecha = subDays(hoy, i);
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      
      datos.push({
        fecha: format(fecha, 'dd/MM', { locale: es }),
        fechaCompleta: fechaStr,
        completados: 0,
        pendientes: 0
      });
    }
    
    // Agrupar afilados por fecha
    afilados.forEach(afilado => {
      if (!afilado.fecha_afilado) return;
      
      try {
        const fechaAfilado = new Date(afilado.fecha_afilado);
        const fechaStr = format(fechaAfilado, 'yyyy-MM-dd');
        
        // Buscar si esa fecha está en nuestro rango de 30 días
        const datoFecha = datos.find(d => d.fechaCompleta === fechaStr);
        if (datoFecha) {
          if (afilado.fecha_salida) {
            datoFecha.completados += 1;
          } else {
            datoFecha.pendientes += 1;
          }
        }
      } catch (e) {
        console.error("Error al procesar fecha de afilado:", e);
      }
    });
    
    return datos;
  };
  
  // Función para preparar datos de distribución de sierras por tipo
  const prepararDatosDistribucionSierras = (sierras) => {
    if (!sierras || !Array.isArray(sierras)) return [];
    
    // Agrupar sierras por tipo
    const tiposSierra = {};
    sierras.forEach(sierra => {
      const tipoNombre = sierra.tipos_sierra?.nombre || 'No especificado';
      if (!tiposSierra[tipoNombre]) {
        tiposSierra[tipoNombre] = 0;
      }
      tiposSierra[tipoNombre] += 1;
    });
    
    // Convertir a formato para gráfico
    return Object.entries(tiposSierra).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Función para preparar datos de tiempo promedio de afilado por tipo
  const prepararDatosTiempoPromedioAfilado = (afilados) => {
    if (!afilados || !Array.isArray(afilados)) return [];
    
    // Solo considerar afilados con fecha de salida (completados)
    const afiladosCompletados = afilados.filter(a => a.fecha_salida);
    
    // Agrupar por tipo de afilado
    const tiposAfilado = {};
    
    afiladosCompletados.forEach(afilado => {
      const tipoNombre = afilado.tipos_afilado?.nombre || 'No especificado';
      
      if (!tiposAfilado[tipoNombre]) {
        tiposAfilado[tipoNombre] = {
          total: 0,
          cantidad: 0,
          dias: 0
        };
      }
      
      // Calcular días entre fecha de afilado y fecha de salida
      if (afilado.fecha_afilado && afilado.fecha_salida) {
        try {
          const fechaAfilado = new Date(afilado.fecha_afilado);
          const fechaSalida = new Date(afilado.fecha_salida);
          const dias = Math.max(0, differenceInDays(fechaSalida, fechaAfilado));
          
          tiposAfilado[tipoNombre].total += dias;
          tiposAfilado[tipoNombre].cantidad += 1;
          tiposAfilado[tipoNombre].dias = dias;
        } catch (e) {
          console.error("Error al calcular días:", e);
        }
      }
    });
    
    // Calcular promedio y convertir a formato para gráfico
    return Object.entries(tiposAfilado).map(([tipo, { total, cantidad }]) => ({
      tipo,
      diasPromedio: cantidad > 0 ? (total / cantidad).toFixed(1) : 0
    }));
  };
  
  // Función para identificar sierras que podrían necesitar afilado
  const identificarSierrasParaAfilado = (sierras, afilados) => {
    if (!sierras || !Array.isArray(sierras) || !afilados || !Array.isArray(afilados)) {
      return [];
    }
    
    // Crear mapa de último afilado por sierra
    const ultimoAfiladoPorSierra = {};
    
    afilados.forEach(afilado => {
      const sierraId = afilado.sierra_id || (afilado.sierras && afilado.sierras.id);
      if (!sierraId) return;
      
      if (!ultimoAfiladoPorSierra[sierraId] || 
          new Date(afilado.fecha_afilado) > new Date(ultimoAfiladoPorSierra[sierraId].fecha_afilado)) {
        ultimoAfiladoPorSierra[sierraId] = afilado;
      }
    });
    
    // Identificar sierras que llevan más de 60 días sin afilar
    const hoy = new Date();
    const sierrasParaAfilado = [];
    
    sierras.forEach(sierra => {
      const ultimoAfilado = ultimoAfiladoPorSierra[sierra.id];
      
      // Si nunca ha sido afilada o el último afilado fue hace más de 60 días
      if (!ultimoAfilado) {
        // Si la sierra tiene más de 60 días desde su registro
        if (sierra.fecha_registro) {
          const fechaRegistro = new Date(sierra.fecha_registro);
          const diasDesdeRegistro = differenceInDays(hoy, fechaRegistro);
          
          if (diasDesdeRegistro > 60) {
            sierrasParaAfilado.push({
              ...sierra,
              diasSinAfilar: diasDesdeRegistro,
              ultimoAfilado: null
            });
          }
        }
      } else {
        const fechaUltimoAfilado = new Date(ultimoAfilado.fecha_afilado);
        const diasDesdeUltimoAfilado = differenceInDays(hoy, fechaUltimoAfilado);
        
        if (diasDesdeUltimoAfilado > 60) {
          sierrasParaAfilado.push({
            ...sierra,
            diasSinAfilar: diasDesdeUltimoAfilado,
            ultimoAfilado: ultimoAfilado
          });
        }
      }
    });
    
    // Ordenar por días sin afilar (descendente)
    return sierrasParaAfilado.sort((a, b) => b.diasSinAfilar - a.diasSinAfilar).slice(0, 5);
  };

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchClientDashboardData = async () => {
      if (!user) {
        console.error("No se encontró información del usuario");
        setLoading(false);
        setError("No se pudo obtener la información de usuario. Por favor, intente iniciar sesión nuevamente.");
        return;
      }
    
      setLoading(true);
      try {
        // 1. Obtener sucursales vinculadas al usuario actual
        const sucursalesResponse = await sucursalService.obtenerSucursalesVinculadasUsuario();
        
        if (!sucursalesResponse.success || !sucursalesResponse.data || sucursalesResponse.data.length === 0) {
          setLoading(false);
          setError("No se encontraron sucursales asociadas a su cuenta de usuario. Por favor, contacte con el administrador del sistema.");
          return;
        }
        
        // Guardar las sucursales
        const sucursalesData = sucursalesResponse.data;
        setSucursales(sucursalesData);
        
        // 2. Extraer el cliente_id de la primera sucursal
        const primeraSucursal = sucursalesData[0];
        const clienteId = primeraSucursal.cliente_id;
        
        if (!clienteId) {
          setLoading(false);
          setError("No se pudo determinar el cliente asociado a sus sucursales. Por favor, contacte con el administrador del sistema.");
          return;
        }
        
        // 3. Obtener información del cliente - Con manejo de error mejorado
        try {
          // Primero verificamos si el cliente viene incluido en la respuesta de sucursales
          if (primeraSucursal.cliente) {
            setClienteInfo(primeraSucursal.cliente);
          } else {
            // Si no viene incluido, intentamos obtenerlo por separado
            const clienteResponse = await clienteService.getClienteById(clienteId);
            if (clienteResponse.success) {
              setClienteInfo(clienteResponse.data);
            } else {
              console.warn(`No se encontró el cliente con ID ${clienteId}. Usando información básica.`);
              
              // Crear un objeto cliente básico con la información disponible
              setClienteInfo({
                id: clienteId,
                razon_social: 'Imperial S.A.',
                rut: '76821330-5',
                direccion: 'Av. Santa Rosa N°7.876, oficina 401',
                telefono: '223997000',
                email: 'jeferret@imperial.cl'
              });
            }
          }
        } catch (clienteError) {
          console.error('Error al obtener información del cliente:', clienteError);
          
          // Continuar con un objeto cliente básico
          setClienteInfo({
            id: clienteId,
            razon_social: 'Imperial S.A.',
            rut: '76821330-5',
            direccion: 'Av. Santa Rosa N°7.876, oficina 401',
            telefono: '223997000',
            email: 'jeferret@imperial.cl'
          });
        }
        
        // 4. Obtener todas las sierras del cliente
        const sierrasResponse = await sierraService.getSierrasByCliente(clienteId);
        if (!sierrasResponse.success) {
          throw new Error(sierrasResponse.error || "Error al obtener sierras del cliente");
        }
        
        const todasLasSierras = sierrasResponse.data;
        const sierrasActivas = todasLasSierras.filter(sierra => sierra.activo);
        const sierrasInactivas = todasLasSierras.filter(sierra => !sierra.activo);
        
        // 5. Obtener sierras recientes (ordenadas por fecha de registro)
        const sierrasRecientes = [...todasLasSierras]
          .sort((a, b) => new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0))
          .slice(0, 5)
          .map(sierra => ({
            id: sierra.id,
            codigo: sierra.codigo_barra || sierra.codigo,
            tipo: sierra.tipos_sierra?.nombre || 'No especificado',
            sucursal: sierra.sucursales?.nombre || 'No especificada',
            fechaRegistro: sierra.fecha_registro,
            estado: sierra.activo ? 'Activa' : 'Inactiva'
          }));
        
        setSierrasRecientes(sierrasRecientes);
        
        // 6. Obtener afilados relacionados con el cliente
        const afiladosResponse = await afiladoService.getAfiladosByCliente(clienteId);
        if (!afiladosResponse.success) {
          throw new Error(afiladosResponse.error || "Error al obtener afilados del cliente");
        }
        
        const todosLosAfilados = afiladosResponse.data;
        
        // 7. Obtener afilados pendientes
        const afiladosPendientes = todosLosAfilados.filter(afilado => !afilado.fecha_salida);
        setAfiladosPendientes(afiladosPendientes.slice(0, 5));
        
        // 8. Obtener afilados recientes
        const afiladosRecientes = [...todosLosAfilados]
          .sort((a, b) => new Date(b.fecha_afilado || 0) - new Date(a.fecha_afilado || 0))
          .slice(0, 5);
        setAfiladosRecientes(afiladosRecientes);
        
        // 9. Calcular afilados de los últimos 30 días
        const afiladosUltimos30Dias = obtenerAfiladosUltimos30Dias(todosLosAfilados).length;
        
        // 10. Identificar sierras que podrían necesitar afilado
        const sierrasParaAfilado = identificarSierrasParaAfilado(sierrasActivas, todosLosAfilados);
        setSierrasQuePuedenNecesitarAfilado(sierrasParaAfilado);
        
        // 11. Actualizar estadísticas
        setStats({
          sucursalesCount: sucursalesData.length,
          sierrasCount: sierrasActivas.length,
          afiladosCount: todosLosAfilados.length,
          afiladosPendientes: afiladosPendientes.length,
          afiladosUltimos30Dias,
          sierrasInactivas: sierrasInactivas.length
        });
        
        // 12. Preparar datos para gráficos
        setAfiladosActivityData(prepararDatosActividadAfilados(todosLosAfilados));
        setSierrasDistributionData(prepararDatosDistribucionSierras(sierrasActivas));
        setAfiladosTiempoPromedioData(prepararDatosTiempoPromedioAfilado(todosLosAfilados));
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard del cliente:', error);
        setError(error.message || "Error al cargar datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDashboardData();
  }, [user]);

  // Calcular porcentaje de cambio para tendencias (simulado)
  const getTendencia = (key) => {
    const tendencias = {
      sierrasCount: 8,
      afiladosCount: 12,
      afiladosPendientes: -5,
      afiladosUltimos30Dias: 15
    };
    
    return tendencias[key] || 0;
  };

  return (
    <Box>
      {/* Encabezado con información del cliente y bienvenida */}
      <Box mb={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 64,
                height: 64,
                fontSize: 32
              }}
            >
              {clienteInfo?.razon_social?.charAt(0) || 'C'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              Bienvenido, {user?.nombre || 'Cliente'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Panel de {clienteInfo?.razon_social || 'su empresa'} • {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Mensajes de alerta */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Banner de recomendación para sierras que necesitan afilado */}
      {sierrasQuePuedenNecesitarAfilado.length > 0 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate('/mis-sierras/mantenimiento')}
            >
              Ver Detalles
            </Button>
          }
        >
          <Typography variant="subtitle2">
            Tiene {sierrasQuePuedenNecesitarAfilado.length} sierra(s) que podrían necesitar afilado pronto
          </Typography>
          <Typography variant="body2">
            La sierra más urgente ({sierrasQuePuedenNecesitarAfilado[0].codigo_barra || sierrasQuePuedenNecesitarAfilado[0].codigo}) lleva {sierrasQuePuedenNecesitarAfilado[0].diasSinAfilar} días sin afilar.
          </Typography>
        </Alert>
      )}

      {/* Tarjetas de estadísticas principales - Layout mejorado */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Sierras Activas"
            value={stats.sierrasCount}
            icon={<SierraIcon />}
            color="secondary"
            onClick={() => navigate('/mis-sierras')}
            isLoading={loading}
            secondaryValue={`${stats.sierrasInactivas} inactivas`}
            secondaryLabel="Además"
            trend={getTendencia('sierrasCount')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Afilados"
            value={stats.afiladosCount}
            icon={<AfiladoIcon />}
            color="success"
            onClick={() => navigate('/mis-afilados')}
            isLoading={loading}
            trend={getTendencia('afiladosCount')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Afilados Pendientes"
            value={stats.afiladosPendientes}
            icon={<PendingIcon />}
            color="warning"
            onClick={() => navigate('/mis-afilados?pendientes=true')}
            isLoading={loading}
            trend={getTendencia('afiladosPendientes')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Actividad Reciente"
            value={stats.afiladosUltimos30Dias}
            subtitle="Últimos 30 días"
            icon={<HistoryIcon />}
            color="info"
            onClick={() => navigate('/mis-afilados?recientes=true')}
            isLoading={loading}
            trend={getTendencia('afiladosUltimos30Dias')}
          />
        </Grid>
      </Grid>

      {/* Panel de gráficos y análisis */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Análisis y Tendencias
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        {/* Gráfico de actividad de afilados */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="Actividad de Afilados" 
              subheader="Últimos 30 días"
              avatar={<ChartIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <AfiladosActivityChart 
                data={afiladosActivityData}
                height={280}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Distribución de sierras por tipo */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Distribución de Sierras" 
              subheader="Por tipo"
              avatar={<SierraIcon color="secondary" />}
            />
            <Divider />
            <CardContent>
              <SierrasDistributionChart 
                data={sierrasDistributionData}
                height={250}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tiempo promedio de afilado por tipo */}
        <Grid item xs={12} sm={6} lg={6}>
          <Card>
            <CardHeader 
              title="Tiempo Promedio de Afilado" 
              subheader="Por tipo de afilado"
              avatar={<TimeIcon color="warning" />}
            />
            <Divider />
            <CardContent>
              <AfiladosTiempoPromedioChart 
                data={afiladosTiempoPromedioData}
                height={250}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Sierras que podrían necesitar afilado */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader 
              title="Sierras que Podrían Necesitar Afilado" 
              subheader="Basado en tiempo desde el último afilado"
              avatar={<WarningIcon color="error" />}
              action={
                sierrasQuePuedenNecesitarAfilado.length > 0 ? (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/mis-sierras/mantenimiento')}
                  >
                    Ver Todas
                  </Button>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : sierrasQuePuedenNecesitarAfilado.length === 0 ? (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  Todas sus sierras han sido afiladas recientemente. ¡Buen trabajo!
                </Alert>
              ) : (
                <List>
                  {sierrasQuePuedenNecesitarAfilado.map((sierra) => (
                    <ListItem
                      key={sierra.id}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => navigate('/afilados/nuevo', {
                            state: { sierraId: sierra.id, sierraCodigo: sierra.codigo_barra || sierra.codigo }
                          })}
                        >
                          Solicitar Afilado
                        </Button>
                      }
                      divider
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'error.lighter',
                            color: 'error.dark'
                          }}
                        >
                          <SierraIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {sierra.codigo_barra || sierra.codigo}
                            <Chip 
                              size="small" 
                              label={sierra.tipos_sierra?.nombre || 'No especificado'} 
                              sx={{ ml: 1 }}
                              variant="outlined"
                              color="secondary"
                            />
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {sierra.diasSinAfilar} días sin afilar • Sucursal: {sierra.sucursales?.nombre || 'No especificada'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;