import { db } from "./app/db";
import { users } from "./app/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding database...");

    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin")).get();

    if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("admin", salt);

        await db.insert(users).values({
            email: "admin",
            password: passwordHash,
        });
        console.log("Admin user created.");
    } else {
        console.log("Admin user already exists.");
    }

    console.log("Seeding complete.");
}

seed();
