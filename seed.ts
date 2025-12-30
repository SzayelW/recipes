import { db } from "./app/db";
import { users, resources } from "./app/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding database...");

    // Seed Admin
    let adminId: number;
    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin")).get();

    if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("admin", salt);

        const result = await db.insert(users).values({
            email: "admin",
            password: passwordHash,
        }).returning({ id: users.id }).get();

        adminId = result.id;
        console.log("Admin user created.");
    } else {
        adminId = existingAdmin.id;
        console.log("Admin user already exists.");
    }

    // Seed Resources
    const existingResources = await db.select().from(resources).limit(1).all();
    if (existingResources.length === 0) {
        await db.insert(resources).values([
            {
                title: "Getting Started with React Hooks",
                description: "A comprehensive guide to understanding and using React Hooks in your applications.",
                type: "Article",
                tags: JSON.stringify(["React", "JavaScript", "Hooks", "Frontend"]),
                link: "#",
                authorId: adminId,
                createdAt: new Date(),
            },
            {
                title: "Custom useDebounce Hook",
                description: "A reusable debounce hook for optimizing search and input performance.",
                type: "Code Snippet",
                tags: JSON.stringify(["React", "Hooks", "TypeScript", "Performance"]),
                link: "#",
                authorId: adminId,
                createdAt: new Date(Date.now() - 86400000), // Yesterday
            },
            {
                title: "You Don't Know JS",
                description: "A deep dive into the core mechanisms of JavaScript. This book series goes beyond the basics.",
                type: "Article",
                tags: JSON.stringify(["JavaScript", "Books", "Fundamentals"]),
                link: "#",
                authorId: adminId,
                createdAt: new Date(Date.now() - 172800000), // 2 days ago
            },
            {
                title: "TypeScript Deep Dive",
                description: "Master TypeScript with this comprehensive course covering advanced types and patterns.",
                type: "Course",
                tags: JSON.stringify(["TypeScript", "Course", "Advanced"]),
                link: "#",
                authorId: adminId,
                createdAt: new Date(Date.now() - 259200000), // 3 days ago
            }
        ]);
        console.log("Sample resources seeded.");
    } else {
        console.log("Resources already exist.");
    }

    console.log("Seeding complete.");
}

seed();
