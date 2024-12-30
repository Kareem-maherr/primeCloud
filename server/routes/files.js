const express = require('express');
const router = express.Router();
const admin = require('../config/firebase-admin');

// Endpoint to get file content
router.get('/content', async (req, res) => {
    try {
        const { path } = req.query;
        
        if (!path) {
            return res.status(400).json({ error: 'File path is required' });
        }

        console.log('Fetching file content for path:', path);
        
        // Get the file from Firebase Storage
        const bucket = admin.storage().bucket();
        const file = bucket.file(path);
        
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Download the file contents
        const [content] = await file.download();
        
        // Set appropriate headers
        res.set('Content-Type', 'text/plain');
        
        // Send the content
        res.send(content.toString('utf-8'));
    } catch (error) {
        console.error('Error fetching file content:', error);
        res.status(500).json({ error: 'Failed to fetch file content', details: error.message });
    }
});

module.exports = router;
