const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter(req, file, cb) {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Data file path
const dataFile = path.join(__dirname, 'incidents.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
}

// Helper function to read incidents
function readIncidents() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading incidents:', error);
    return [];
  }
}

// Helper function to write incidents
function writeIncidents(incidents) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(incidents, null, 2));
  } catch (error) {
    console.error('Error writing incidents:', error);
    throw error;
  }
}

// API Routes

// GET /api/incidents - List incidents (latest first)
app.get('/api/incidents', (req, res) => {
  try {
    const incidents = readIncidents();
    // Sort by created time (latest first)
    const sortedIncidents = incidents.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    res.json(sortedIncidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// POST /api/incidents - Create an incident
app.post('/api/incidents', upload.single('image'), (req, res) => {
  try {
    const { title, description, incident_type, location } = req.body;

    // Validation
    if (!title || !incident_type) {
      return res.status(400).json({
        error: 'Title and incident_type are required fields',
      });
    }

    const validIncidentTypes = ['Fire', 'Smoke', 'Emergency'];
    if (!validIncidentTypes.includes(incident_type)) {
      return res.status(400).json({
        error: 'Invalid incident_type. Must be one of: Fire, Smoke, Emergency',
      });
    }

    const incidents = readIncidents();

    const newIncident = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description ? description.trim() : '',
      incident_type,
      location: location ? location.trim() : '',
      image: req.file ? req.file.filename : null,
      created_at: new Date().toISOString(),
    };

    incidents.push(newIncident);
    writeIncidents(incidents);

    return res.status(201).json(newIncident);
  } catch (error) {
    console.error('Error creating incident:', error);
    return res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Serve uploaded images
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(uploadsDir, filename);

  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
