import React from 'react';
import { Box, SvgIcon, SvgIconProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudIcon from '@mui/icons-material/Cloud';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import NorthIcon from '@mui/icons-material/North';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Base wrapper for all variants
const IconWrapper = styled(Box)({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
});

// Style 1: Simple cloud with arrow
const StyledCloud1 = styled(CloudIcon)({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const StyledArrow1 = styled(ArrowUpwardIcon)(({ theme }) => ({
  position: 'absolute',
  width: '50%',
  height: '50%',
  color: theme.palette.grey[500],
  transition: 'transform 0.3s ease-in-out',
  '.MuiButton-root:hover &': {
    transform: 'translateY(-4px)',
  },
}));

// Style 2: Bouncing cloud with pulsing arrow
const StyledCloud2 = styled(CloudIcon)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '.MuiButton-root:hover &': {
    animation: 'bounce 0.5s ease infinite alternate',
  },
  '@keyframes bounce': {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(-2px)' },
  },
}));

const StyledArrow2 = styled(NorthIcon)(({ theme }) => ({
  position: 'absolute',
  width: '45%',
  height: '45%',
  color: theme.palette.grey[500],
  transition: 'all 0.3s ease-in-out',
  '.MuiButton-root:hover &': {
    animation: 'pulse 1s ease infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.2)', opacity: 0.7 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
}));

// Style 3: Modern file upload icon with slide effect
const StyledFileUpload = styled(FileUploadIcon)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '.MuiButton-root:hover &': {
    transform: 'translateY(-2px)',
    color: theme.palette.primary.main,
  },
}));

// Style 4: Upload file with fade effect
const StyledUploadFile = styled(UploadFileIcon)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '.MuiButton-root:hover &': {
    animation: 'fadeUpDown 1s ease infinite',
  },
  '@keyframes fadeUpDown': {
    '0%': { transform: 'translateY(0)', opacity: 1 },
    '50%': { transform: 'translateY(-4px)', opacity: 0.7 },
    '100%': { transform: 'translateY(0)', opacity: 1 },
  },
}));

// Style 5: Minimalist arrow with rotation
const StyledArrow5 = styled(ArrowUpwardIcon)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '.MuiButton-root:hover &': {
    transform: 'translateY(-2px) rotate(360deg)',
    color: theme.palette.primary.main,
  },
}));

export const UploadIcon1 = (props: SvgIconProps) => (
  <IconWrapper>
    <StyledCloud1 {...props} />
    <StyledArrow1 />
  </IconWrapper>
);

export const UploadIcon2 = (props: SvgIconProps) => (
  <IconWrapper>
    <StyledCloud2 {...props} />
    <StyledArrow2 />
  </IconWrapper>
);

export const UploadIcon3 = (props: SvgIconProps) => (
  <IconWrapper>
    <StyledFileUpload {...props} />
  </IconWrapper>
);

export const UploadIcon4 = (props: SvgIconProps) => (
  <IconWrapper>
    <StyledUploadFile {...props} />
  </IconWrapper>
);

export const UploadIcon5 = (props: SvgIconProps) => (
  <IconWrapper>
    <StyledArrow5 {...props} />
  </IconWrapper>
);
