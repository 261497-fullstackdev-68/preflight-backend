// src/index.ts
import "dotenv/config";
import express from "express";
import { dbClient } from "@db/client.js";
import { userTable } from "@db/schema.js";
import { todoTable } from "@db/schema.js";

const app = express();
const port = process.env.BACK_END_PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.get("/users", async (req, res) => {
  const allUsers = await dbClient.select().from(userTable);
  return res.json(allUsers);
});

//add
app.put("/todo/create", async (req, res, next) => {
  try {
    const { userId, title, description, startDate, endDate, imagePath } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: "userId and title are required" });
    }

    const result = await dbClient
      .insert(todoTable)
      .values({
        userId,
        title,
        description: description ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        imagePath: imagePath ?? null,
      })
      .returning();

    res.json({
      msg: "Insert successfully",
      data: result[0],
    });
  } catch (err) {
    next(err);
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
