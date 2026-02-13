import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const users = [
    { email: "admin@school.com", password: "admin123", role: "ADMIN" },
    { email: "teacher1@school.com", password: "teacher123", role: "TEACHER" },
    { email: "student1@school.com", password: "student123", role: "STUDENT" },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await connection.execute(
      "INSERT INTO User (email, password, role) VALUES (?, ?, ?)",
      [user.email, hashedPassword, user.role]
    );

    console.log(`✅ Inserted ${user.email}`);
  }

  await connection.end();
}

run().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
