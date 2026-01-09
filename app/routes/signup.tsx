import type { Route } from "./+types/signup";
import { Form, redirect, useActionData, Link } from "react-router";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Sign Up - Recipes" },
        { name: "description", content: "Create a new account" },
    ];
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Basic Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
    }

    // Check existing user
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
        return { error: "Email is already registered" };
    }

    // Hash password & Create User
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
    });

    return redirect("/login");
}

export default function Signup() {
    const actionData = useActionData<typeof action>();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-sans p-6">
            <div className="w-full max-w-[400px]">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Create an account</h1>
                    <p className="text-gray-600 text-sm">
                        Join our community of developers and learners
                    </p>
                </div>

                {/* Card Section */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                    <Form method="post" className="space-y-4">
                        {actionData?.error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg font-medium text-center">
                                {actionData.error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="firstName"
                                    className="block text-xs font-bold text-gray-700"
                                >
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="lastName"
                                    className="block text-xs font-bold text-gray-700"
                                >
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-xs font-bold text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-xs font-bold text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-xs font-bold text-gray-700"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white h-10 rounded-lg text-sm font-semibold hover:bg-black transition-colors cursor-pointer mt-4"
                        >
                            Sign Up
                        </button>
                    </Form>

                    <div className="mt-6 text-center text-xs text-gray-600">
                        Already have an account? <Link to="/login" className="font-semibold text-gray-900 hover:underline">Log in</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
