// src/components/ui/SafeFormControl.jsx
import React from 'react';
import { FormControl } from '@mui/material';

/**
 * Versión segura de FormControl que garantiza que la prop disabled siempre sea booleana
 */
const SafeFormControl = ({ disabled, ...props }) => {
  // Asegurarse de que disabled siempre sea un valor booleano
  const safeDisabled = disabled === true;
  
  return <FormControl disabled={safeDisabled} {...props} />;
};

export default SafeFormControl;