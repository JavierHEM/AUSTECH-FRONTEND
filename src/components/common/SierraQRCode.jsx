// src/components/common/SierraQRCode.jsx
import React, { useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon
} from '@mui/icons-material';

// Nota: Este componente asume que tienes una librería para generar QR como react-qr-code
// Si no la tienes, necesitarás instalarla con: npm install react-qr-code
import QRCode from 'react-qr-code';

const SierraQRCode = ({ sierraData }) => {
  const qrRef = useRef(null);
  
  // Función para imprimir el QR
  const handlePrintQR = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2>Sierra: ${sierraData.codigo_barra || sierraData.codigo}</h2>
        <div id="qr-print-container"></div>
        <p>Tipo: ${sierraData.tipos_sierra?.nombre || 'No especificado'}</p>
        <p>Cliente: ${sierraData.sucursales?.clientes?.razon_social || 'No especificado'}</p>
        <p>Sucursal: ${sierraData.sucursales?.nombre || 'No especificada'}</p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Código QR Sierra - ${sierraData.codigo_barra || sierraData.codigo}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            #qr-print-container { margin: 20px auto; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    // Clonar el QR actual y añadirlo al documento de impresión
    printWindow.document.close();
    
    // Esperamos a que la ventana esté cargada
    printWindow.onload = () => {
      const container = printWindow.document.getElementById('qr-print-container');
      
      // Crear un nuevo QR para la impresión
      const qrCode = document.createElement('div');
      qrCode.innerHTML = qrRef.current.innerHTML;
      container.appendChild(qrCode);
      
      // Imprimir después de un pequeño retraso para asegurar que el QR se ha renderizado
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };
  
  // Función para copiar el código de la sierra al portapapeles
  const handleCopyCode = () => {
    navigator.clipboard.writeText(sierraData.codigo_barra || sierraData.codigo)
      .then(() => {
        alert('Código copiado al portapapeles');
      })
      .catch(() => {
        alert('Error al copiar código');
      });
  };
  
  const sierraCode = sierraData.codigo_barra || sierraData.codigo || '';
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <QrCodeIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Código QR para Afilado
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box 
        ref={qrRef}
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
        p={2}
      >
        {sierraCode ? (
          <>
            <Box sx={{ background: 'white', p: 2, borderRadius: 1 }}>
              <QRCode value={sierraCode} size={150} />
            </Box>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Código: {sierraCode}
            </Typography>
            
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
              Escanee este código con la pistola lectora en la página de afilados para iniciar el proceso rápidamente.
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="error">
            No hay código disponible para generar QR
          </Typography>
        )}
      </Box>
      
      <Box display="flex" justifyContent="center" gap={1}>
        <Tooltip title="Copiar código">
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<CopyIcon />}
            onClick={handleCopyCode}
            disabled={!sierraCode}
          >
            Copiar
          </Button>
        </Tooltip>
        
        <Tooltip title="Imprimir QR">
          <Button 
            variant="contained" 
            size="small" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={handlePrintQR}
            disabled={!sierraCode}
          >
            Imprimir QR
          </Button>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default SierraQRCode;