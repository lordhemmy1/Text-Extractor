// server.js
const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set up multer for file uploads (files stored temporarily in the "uploads" folder)
const upload = multer({ dest: 'uploads/' });

// Create a client using your credentials
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, 'gcp-key.json'),
});

// Serve static files (HTML, CSS, JS) from the "public" directory
app.use(express.static('public'));

// Endpoint to handle image upload and text extraction
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Send the image file to the Vision API for text detection
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    
    // Delete the uploaded file after processing
    fs.unlink(filePath, err => {
      if (err) console.error('Error deleting file:', err);
    });
    
    // Return the detected text (if any)
    if (detections && detections.length > 0) {
      res.json({ text: detections[0].description });
    } else {
      res.json({ text: 'No text detected.' });
    }
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
