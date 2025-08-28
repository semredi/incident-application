const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Import the server app
const app = require('../server');

// Test data
const testIncident = {
  title: 'Test Fire Incident',
  description: 'This is a test incident for API testing',
  incident_type: 'Fire',
  location: 'Test Location',
};

describe('API Tests', () => {
  let server;
  const dataFile = path.join(__dirname, '../incidents.json');

  beforeAll(() => {
    // Start the server
    server = app.listen(5001);
  });

  afterAll(done => {
    // Close the server
    server.close(done);
  });

  beforeEach(() => {
    // Clear test data before each test
    if (fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
    }
  });

  describe('GET /api/incidents', () => {
    test('should return empty array when no incidents exist', async () => {
      const response = await request(app).get('/api/incidents').expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return incidents in reverse chronological order', async () => {
      // Create two incidents
      const incident1 = { ...testIncident, title: 'First Incident' };
      const incident2 = { ...testIncident, title: 'Second Incident' };

      await request(app)
        .post('/api/incidents')
        .field('title', incident1.title)
        .field('description', incident1.description)
        .field('incident_type', incident1.incident_type)
        .field('location', incident1.location)
        .expect(201);

      await request(app)
        .post('/api/incidents')
        .field('title', incident2.title)
        .field('description', incident2.description)
        .field('incident_type', incident2.incident_type)
        .field('location', incident2.location)
        .expect(201);

      const response = await request(app).get('/api/incidents').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Second Incident');
      expect(response.body[1].title).toBe('First Incident');
    });
  });

  describe('POST /api/incidents', () => {
    test('should create a new incident successfully', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .field('title', testIncident.title)
        .field('description', testIncident.description)
        .field('incident_type', testIncident.incident_type)
        .field('location', testIncident.location)
        .expect(201);

      expect(response.body).toMatchObject({
        title: testIncident.title,
        description: testIncident.description,
        incident_type: testIncident.incident_type,
        location: testIncident.location,
      });

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('image');
    });

    test('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .field('description', testIncident.description)
        .field('incident_type', testIncident.incident_type)
        .field('location', testIncident.location)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain(
        'Title and incident_type are required'
      );
    });

    test('should return 400 when incident_type is missing', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .field('title', testIncident.title)
        .field('description', testIncident.description)
        .field('location', testIncident.location)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain(
        'Title and incident_type are required'
      );
    });

    test('should return 400 when incident_type is invalid', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .field('title', testIncident.title)
        .field('description', testIncident.description)
        .field('incident_type', 'InvalidType')
        .field('location', testIncident.location)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid incident_type');
    });

    test('should accept valid incident types', async () => {
      const validTypes = ['Fire', 'Smoke', 'Emergency'];

      await Promise.all(
        validTypes.map(async type => {
          const response = await request(app)
            .post('/api/incidents')
            .field('title', `Test ${type} Incident`)
            .field('incident_type', type)
            .expect(201);

          expect(response.body.incident_type).toBe(type);
        })
      );
    });
  });

  describe('GET /uploads/:filename', () => {
    test('should return 404 for non-existent image', async () => {
      await request(app).get('/uploads/nonexistent.jpg').expect(404);
    });
  });
});
