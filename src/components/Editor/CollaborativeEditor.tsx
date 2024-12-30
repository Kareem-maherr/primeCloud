import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface CollaborativeEditorProps {
  documentId: string;
  currentUser: {
    displayName: string;
    email: string;
  };
  filePath: string | null;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link'
];

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ 
  documentId, 
  currentUser,
  filePath,
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTextFile = async () => {
      if (!filePath) {
        setError('No file path provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading file from path:', filePath);
        
        // Fetch content from our server endpoint
        const response = await fetch(`http://localhost:1234/api/files/content?path=${encodeURIComponent(filePath)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
        setLoading(false);
      } catch (err) {
        console.error('Error loading file:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file');
        setLoading(false);
      }
    };

    loadTextFile();
  }, [filePath]);

  const handleSave = async () => {
    try {
      // Here you would implement the save functionality
      // For now, we'll just log the content
      console.log('Content to save:', content);
      alert('Save functionality will be implemented soon!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error saving file:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error: {error}
      </Box>
    );
  }

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          Editing as {currentUser.displayName}
        </Typography>
      </Box>
      <Box 
        sx={{ 
          flex: 1,
          '& .ql-container': {
            height: 'calc(100% - 42px)', // 42px is toolbar height
            fontSize: '16px',
          },
          '& .ql-editor': {
            minHeight: '300px',
          },
        }}
      >
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          style={{ height: '100%' }}
        />
      </Box>
    </Paper>
  );
};

export default CollaborativeEditor;
