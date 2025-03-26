// src/pages/reportes/ReportesRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Páginas de reportes
import ReportesIndex from './ReportesIndex';
import ReporteAfiladosCliente from './ReporteAfiladosCliente';
import ReporteAfiladosSucursal from './ReporteAfiladosSucursal';
import ReporteHistorialSierras from './ReporteHistorialSierras';

// Este componente actuará como un enrutador para todos los reportes
const ReportesRouter = () => {
  return (
    <Routes>
      <Route index element={<ReportesIndex />} />
      <Route path="afilados-cliente" element={<ReporteAfiladosCliente />} />
      <Route path="afilados-sucursal" element={<ReporteAfiladosSucursal />} />
      <Route path="historial-sierras" element={<ReporteHistorialSierras />} />
      <Route path="afilados-tiempo" element={<div>Reporte: Análisis Temporal (No implementado)</div>} />
      <Route path="*" element={<Navigate to="/reportes" replace />} />
    </Routes>
  );
};

export default ReportesRouter;