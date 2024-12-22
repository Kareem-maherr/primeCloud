import React from 'react';
import { motion } from 'framer-motion';
import {
  Add as AddIcon,
  CreateNewFolder as FolderIcon,
  GetApp as GetAppIcon,
  SwapHoriz as SwapHorizIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: 10,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const AnimatedAddIcon = () => (
  <motion.div
    whileHover="hover"
    variants={iconVariants}
  >
    <AddIcon />
  </motion.div>
);

export const AnimatedFolderIcon = () => (
  <motion.div
    whileHover="hover"
    variants={{
      hover: {
        scale: 1.1,
        y: -2,
        transition: {
          duration: 0.2,
          ease: "easeInOut"
        }
      }
    }}
  >
    <FolderIcon />
  </motion.div>
);

export const AnimatedGetAppIcon = () => (
  <motion.div
    whileHover="hover"
    variants={{
      hover: {
        scale: 1.1,
        y: 2,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }
      }
    }}
  >
    <GetAppIcon />
  </motion.div>
);

export const AnimatedTransferIcon = () => (
  <motion.div
    whileHover="hover"
    variants={{
      hover: {
        scale: 1.1,
        x: [0, 5, -5, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
          times: [0, 0.2, 0.8, 1],
          repeat: Infinity
        }
      }
    }}
  >
    <SwapHorizIcon />
  </motion.div>
);

export const AnimatedShareIcon = () => (
  <motion.div
    whileHover="hover"
    variants={{
      hover: {
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
          times: [0, 0.2, 0.8, 1],
          repeat: Infinity
        }
      }
    }}
  >
    <ShareIcon />
  </motion.div>
);
