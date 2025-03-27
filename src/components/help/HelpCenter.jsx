// src/components/help/HelpCenter.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  ContactSupport as ContactSupportIcon,
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Podríamos usar imágenes si están disponibles
import tutorialAfilado from '../../assets/tutorials/afilado.jpg';
import tutorialReportes from '../../assets/tutorials/reportes.jpg';

// Componente auxiliar para las pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HelpCenter = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          bgcolor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <HelpIcon />
        <Typography variant="h6">Centro de Ayuda - Sistema Afilado</Typography>
      </DialogTitle>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          px: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          bgcolor: theme.palette.background.paper
        }}
      >
        <Tab label="Guía Rápida" icon={<InfoIcon />} iconPosition="start" />
        <Tab label="Preguntas Frecuentes" icon={<HelpIcon />} iconPosition="start" />
        <Tab label="Tutoriales" icon={<SchoolIcon />} iconPosition="start" />
        <Tab label="Contacto" icon={<ContactSupportIcon />} iconPosition="start" />
      </Tabs>
      
      <DialogContent sx={{ minHeight: 400 }}>
        {/* Panel Guía Rápida */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Bienvenido a Sistema Afilado
            </Typography>
            <Typography paragraph>
              Este sistema le permite gestionar todo el proceso de afilado de sierras, desde la recepción
              hasta la entrega al cliente. A continuación, encontrará una guía básica para empezar.
            </Typography>
            
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="medium" gutterBottom>
                Funciones principales del sistema:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Gestión de clientes y sucursales" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Inventario y seguimiento de sierras" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Control de afilados realizados" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Generación de reportes y estadísticas" />
                </ListItem>
              </List>
            </Paper>
            
            <Typography variant="subtitle1" color="primary" fontWeight="medium" gutterBottom>
              Guías rápidas de uso:
            </Typography>
            
            <Accordion sx={{ mb: 1, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Cómo registrar un nuevo afilado?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography component="div">
                  <ol>
                    <li>Navegue a la sección <strong>"Afilados"</strong> en el menú lateral.</li>
                    <li>Haga clic en el botón <strong>"Nuevo Afilado"</strong>.</li>
                    <li>Seleccione el cliente y la sierra correspondiente.</li>
                    <li>Complete la información requerida y haga clic en <strong>"Guardar"</strong>.</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mb: 1, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Cómo gestionar el inventario de sierras?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography component="div">
                  <ol>
                    <li>Acceda a la sección <strong>"Sierras"</strong> en el menú lateral.</li>
                    <li>Aquí podrá ver todas las sierras registradas, filtradas por cliente.</li>
                    <li>Para añadir una nueva, haga clic en <strong>"Nueva Sierra"</strong>.</li>
                    <li>Para ver el historial de una sierra, haga clic en el botón <strong>"Historial"</strong>.</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mb: 1, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Cómo ver y filtrar reportes?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography component="div">
                  <ol>
                    <li>Navegue a la sección <strong>"Reportes"</strong> en el menú lateral.</li>
                    <li>Seleccione el tipo de reporte que desea visualizar.</li>
                    <li>Utilice los filtros disponibles para refinar los resultados.</li>
                    <li>Los reportes pueden exportarse a Excel o PDF usando los botones en la parte superior.</li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </TabPanel>
        
        {/* Panel Preguntas Frecuentes */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Typography variant="h5" color="primary" gutterBottom>Preguntas Frecuentes</Typography>
            <Typography paragraph>
              Encuentre respuestas a las preguntas más comunes sobre el uso del sistema.
            </Typography>
            
            <Accordion sx={{ mb: 1.5, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Puedo cambiar mi contraseña?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Sí, puede cambiar su contraseña en cualquier momento accediendo a su perfil desde el menú 
                  de usuario en la esquina superior derecha y seleccionando la opción "Cambiar contraseña".
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mb: 1.5, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Cómo puedo ver sólo mis afilados pendientes?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  En la sección "Afilados", utilice el filtro "Estado" y seleccione "Pendiente". 
                  También puede acceder rápidamente desde el ícono de notificaciones en la barra superior.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mb: 1.5, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Cómo asignar una sierra a otro cliente?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Para transferir una sierra a otro cliente, debe ir a la sección "Sierras", buscar la sierra 
                  específica, hacer clic en "Editar" y seleccionar el nuevo cliente desde el menú desplegable.
                  Se mantendrá todo el historial de afilados de la sierra.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mb: 1.5, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Puedo eliminar un afilado registrado por error?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Sí, siempre que tenga los permisos necesarios. Vaya a la sección "Afilados", encuentre el 
                  registro que desea eliminar, y haga clic en el botón "Eliminar". Tenga en cuenta que esta 
                  acción puede requerir permisos de administrador y afectará a los reportes e historial.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mb: 1.5, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">¿Es posible exportar datos del sistema?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Sí, todos los listados y reportes del sistema pueden ser exportados a formato Excel o PDF 
                  utilizando los botones ubicados en la parte superior de cada tabla de datos. Esto le 
                  permite conservar copias de respaldo o compartir información con otros departamentos.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </TabPanel>
        
        {/* Panel Tutoriales */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" color="primary" gutterBottom>Tutoriales</Typography>
            <Typography paragraph>
              Seleccione un tutorial para ver una guía paso a paso sobre cómo utilizar
              las funcionalidades del sistema.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
              <Card sx={{ maxWidth: 345, boxShadow: 2, borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="/tutorial-afilado.jpg" // Reemplazar con ruta correcta
                  alt="Tutorial de afilado"
                  sx={{ bgcolor: 'grey.200' }} // Fallback si no hay imagen
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    Registro de Afilados
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprenda a registrar y gestionar afilados en el sistema, incluyendo
                    la asignación a técnicos, seguimiento y finalización.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">Ver Tutorial</Button>
                </CardActions>
              </Card>
              
              <Card sx={{ maxWidth: 345, boxShadow: 2, borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="/tutorial-reportes.jpg" // Reemplazar con ruta correcta
                  alt="Tutorial de reportes"
                  sx={{ bgcolor: 'grey.200' }} // Fallback si no hay imagen
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    Generación de Reportes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cómo crear y exportar reportes personalizados, filtrar datos
                    y analizar el rendimiento de su servicio de afilado.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">Ver Tutorial</Button>
                </CardActions>
              </Card>
              
              <Card sx={{ maxWidth: 345, boxShadow: 2, borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="/tutorial-clientes.jpg" // Reemplazar con ruta correcta
                  alt="Tutorial de clientes"
                  sx={{ bgcolor: 'grey.200' }} // Fallback si no hay imagen
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    Gestión de Clientes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprenda a registrar nuevos clientes, administrar sucursales
                    y configurar preferencias específicas para cada cliente.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">Ver Tutorial</Button>
                </CardActions>
              </Card>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Panel Contacto */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" color="primary" gutterBottom>Contacto de Soporte</Typography>
            <Typography paragraph>
              Si necesita ayuda adicional, puede contactar a nuestro equipo de soporte.
            </Typography>
            
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ p: 3, mb: 4, borderRadius: 2, borderColor: theme.palette.divider }}
            >
              <Typography variant="subtitle1" fontWeight="medium" color="primary">
                Información de Contacto
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                <Typography><strong>Email:</strong> soporte@sistemaafilado.com</Typography>
                <Typography><strong>Teléfono:</strong> (123) 456-7890</Typography>
                <Typography><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</Typography>
              </Box>
            </Paper>
            
            <Typography variant="subtitle1" fontWeight="medium" color="primary" gutterBottom>
              Reportar un Problema
            </Typography>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                label="Asunto"
                fullWidth
                margin="normal"
                variant="outlined"
                required
                size="small"
              />
              <TextField
                label="Descripción del problema"
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                required
                size="small"
              />
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
              >
                Enviar Reporte
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpCenter;