import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, ...props }) => {
  return (
    <Button {...props} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, ...props.sx }}>
      {children}
    </Button>
  );
};

export default CustomButton; 