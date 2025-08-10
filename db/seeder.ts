import { dbClient } from "./client.js"; // Assuming your Drizzle DB connection is in a db.ts file
import { shareTodoTable, todoTable, userTable } from "./schema.js"; // Your Drizzle schema
import { acceptedEnum } from "./schema.js";
import { faker } from "@faker-js/faker";

// A simple function to generate a password hash (for demonstration)
const generatePasswordHash = (password: string) => {
  // In a real app, use a proper hashing library like bcrypt
  return `hashed_${password}_123`;
};

async function main() {
  try {
    console.log("🌱 Seeding the database...");

    // --- Step 1: Clean up existing data to prevent duplicates ---
    console.log("🗑️ Deleting old data...");
    await dbClient.delete(shareTodoTable);
    await dbClient.delete(todoTable);
    await dbClient.delete(userTable);

    // --- Step 2: Seed Users ---
    const users = Array.from({ length: 5 }, (_, i) => ({
      username: faker.internet.userName(),
      passwordHash: generatePasswordHash("password123"),
      isActive: true,
      createdAt: faker.date.past().toISOString(),
    }));

    console.log("👤 Inserting 5 users...");
    const insertedUsers = await dbClient
      .insert(userTable)
      .values(users)
      .returning();
    console.log("✅ Users seeded successfully.");

    // --- Step 3: Seed Todos (3 for each user) ---
    const todos = insertedUsers.flatMap((user) =>
      Array.from({ length: 3 }, () => ({
        userId: user.id,
        title: faker.lorem.sentence(3),
        description: faker.lorem.paragraph(),
        isDone: faker.datatype.boolean(),
        startDate: faker.date.soon().toISOString(),
        endDate: faker.date.future().toISOString(),
        imagePath: faker.image.url(),
      }))
    );

    console.log("📝 Inserting todos...");
    const insertedTodos = await dbClient
      .insert(todoTable)
      .values(todos)
      .returning();
    console.log("✅ Todos seeded successfully.");

    // --- Step 4: Seed Shared Todos ---
    console.log("🤝 Sharing some todos...");
    const sharedTodos = insertedTodos
      .slice(0, 3) // Pick a few todos to share
      .map((todo, index) => {
        const sharer = insertedUsers.find((user) => user.id === todo.userId);
        const shareWithUser = insertedUsers[(index + 1) % insertedUsers.length]; // Share with the next user in the list

        // Ensure a user doesn't share a todo with themselves
        if (sharer?.id === shareWithUser?.id) {
          return null;
        }

        let isAccepted: (typeof acceptedEnum.enumValues)[number] = "Pending";
        if (index === 0) {
          isAccepted = "True"; // Mark the first shared todo as accepted
        } else if (index === 1) {
          isAccepted = "False"; // Mark the second as declined
        }

        return {
          taskId: todo.id,
          shareWith: shareWithUser?.id,
          createdAt: faker.date.past().toISOString(),
          isAccepted,
        };
      })
      .filter(
        (
          todo
        ): todo is {
          taskId: number;
          shareWith: number;
          createdAt: string;
          isAccepted: (typeof acceptedEnum.enumValues)[number];
        } => todo !== null
      ); // Remove any null entries from the array

    if (sharedTodos.length > 0) {
      await dbClient.insert(shareTodoTable).values(sharedTodos);
      console.log(`✅ ${sharedTodos.length} todos shared successfully.`);
    } else {
      console.log("⚠️ No todos were shared.");
    }

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
