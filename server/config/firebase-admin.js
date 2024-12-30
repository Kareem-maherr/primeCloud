const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'pg-file-management.firebasestorage.app'
});

module.exports = admin;
