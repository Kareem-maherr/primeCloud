import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DefaultFileIcon,
} from '@mui/icons-material';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (term: string) => Promise<Array<{ id: string; name: string; type: string; path: string; displayPath?: string }>>;
  onItemClick: (item: { id: string; name: string; type: string; path: string; displayPath?: string }) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onClose, onSearch, onItemClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; type: string; path: string; displayPath?: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setResults([]);
    }
  }, [open]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setLoading(true);
      try {
        const searchResults = await onSearch(value);
        setResults(searchResults);
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'folder') return <FolderIcon color="primary" />;
    if (type.startsWith('image/')) return <ImageIcon color="error" />;
    if (type.startsWith('video/')) return <VideoIcon color="warning" />;
    if (type === 'application/pdf') return <PdfIcon color="error" />;
    if (type.includes('text/')) return <FileIcon color="info" />;
    return <DefaultFileIcon color="action" />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '50vh',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon color="primary" />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Search Files and Folders
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          placeholder="Search for files and folders..."
          type="text"
          fullWidth
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        {results.length > 0 ? (
          <List>
            {results.map((item) => (
              <ListItem
                key={item.id}
                button
                onClick={() => {
                  onItemClick(item);
                  onClose();
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  {getFileIcon(item.type)}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <Box component="span" sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                    }}>
                      {item.displayPath && (
                        <>
                          <Typography 
                            variant="body2" 
                            component="span"
                            sx={{ 
                              color: 'text.secondary',
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.displayPath}
                          </Typography>
                        </>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : searchTerm && !loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No results found
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
