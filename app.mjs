// app.mjs
// Full Stack DevOps App - Breakfast Buddy + Attendance Tracker
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToMongo() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
connectToMongo();

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// --------------------
// Routes
// --------------------

// Serve main Breakfast Buddy app
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Serve old attendance tracker (for CRUD demonstration)
app.get('/attendance', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'attend.html'));
});

// Inject server variable example (optional)
app.get('/inject', async (req, res) => {
  try {
    const html = await readFile(join(__dirname, 'public', 'index.html'), 'utf8');
    const injectedHtml = html.replace('{{myVar}}', 'injected from server');
    res.send(injectedHtml);
  } catch (err) {
    res.status(500).send('Error loading page');
  }
});

// --------------------
// API Health & Info
// --------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'CIS 486 DevOps Server',
    timestamp: new Date().toISOString(),
    endpoints: [
      { method: 'GET', path: '/', description: 'Serve Breakfast Buddy main page' },
      { method: 'GET', path: '/attendance', description: 'Serve Attendance Tracker' },
      { method: 'GET', path: '/api/health', description: 'API health check' },
      { method: 'GET', path: '/api/class', description: 'Get class info' },
      { method: 'POST', path: '/api/attendance', description: 'Create attendance record' },
      { method: 'GET', path: '/api/attendance', description: 'Get all attendance records' },
      { method: 'PUT', path: '/api/attendance/:id', description: 'Update attendance record' },
      { method: 'DELETE', path: '/api/attendance/:id', description: 'Delete attendance record' },
    ],
  });
});

// --------------------
// Class Info API
// --------------------
app.get('/api/class', (req, res) => {
  res.json({
    courseNumber: 'CIS 486',
    courseName: 'Projects in IS',
    nickname: 'Full Stack DevOps',
    semester: 'Spring 2026',
    calendar: 'Class calendar coming soon!',
  });
});

// --------------------
// Attendance CRUD API
// --------------------

// Create attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { studentName, date, keyword } = req.body;
    if (!studentName || !date || !keyword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = client.db('cis486');
    const collection = db.collection('attendance');

    const result = await collection.insertOne({
      studentName,
      date,
      keyword,
      timestamp: new Date(),
    });

    res.status(201).json({ message: 'Attendance recorded!', id: result.insertedId });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Read all attendance
app.get('/api/attendance', async (req, res) => {
  try {
    const db = client.db('cis486');
    const collection = db.collection('attendance');
    const records = await collection.find({}).toArray();
    res.json(records);
  } catch (error) {
    console.error('Error reading attendance:', error);
    res.status(500).json({ error: 'Failed to get attendance records' });
  }
});

// Update attendance
app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, date, keyword } = req.body;

    const db = client.db('cis486');
    const collection = db.collection('attendance');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { studentName, date, keyword, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Attendance updated!' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Delete attendance
app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const db = client.db('cis486');
    const collection = db.collection('attendance');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Attendance deleted!' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
