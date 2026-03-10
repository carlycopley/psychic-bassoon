// app.mjs
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// Mongo Client
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function connectToMongo() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log("MongoDB connected!");
  } catch (err) {
    console.error(err);
  }
}
connectToMongo();

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// -----------------------------
// Breakfast Items CRUD
// -----------------------------

// CREATE - new breakfast item
app.post('/api/breakfast', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });

    const db = client.db('breakfastBuddy');
    const col = db.collection('items');
    const result = await col.insertOne({ name });
    res.json({ message: 'Breakfast item created', id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// READ - all breakfast items
app.get('/api/breakfast', async (req, res) => {
  try {
    const db = client.db('breakfastBuddy');
    const col = db.collection('items');
    const items = await col.find({}).toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

// DELETE - remove breakfast item
app.delete('/api/breakfast/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = client.db('breakfastBuddy');
    const col = db.collection('items');
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// -----------------------------
// Meal Logs CRUD
// -----------------------------

// CREATE - log a meal
app.post('/api/logs', async (req, res) => {
  try {
    const { foods, date } = req.body;
    if (!foods || !Array.isArray(foods)) return res.status(400).json({ error: 'Invalid foods' });

    const db = client.db('breakfastBuddy');
    const col = db.collection('logs');
    const result = await col.insertOne({ foods, date });
    res.json({ message: 'Meal logged', id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

// READ - all meal logs
app.get('/api/logs', async (req, res) => {
  try {
    const db = client.db('breakfastBuddy');
    const col = db.collection('logs');
    const logs = await col.find({}).toArray();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

app.put('/api/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { foods, date } = req.body; // get both foods and date

    const db = client.db('breakfastBuddy');
    const col = db.collection('logs');

    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { foods, date } } // update both
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({ message: 'Log updated!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

// UPDATE - edit a meal log
app.put('/api/logs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { foods, date } = req.body;

        if (!foods || !Array.isArray(foods) || !date) {
            return res.status(400).json({ error: 'Invalid foods or date' });
        }

        const db = client.db('breakfastBuddy');
        const col = db.collection('logs');

        const result = await col.updateOne(
            { _id: new ObjectId(id) },
            { $set: { foods, date } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }

        res.json({ message: 'Log updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update log' });
    }
});

// DELETE - remove a meal log
app.delete('/api/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = client.db('breakfastBuddy');
    const col = db.collection('logs');
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Log deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// start server
app.listen(3000, () => console.log('Server running at http://localhost:3000'));