import type { Route } from "./+types/login";
import { Form, redirect, useActionData, Link } from "react-router";
import { db } from "../db/index.server";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commitSession, getSession } from "../sessions.server";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Login - Recipes" },
    { name: "description", content: "Login to your account" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("token")) {
    return redirect("/");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.select().from(users).where(eq(users.email, email)).get();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Invalid email or password" };
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.SESSION_SECRET || "s3cr3t",
    { expiresIn: "1d" }
  );

  const session = await getSession(request.headers.get("Cookie"));
  session.set("token", token);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-sans p-6">
      <div className="w-full max-w-[400px]">

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
              {/* Reuse the SVG or Icon from Header/Design */}
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
          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-sm">
            Share and discover valuable learning resources
          </p>
        </div>

        {/* Card Section */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Log in</h2>
          </div>

          <Form method="post" className="space-y-4">
            {actionData?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg font-medium text-center">
                {actionData.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-700"
              >
                Email
              </label>
              <input
                type="text"
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
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white h-10 rounded-lg text-sm font-semibold hover:bg-black transition-colors cursor-pointer mt-2"
            >
              Login
            </button>
          </Form>

          <div className="mt-6 text-center text-xs text-gray-600">
            Don't have an account? <Link to="/signup" className="font-semibold text-gray-900 hover:underline">Sign up</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
