import "dotenv/config";
import express from "express";
import { dbClient } from "@db/client.js";
import { userTable } from "@db/schema.js";
import { todoTable } from "@db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { TodoRoutes } from './shareTodoApi.js';
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import dayjs from "dayjs";
const app = express();
const port = process.env.BACK_END_PORT || 3000;


dayjs.extend(utc);
dayjs.extend(timezone);

// ให้ Express อ่าน JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
TodoRoutes(app);

// เปิด CORS เพื่อให้ frontend เชื่อมต่อได้
// app.use(cors({
//   origin: "http://localhost:5173",  // หรือ URL frontend ของคุณ
//   credentials: true,
// }));

// ---------------------- Signup ----------------------
app.post('/signup', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'ไม่มีข้อมูลใน body' });
  }

  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'รหัสผ่านไม่ตรงกัน' });
  }

  try {
    const existingUser = await dbClient
      .select()
      .from(userTable)
      .where(eq(userTable.username, username));

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username นี้ถูกใช้แล้ว' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await dbClient.insert(userTable).values({
      username,
      passwordHash,
      isActive: true,
    });

    res.json({ message: 'สมัครสมาชิกสำเร็จ' });

  } catch (error: unknown) {
    console.error(error);

    // type guard สำหรับ error object
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && (error as any).code === '23505'
    ) {
      return res.status(400).json({ message: 'Username นี้ถูกใช้แล้ว' });
    }
    if (
      typeof error === 'object' && error !== null &&
      'message' in error && typeof (error as any).message === 'string' &&
      (error as any).message.includes('unique')
    ) {
      return res.status(400).json({ message: 'Username นี้ถูกใช้แล้ว' });
    }

    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});


// ---------------------- Login ----------------------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
  }

  try {
    const users = await dbClient.select().from(userTable).where(eq(userTable.username, username));

    if (users.length === 0) {
      return res.status(400).json({ message: 'ไม่มีผู้ใช้นี้' });
    }

    const user = users[0]!;
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    res.json({ message: 'เข้าสู่ระบบสำเร็จ', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.get("/users", async (req, res) => {
  const allUsers = await dbClient.select().from(userTable);
  return res.json(allUsers);
});



app.get("/todo/:userId", async (req, res) => {
  const userTodos = await dbClient
    .select()
    .from(todoTable)
    .where(eq(todoTable.userId, Number(req.params.userId)));

  // แปลงเวลาจาก UTC เป็น Asia/Bangkok แบบ string ISO (local time)
  const convertedTodos = userTodos.map((todo) => ({
    ...todo,
    startDate: todo.startDate
      ? dayjs.utc(todo.startDate).tz("Asia/Bangkok").format()
      : null,
    endDate: todo.endDate
      ? dayjs.utc(todo.endDate).tz("Asia/Bangkok").format()
      : null,
  }));

  return res.json(convertedTodos);
});


// add
app.post("/create", async (req, res, next) => {
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
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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

// Delete
app.delete("/todo", async (req, res, next) => {
  try {
    const id = req.body.id ?? "";
    if (!id) throw new Error("Empty id");

    // Check for existence if data
    const results = await dbClient.query.todoTable.findMany({
      where: eq(todoTable.id, id),
    });
    if (results.length === 0) throw new Error("Invalid id");

    await dbClient.delete(todoTable).where(eq(todoTable.id, id));
    res.json({
      msg: `Delete successfully`,
      data: { id },
    });
  } catch (err) {
    next(err);
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});