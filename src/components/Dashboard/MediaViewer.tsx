import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface MediaViewerProps {
  open: boolean;
  onClose: () => void;
  file: {
    name: string;
    type: string;
    downloadURL: string;
  } | null;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ open, onClose, file }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [textContent, setTextContent] = useState<string>('');

  useEffect(() => {
    if (file) {
      // Reset states when file changes
      setLoading(true);
      setError(null);
      setZoom(1);
      setTextContent('');

      // For text files, fetch content
      if (file.type.includes('text/')) {
        fetchTextContent();
      } else {
        // For images and PDFs, we'll let them handle their own loading state
        setLoading(false);
      }
    }
  }, [file]);

  const fetchTextContent = async () => {
    if (!file?.downloadURL) {
      setError('No valid file URL provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(file.downloadURL, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      setTextContent(text);
      setError(null);
    } catch (err) {
      setError('Failed to load text content');
      console.error('Error loading text:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (file?.downloadURL) {
      window.open(file.downloadURL, '_blank');
    }
  };

  const renderContent = () => {
    if (!file) return null;

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <Box sx={{ position: 'relative', minHeight: 400 }}>
          {loading && (
            <Box 
              position="absolute" 
              top="50%" 
              left="50%" 
              sx={{ transform: 'translate(-50%, -50%)' }}
            >
              <CircularProgress />
            </Box>
          )}
          <Box
            component="img"
            src={file.downloadURL}
            alt={file.name}
            sx={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 200px)',
              objectFit: 'contain',
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s ease-in-out',
              display: loading ? 'none' : 'block',
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load image');
              setLoading(false);
            }}
          />
        </Box>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <Box sx={{ position: 'relative', minHeight: 400 }}>
          {loading && (
            <Box 
              position="absolute" 
              top="50%" 
              left="50%" 
              sx={{ transform: 'translate(-50%, -50%)' }}
            >
              <CircularProgress />
            </Box>
          )}
          <Document
            file={{ url: file.downloadURL }}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setLoading(false);
            }}
            onLoadError={(error) => {
              console.error('Error loading PDF:', error);
              setError('Failed to load PDF');
              setLoading(false);
            }}
            loading={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
              </Box>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={zoom}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
            {numPages && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography>
                  Page {pageNumber} of {numPages}
                </Typography>
              </Box>
            )}
          </Document>
        </Box>
      );
    }

    if (file.type.includes('text/')) {
      if (loading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        );
      }

      return (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: `${14 * zoom}px`,
          }}
        >
          {textContent}
        </Paper>
      );
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Unsupported file type</Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          minHeight: '60vh',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, pr: 2 }}>
          {file?.name}
        </Typography>
        <Box>
          <IconButton onClick={handleZoomOut} size="small" sx={{ mr: 1 }}>
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleZoomIn} size="small" sx={{ mr: 1 }}>
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={handleDownload} size="small" sx={{ mr: 1 }}>
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          bgcolor: theme.palette.background.default,
        }}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;
