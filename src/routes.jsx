// src/routes.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import ReportesRouter from './pages/reportes/ReportesRouter';

// Páginas comunes
import NotFound from './pages/common/NotFound';
import AccessDenied from './pages/common/AccessDenied';

// Páginas de usuarios (solo Gerente)
import UserList from './pages/usuarios/UserList';
import UserCreate from './pages/usuarios/UserCreate';
import UserDetail from './pages/usuarios/UserDetail';
import UserEdit from './pages/usuarios/UserEdit';
import ChangePassword from './pages/usuarios/ChangePassword';

// Páginas de catálogos
import CatalogosIndex from './pages/catalogos/CatalogosIndex';
import TipoSierraList from './pages/catalogos/TipoSierraList';
import TipoAfiladoList from './pages/catalogos/TipoAfiladoList';
import EstadoSierraList from './pages/catalogos/EstadoSierraList';

// Páginas de autenticación
import Login from './pages/auth/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Páginas de clientes
import ClienteList from './pages/clientes/ClienteList';
import ClienteDetail from './pages/clientes/ClienteDetail';
import ClienteCreate from './pages/clientes/ClienteCreate';
import ClienteEdit from './pages/clientes/ClienteEdit';

// Páginas de sucursales
import SucursalList from './pages/sucursales/SucursalList';
import SucursalCreate from './pages/sucursales/SucursalCreate';
import SucursalDetail from './pages/sucursales/SucursalDetail';
import SucursalEdit from './pages/sucursales/SucursalEdit';

// Páginas de sierras
import SierraList from './pages/sierras/SierraList';
import SierraDetail from './pages/sierras/SierraDetail';
import SierraCreate from './pages/sierras/SierraCreate';
import SierraEdit from './pages/sierras/SierraEdit';
import ScanSierraAfilado from './pages/afilados/ScanSierraAfilado';

// Páginas de afilados
import AfiladoList from './pages/afilados/AfiladoList';
import AfiladoCreate from './pages/afilados/AfiladoCreate';
import AfiladoDetail from './pages/afilados/AfiladoDetail';
import RegistroSalidaMasiva from './pages/afilados/RegistroSalidaMasiva';

// Componentes temporales para perfil 
// Estos se pueden reemplazar cuando se creen los componentes reales
const ProfilePlaceholder = () => <div>Página de Perfil (en construcción)</div>;
const ProfileChangePasswordPlaceholder = () => <div>Cambiar Contraseña de Perfil (en construcción)</div>;

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/acceso-denegado" element={<AccessDenied />} />
        
        {/* Rutas protegidas para todos los usuarios autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Perfil y configuración personal (todos los usuarios) */}
            <Route path="/perfil" element={<ProfilePlaceholder />} />
            <Route path="/perfil/cambiar-password" element={<ProfileChangePasswordPlaceholder />} />
            <Route path="/configuracion" element={<div>Configuración</div>} />
            <Route path="/ayuda" element={<div>Ayuda y Soporte</div>} />
          </Route>
        </Route>
        
        {/* Rutas protegidas solo para Gerente - Gestión de usuarios */}
        <Route element={<ProtectedRoute requiredRoles={['Gerente']} />}>
          <Route element={<MainLayout />}>
            <Route path="/usuarios" element={<UserList />} />
            <Route path="/usuarios/nuevo" element={<UserCreate />} />
            <Route path="/usuarios/:id" element={<UserDetail />} />
            <Route path="/usuarios/:id/editar" element={<UserEdit />} />
            <Route path="/usuarios/:id/cambiar-password" element={<ChangePassword />} />
          </Route>
        </Route>
        
        {/* Rutas para Administradores y Gerentes */}
        <Route element={<ProtectedRoute requiredRoles={['Gerente', 'Administrador']} />}>
          <Route element={<MainLayout />}>
            {/* Gestión general */}
            <Route path="/clientes" element={<ClienteList />} />
            <Route path="/clientes/:id" element={<ClienteDetail />} />
            <Route path="/clientes/nuevo" element={<ClienteCreate />} />
            <Route path="/clientes/:id/editar" element={<ClienteEdit />} />

            <Route path="/sucursales" element={<SucursalList />} />
            <Route path="/sucursales/nueva" element={<SucursalCreate />} />
            <Route path="/sucursales/:id" element={<SucursalDetail />} />
            <Route path="/sucursales/:id/editar" element={<SucursalEdit />} />

            <Route path="/sierras" element={<SierraList />} />
            <Route path="/sierras/:id" element={<SierraDetail />} />
            <Route path="/sierras/nueva" element={<SierraCreate />} />
            <Route path="/sierras/:id/editar" element={<SierraEdit />} />

            <Route path="/afilados" element={<AfiladoList />} />
            <Route path="/afilados/nuevo" element={<AfiladoCreate />} />
            <Route path="/afilados/:id" element={<AfiladoDetail />} />
            <Route path="/afilados/escanear" element={<ScanSierraAfilado />} />
            <Route path="/afilados/salida-masiva" element={<RegistroSalidaMasiva />} />
            
            {/* Catálogos */}
            <Route path="/catalogos" element={<CatalogosIndex />} />
            <Route path="/catalogos/tipos-sierra" element={<TipoSierraList />} />
            <Route path="/catalogos/tipos-afilado" element={<TipoAfiladoList />} />
            <Route path="/catalogos/estados-sierra" element={<EstadoSierraList />} />
            
            {/* Reportes */}
            <Route path="/reportes/*" element={<ReportesRouter />} />
          </Route>
        </Route>
        
        {/* Rutas específicas para Clientes (reutilizando componentes) */}
        <Route element={<ProtectedRoute requiredRoles={['Cliente']} />}>
          <Route element={<MainLayout />}>
            {/* Usaremos los mismos componentes pero con parámetros filtrados por cliente */}
            <Route path="/mis-sierras" element={<SierraList clienteFilter={true} />} />
            <Route path="/mis-sierras/:id" element={<SierraDetail />} />
            <Route path="/mis-afilados" element={<AfiladoList clienteFilter={true} />} />
            <Route path="/mis-afilados/:id" element={<AfiladoDetail />} />
            <Route path="/mis-sucursales" element={<SucursalList clienteFilter={true} />} />
            <Route path="/mis-sucursales/:id" element={<SucursalDetail />} />
            <Route path="/mis-reportes" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Ruta para página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;