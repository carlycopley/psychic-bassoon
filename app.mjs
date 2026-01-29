//app.mjs
//we are in ES6, use this. 
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient , ServerApiVersion } from 'mongodb';

// const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI; 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html')) ;

})

app.get('/json', (req, res) =>{
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})