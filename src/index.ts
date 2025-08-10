// src/index.ts
import "dotenv/config";
import express from "express";
import { dbClient } from "@db/client.js";
import { userTable } from "@db/schema.js";
import { eq } from "drizzle-orm";

const app = express();
const port = process.env.BACK_END_PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});
asdsa
app.get("/users", async (req, res) => {
  const allUsers = await dbClient.select().from(userTable);
  return res.json(allUsers);
});

app.get("/allSharedTodo", async (req, res) => {
  const allSharedTodo = await dbClient.select().from(shareTodoTable);
  return res.json(allSharedTodo);
});

app.post("/shareTodo/accept", async (req, res) => {
  const { share_todo_id } = req.body;
  if (!share_todo_id) {
    return res.status(400).json({ message: 'share_todo_id is required.' });
  }

  try {
    // Find the shared_todo record and update is_accepted to true
    const updatedRecord = await dbClient
      .update(shareTodoTable)
      .set({ is_accepted: true })
      .where(eq(shareTodoTable.share_todo_id, share_todo_id))
      .returning();

    if (updatedRecord.length > 0) {
      // You can also get the todo_id from the updatedRecord and update the main todo table if needed
      // const todoId = updatedRecord[0].todo_id;
      // await db.update(Todo).set({ is_done: true }).where(eq(Todo.task_id, todoId));

      return res.status(200).json({ message: 'Share request accepted successfully.', data: updatedRecord[0] });
    } else {
      return res.status(404).json({ message: 'Share request not found.' });
    }
  } catch (error) {
    console.error('Failed to accept share request:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }

})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
