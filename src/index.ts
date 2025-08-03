// src/index.ts
import 'dotenv/config';
import express from 'express';
import { dbClient } from '@db/client.js';
import { userTable } from '@db/schema.js';

const app = express();
const port = process.env.BACK_END_PORT || 3000;

app.get('/users', async (req, res) => {
  const allUsers = await dbClient.select().from(userTable);
  return res.json(allUsers);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});