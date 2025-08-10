import type { Express } from "express";
import { dbClient } from "@db/client.js";
import { shareTodoTable } from "@db/schema.js";
import { eq, inArray } from "drizzle-orm";
import { todoTable } from "@db/schema.js";

// This function takes the Express app instance and adds your routes to it.
export function TodoRoutes(app: Express) {
  app.get("/todos/shareTodo", async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: "user_id is a required parameter in the request body.",
      });
    }

    try {
      // Drizzle ORM query to select all records where 'share_with' matches the user_id
      const sharedTodos = await dbClient
        .select()
        .from(shareTodoTable)
        .where(eq(shareTodoTable.shareWith, Number(user_id)));

      // Send the fetched data as a JSON response
      res.json(sharedTodos);
    } catch (error) {
      console.error("Error fetching shared todos:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching shared todos." });
    }
  });

  app.get("/todos/fullTodo", async (req, res) => {
    const { task_id_list } = req.body;

    if (!task_id_list) {
      return res.status(400).json({
        error: "task_id_list is required in the request body",
      });
    }

    try {
      // Drizzle ORM query to select all todos where the 'id' is in the list
      const todos = await dbClient
        .select()
        .from(todoTable)
        .where(inArray(todoTable.id, task_id_list));

      res.json(todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      res.status(500).json({
        error: "An internal server error occurred while fetching todos.",
      });
    }
  });

  app.post("/shareTodo/accept", async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "id is required in the request body." });
    }

    try {
      const result = await dbClient
        .update(shareTodoTable)
        .set({
          isAccepted: "True",
        })
        .where(eq(shareTodoTable.id, id))
        .returning(); // Use .returning() to get the updated row back

      if (result.length > 0) {
        return res.json({
          message: "Share todo status updated to Accepted.",
          updatedTodo: result[0],
        });
      } else {
        return res
          .status(404)
          .json({ error: "Share todo with the provided ID not found." });
      }
    } catch (error) {
      console.error("Error updating share todo:", error);
      res.status(500).json({ error: "An internal server error occurred." });
    }
  });

  app.post("/shareTodo/decline", async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "id is required in the request body." });
    }

    try {
      const result = await dbClient
        .update(shareTodoTable)
        .set({
          isAccepted: "False",
        })
        .where(eq(shareTodoTable.id, id))
        .returning(); // Use .returning() to get the updated row back

      if (result.length > 0) {
        return res.json({
          message: "Share todo status updated to Accepted.",
          updatedTodo: result[0],
        });
      } else {
        return res
          .status(404)
          .json({ error: "Share todo with the provided ID not found." });
      }
    } catch (error) {
      console.error("Error updating share todo:", error);
      res.status(500).json({ error: "An internal server error occurred." });
    }
  });
}
