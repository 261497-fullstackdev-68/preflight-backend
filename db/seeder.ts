import { dbClient } from "./client.js";
import { shareTodoTable, todoTable, userTable } from "./schema.js";
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
    // Deleting shareTodoTable first to satisfy foreign key constraints
    await dbClient.delete(shareTodoTable);
    await dbClient.delete(todoTable);
    await dbClient.delete(userTable);
    console.log("✅ Old data deleted successfully.");

    // --- Step 2: Seed 5 Users ---
    const users = Array.from({ length: 5 }, () => ({
      username: faker.internet.userName(),
      passwordHash: generatePasswordHash("password123"),
      isActive: true,
      createdAt: faker.date.past(),
    }));

    console.log("👤 Inserting 5 users...");
    const insertedUsers = await dbClient
      .insert(userTable)
      .values(users)
      .returning();
    console.log("✅ Users seeded successfully.");

    // --- Step 3: Seed 4 Todos for each user ---
    const todos = insertedUsers.flatMap((user) =>
      Array.from({ length: 4 }, () => ({
        userId: user.id,
        title: faker.lorem.sentence(3),
        description: faker.lorem.paragraph(),
        isDone: faker.datatype.boolean(),
        startDate: faker.date.soon(),
        endDate: faker.date.future(),
        imagePath: faker.image.url(),
      }))
    );

    console.log("📝 Inserting todos...");
    const insertedTodos = await dbClient
      .insert(todoTable)
      .values(todos)
      .returning();
    console.log(`✅ ${insertedTodos.length} todos seeded successfully.`);

    // --- Step 4: Skip Seeding Shared Todos as requested ---
    console.log("🤝 Skipping shared todos as per the request.");

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
