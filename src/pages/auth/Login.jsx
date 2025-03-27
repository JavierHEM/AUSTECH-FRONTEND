// src/pages/auth/Login.jsx
import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Grid,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Zoom
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useThemeMode } from '../../context/ThemeContext';

// Logo
import logo from '../../assets/logo.png';

// Esquema de validación
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Ingrese un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Componente de campo de entrada animado con forwardRef para manejar refs de react-hook-form
const AnimatedTextField = forwardRef(({ delay, ...props }, ref) => {
  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={600 + delay}>
      <TextField {...props} inputRef={ref} />
    </Grow>
  );
});

const Login = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const { darkMode } = useThemeMode();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(data);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Colores adaptados al modo oscuro/claro
  const getBgGradient = () => {
    return darkMode
      ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`;
  };

  const getCardBg = () => {
    return darkMode 
      ? 'rgba(30, 30, 30, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)';
  };

  const getTextColor = () => {
    return darkMode ? 'white' : 'primary.main';
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: getBgGradient(),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Elementos decorativos animados en el fondo */}
      <Box
        component={motion.div}
        animate={{
          y: [0, 10, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${darkMode ? theme.palette.primary.dark : theme.palette.primary.light} 0%, rgba(255,255,255,0) 70%)`,
          filter: 'blur(50px)',
        }}
      />
      
      <Box
        component={motion.div}
        animate={{
          x: [0, -10, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${darkMode ? theme.palette.secondary.dark : theme.palette.secondary.light} 0%, rgba(255,255,255,0) 70%)`,
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="sm">
        <Paper
          elevation={24}
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            background: getCardBg(),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: isMobile ? 3 : 4, 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Box
                    component="img"
                    src={logo}
                    alt="Logo Sistema Afilado"
                    sx={{
                      height: 70,
                      mb: 3,
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                </Zoom>

                <Fade in={true} timeout={800}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={getTextColor()}
                    sx={{ 
                      mb: 1,
                      textAlign: 'center',
                      textShadow: '0px 2px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    Sistema Afilado
                  </Typography>
                </Fade>

                <Fade in={true} timeout={1000}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 4,
                      color: 'text.secondary',
                      textAlign: 'center'
                    }}
                  >
                    Accede a tu cuenta para continuar
                  </Typography>
                </Fade>

                {(error || authError) && (
                  <Grow in={true} timeout={600}>
                    <Alert 
                      severity="error" 
                      variant="filled"
                      sx={{ 
                        mb: 3, 
                        width: '100%',
                        borderRadius: 2
                      }}
                    >
                      {error || authError}
                    </Alert>
                  </Grow>
                )}

                <Box 
                  component="form" 
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{ 
                    width: '100%',
                    '& .MuiTextField-root': { mb: 3 }
                  }}
                >
                  <AnimatedTextField
                    delay={200}
                    fullWidth
                    label="Email"
                    variant="outlined"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        },
                      }
                    }}
                  />

                  <AnimatedTextField
                    delay={400}
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        },
                      }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Fade in={true} timeout={1200}>
                      <Link 
                        component={RouterLink} 
                        to="/recuperar-contrasena" 
                        variant="body2"
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          '&:hover': {
                            color: 'primary.dark',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </Fade>
                  </Box>

                  <Grow in={true} timeout={1200}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? null : <LoginIcon />}
                      sx={{
                        mt: 1, 
                        mb: 3, 
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        }
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </Grow>

                  <Fade in={true} timeout={1400}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        ¿No tienes una cuenta?{' '}
                        <Link 
                          component={RouterLink} 
                          to="/registro"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            '&:hover': {
                              color: 'primary.dark',
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Regístrate
                        </Link>
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;