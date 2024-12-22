import React from 'react';
import { Box, SvgIcon, SvgIconProps, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudIcon from '@mui/icons-material/Cloud';

const IconWrapper = styled(Box)({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
});

const StyledCloud = styled(CloudIcon)({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const CurvedArrow = styled('svg')(({ theme }) => ({
  position: 'absolute',
  width: '50%',
  height: '50%',
  transition: 'transform 0.3s ease-in-out',
  '.MuiButton-root:hover &': {
    transform: 'translateY(-4px)',
  },
}));

const AnimatedUploadIcon = (props: SvgIconProps) => {
  const theme = useTheme();
  
  return (
    <IconWrapper>
      <StyledCloud {...props} />
      <CurvedArrow viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3L8 7M12 3L16 7M12 3V15"
          stroke={theme.palette.grey[500]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12"
          stroke={theme.palette.grey[500]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
      </CurvedArrow>
    </IconWrapper>
  );
};

export default AnimatedUploadIcon;
