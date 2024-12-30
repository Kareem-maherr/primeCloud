import React from 'react';
import { Button, ButtonProps, styled } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  noPadding?: boolean;
}

const StyledButton = styled(Button)<CustomButtonProps>(({ theme, noPadding }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  textTransform: 'none',
  padding: noPadding ? undefined : '8px 16px',
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&.MuiButton-outlined': {
    borderColor: theme.palette.divider,
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
  },
  '&.MuiButton-text': {
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.primary.main,
    },
  },
}));

const CustomButton: React.FC<CustomButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default CustomButton;
