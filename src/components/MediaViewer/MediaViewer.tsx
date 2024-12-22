// MediaViewer Component

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface MediaViewerProps {
  file: {
    name: string;
    type: string;
    downloadURL: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ file, open, onClose }) => {
  const theme = useTheme();

  if (!file) return null;

  const renderMediaContent = () => {
    switch (true) {
      case file?.type.startsWith('image/'):
        return <img src={file.downloadURL} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />;
      case file?.type.startsWith('video/'):
        return (
          <video controls style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <source src={file.downloadURL} type={file.type} />
            Your browser does not support this video.
          </video>
        );
      case file?.type.startsWith('audio/'):
        return (
          <audio controls style={{ width: '100%' }}>
            <source src={file.downloadURL} type={file.type} />
            Your browser does not support this audio.
          </audio>
        );
      case file?.type === 'application/pdf':
        return <iframe src={file.downloadURL} style={{ width: '100%', height: '100%' }} title={file.name} />;
      case file?.type === 'text/plain':
      case file?.type === 'text/csv':
        return <iframe src={file.downloadURL} style={{ width: '100%', height: '100%', border: 'none' }} title={file.name} />;
      default:
        return (
          <div style={{ textAlign: 'center' }}>
            <p>Cannot preview this file type.</p>
            <a href={file.downloadURL} target="_blank" rel="noopener noreferrer">Download File</a>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent style={{ position: 'relative', backgroundColor: theme.palette.background.default }}>
        <IconButton onClick={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>
          <CloseIcon />
        </IconButton>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          {renderMediaContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;
