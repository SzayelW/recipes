import type { Route } from "./+types/profile";
import { Form, redirect, useLoaderData, useActionData, Link } from "react-router";
import { getSession, destroySession } from "../sessions.server";
import jwt from "jsonwebtoken";
import { db } from "../db/index.server";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { Header } from "../components/Header";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "My Profile - Method Knowledge Hub" }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    if (!token) {
        throw redirect("/login");
    }

    let userEmail = "";
    try {
        const payload = jwt.verify(token, process.env.SESSION_SECRET || "s3cr3t") as { email: string, userId: number };
        userEmail = payload.email;
    } catch (error) {
        throw redirect("/login", {
            headers: { "Set-Cookie": await destroySession(session) },
        });
    }

    const user = await db.select().from(users).where(eq(users.email, userEmail)).get();

    if (!user) {
        throw redirect("/login", {
            headers: { "Set-Cookie": await destroySession(session) },
        });
    }

    return {
        userEmail, // Current session email
        user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }
    };
}

export async function action({ request }: Route.ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    if (!token) return redirect("/login");

    let currentUserId = 0;
    try {
        const payload = jwt.verify(token, process.env.SESSION_SECRET || "s3cr3t") as { userId: number };
        currentUserId = payload.userId;
    } catch {
        return redirect("/login");
    }

    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!firstName || !lastName || !email) {
        return { error: "Name and Email are required." };
    }

    const updateData: any = {
        firstName,
        lastName,
        email,
    };

    // If password provided, validate and update
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            return { error: "Passwords do not match." };
        }
        if (newPassword.length < 6) {
            return { error: "Password must be at least 6 characters." };
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateData.password = hashedPassword;
    }

    // Check if email changed and if strictly unique (if modified)
    // For MVP, if email changes, we might need to update session or re-login. 
    // Here we just update.

    try {
        await db.update(users).set(updateData).where(eq(users.id, currentUserId));
    } catch (e: any) {
        if (e.message.includes("UNIQUE constraint failed: users.email")) {
            return { error: "Email is already in use." };
        }
        return { error: "Failed to update profile." };
    }

    return { success: "Profile updated successfully!" };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
    const { userEmail, user } = loaderData;
    const actionData = useActionData<typeof action>();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-black font-sans relative">
            <Header
                userEmail={userEmail}
            />

            <div className="flex flex-1 container mx-auto px-6 py-8 overflow-y-auto flex-col items-center">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                        <Link to="/" className="text-sm font-semibold text-gray-900 hover:underline">
                            ← Back to Dashboard
                        </Link>
                    </div>

                    <Form method="post" className="space-y-6">
                        {actionData?.error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg font-medium text-center">
                                {actionData.error}
                            </div>
                        )}
                        {actionData?.success && (
                            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg font-medium text-center">
                                {actionData.success}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Username</label>
                            <input
                                type="text"
                                value={user.username || ""}
                                disabled
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 outline-none cursor-not-allowed"
                            />
                            <p className="text-[10px] text-gray-400">Username cannot be changed.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="firstName" className="block text-xs font-bold text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    defaultValue={user.firstName}
                                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="lastName" className="block text-xs font-bold text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    defaultValue={user.lastName}
                                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-xs font-bold text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                defaultValue={user.email}
                                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="newPassword" className="block text-xs font-bold text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="rounded-md bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>

                    </Form>
                </div>
            </div>
        </div>
    );
}
