import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import { Delete as DeleteIcon, RestoreFromTrash as RestoreIcon } from '@mui/icons-material';

interface DeletedFile {
  id: string;
  name: string;
  deletedAt: number;
}

const RecycleBin: React.FC = () => {
  // TODO: Implement deleted files functionality with Firebase
  const deletedFiles: DeletedFile[] = []; // This will be populated from Firebase

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Recycle Bin
      </Typography>
      
      {deletedFiles.length === 0 ? (
        <Typography color="text.secondary">
          No deleted files
        </Typography>
      ) : (
        <List>
          {deletedFiles.map((file) => (
            <ListItem
              key={file.id}
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="restore" sx={{ mr: 1 }}>
                    <RestoreIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete permanently">
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`Deleted on ${new Date(file.deletedAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RecycleBin;
