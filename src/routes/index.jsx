// src/routes/index.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Páginas de autenticación
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Dashboard router
import DashboardRouter from '../pages/dashboard/DashboardRouter';

// Página 404
import NotFound from '../pages/NotFound';

// Páginas para todos los usuarios
import Profile from '../pages/profile/Profile';
import ChangePassword from '../pages/profile/ChangePassword';

// Páginas de administración (Gerente y Administrador)
import UserList from '../pages/usuarios/UserList';
import UserDetail from '../pages/usuarios/UserDetail';
import UserCreate from '../pages/usuarios/UserCreate';
import UserEdit from '../pages/usuarios/UserEdit';
import UserChangePassword from '../pages/usuarios/ChangePassword';

// Páginas específicas para Cliente
import MisSierras from '../pages/cliente/MisSierras';
import MisSierrasDetail from '../pages/cliente/MisSierrasDetail';
import MisAfilados from '../pages/cliente/MisAfilados';
import MisAfiladosDetail from '../pages/cliente/MisAfiladosDetail';
import MisSucursales from '../pages/cliente/MisSucursales';
import MisSucursalesDetail from '../pages/cliente/MisSucursalesDetail';
import MisReportes from '../pages/cliente/MisReportes';

// Rutas protegidas
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Si no se especifican roles permitidos, cualquier usuario autenticado puede acceder
  if (allowedRoles.length === 0) {
    return children;
  }
  
  // Verificar si el rol del usuario está en la lista de roles permitidos
  if (user && allowedRoles.includes(user.rol)) {
    return children;
  }
  
  // Redirigir al dashboard si el rol no está permitido
  return <Navigate to="/dashboard" />;
};

// Rutas públicas (redirige a dashboard si está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/" element={<AuthLayout />}>
        <Route 
          path="login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="recuperar-contrasena" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="reset-password/:token" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />
        <Route index element={<Navigate to="/dashboard" />} />
      </Route>
      
      {/* Rutas protegidas */}
      <Route path="/" element={<MainLayout />}>
        {/* Dashboard - Utiliza el router para mostrar el dashboard correcto según el rol */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        
        {/* Perfil y cambio de contraseña (todos los usuarios) */}
        <Route 
          path="perfil" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="perfil/cambiar-password" 
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas para administración (Gerente) */}
        <Route 
          path="usuarios" 
          element={
            <ProtectedRoute allowedRoles={['Gerente']}>
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="usuarios/nuevo" 
          element={
            <ProtectedRoute allowedRoles={['Gerente']}>
              <UserCreate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="usuarios/:id" 
          element={
            <ProtectedRoute allowedRoles={['Gerente']}>
              <UserDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="usuarios/:id/editar" 
          element={
            <ProtectedRoute allowedRoles={['Gerente']}>
              <UserEdit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="usuarios/:id/cambiar-password" 
          element={
            <ProtectedRoute allowedRoles={['Gerente']}>
              <UserChangePassword />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas específicas para Cliente */}
        <Route 
          path="mis-sierras" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <MisSierras />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="mis-sierras/:id" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <MisSierrasDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="mis-afilados" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <MisAfilados />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="mis-afilados/:id" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <MisAfiladosDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="mis-sucursales" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <MisSucursales />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="mis-sucursales/:id" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <MisSucursalesDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="mis-reportes" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <MisReportes />
            </ProtectedRoute>
          } 
        />
        
        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;