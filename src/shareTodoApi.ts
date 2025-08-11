import type { Express } from "express";
import { dbClient } from "@db/client.js";
import { shareTodoTable } from "@db/schema.js";
import { and, eq, inArray } from "drizzle-orm";
import { todoTable } from "@db/schema.js";

export function TodoRoutes(app: Express) {
  app.post("/todos/shareTodo", async (req, res) => {
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

  app.post("/todos/fullTodo", async (req, res) => {
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
    console.log("test decline");
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
          message: "Share todo status updated to Decline.",
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

  app.post("/shareTodo/withOthers", async (req, res) => {
    const { task_id, share_with } = req.body;

    if (!task_id || !share_with) {
      return res.status(400).json({
        error: "task_id and sharewith are required in the request body.",
      });
    }

    try {
      const existingShare = await dbClient.query.shareTodoTable.findFirst({
        where: and(
          eq(shareTodoTable.taskId, task_id),
          eq(shareTodoTable.shareWith, share_with)
        ),
      });

      if (existingShare) {
        // If a duplicate is found, return a 409 Conflict status
        return res
          .status(409)
          .json({ error: "This todo is already shared with this user." });
      }

      const newShareTodo = await dbClient
        .insert(shareTodoTable)
        .values({
          taskId: task_id,
          shareWith: share_with,
        })
        .returning();

      if (newShareTodo.length === 0) {
        return res.status(500).json({ error: "Failed to create shared todo." });
      }

      return res.status(201).json({
        message: "Shared todo created successfully!",
        newShareTodo: newShareTodo[0],
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "internal server error." });
    }
  });

  app.get("/getShareTodo/:task_id", async (req, res) => {
    const { task_id } = req.params;

    if (!task_id || isNaN(parseInt(task_id))) {
      return res
        .status(400)
        .json({ error: "A valid task_id is required in the URL." });
    }

    const taskIdAsNumber = parseInt(task_id);

    try {
      const sharedTodos = await dbClient.query.shareTodoTable.findMany({
        where: eq(shareTodoTable.taskId, taskIdAsNumber),
      });

      return res.status(200).json(sharedTodos);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "internal server error." });
    }
  });

  app.post("/todos/editTodo", async (req, res) => {
    const { id, title, description, isDone, startDate, endDate, imagePath } =
      req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Todo ID is required to edit a todo." });
    }

    try {
      const updatedFields = {
        title,
        description,
        isDone,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        imagePath,
      };

      const updatedTodo = await dbClient
        .update(todoTable)
        .set(updatedFields)
        .where(eq(todoTable.id, id))
        .returning();

      if (updatedTodo.length === 0) {
        return res.status(404).json({ error: "Todo not found." });
      }

      return res.status(200).json({
        message: "Todo updated successfully!",
        updatedTodo: updatedTodo[0],
      });
    } catch (error) {
      console.error("Failed to edit todo:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  });
}
