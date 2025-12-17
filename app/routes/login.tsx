import type { Route } from "./+types/login";
import { Form, redirect, useActionData } from "react-router";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commitSession, getSession } from "../sessions";

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
    <div className="min-h-screen grid place-items-center bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-md p-8 border border-black space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Recipes</h1>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Welcome Back
          </p>
        </div>

        <Form method="post" className="space-y-6">
          {actionData?.error && (
            <div className="text-red-600 text-sm font-bold text-center uppercase tracking-wider">
              {actionData.error}
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-black/70"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              className="w-full bg-transparent border-b border-black py-2 px-1 text-lg placeholder:text-gray-300 focus:outline-none focus:border-black/40 transition-colors rounded-none"
              placeholder="chef@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest text-black/70"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full bg-transparent border-b border-black py-2 px-1 text-lg placeholder:text-gray-300 focus:outline-none focus:border-black/40 transition-colors rounded-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-black/90 transition-transform active:scale-[0.99] duration-200 cursor-pointer"
          >
            Sign In
          </button>
        </Form>

        <div className="mt-8 text-center">
          <a href="#" className="text-xs font-medium text-gray-500 hover:text-black underline-offset-4 hover:underline transition-all">
            FORGOT PASSWORD?
          </a>
        </div>
      </div>
    </div>
  );
}
