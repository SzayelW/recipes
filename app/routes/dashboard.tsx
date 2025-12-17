import type { Route } from "./+types/dashboard";
import { Form, redirect } from "react-router";
import { getSession, destroySession } from "../sessions";
import jwt from "jsonwebtoken";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Dashboard - Recipes" }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    if (!token) {
        throw redirect("/login");
    }

    try {
        const user = jwt.verify(token, process.env.SESSION_SECRET || "s3cr3t");
        return { user };
    } catch (error) {
        throw redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    }
}

export async function action({ request }: Route.ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData as { user: { email: string } };

    return (
        <div className="min-h-screen bg-white text-black font-sans p-8">
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
                <header className="flex justify-between items-center border-b border-black pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-tighter">Recipes</h1>
                    <Form method="post">
                        <button
                            type="submit"
                            className="text-sm font-bold uppercase tracking-widest hover:text-gray-500 transition-colors cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </Form>
                </header>

                <main className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-6xl font-black uppercase tracking-tight">Welcome.</h2>
                        <p className="text-xl font-medium text-gray-500 max-w-2xl">
                            You are logged in as <span className="text-black">{user.email}</span>.
                            <br />
                            Start crafting your next culinary masterpiece.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Placeholder content for "details later on" */}
                        <div className="aspect-square border border-black p-4 flex flex-col justify-end hover:bg-black hover:text-white transition-colors cursor-pointer group">
                            <span className="font-bold uppercase tracking-widest text-lg group-hover:translate-x-1 transition-transform">My Recipes</span>
                        </div>
                        <div className="aspect-square border border-black p-4 flex flex-col justify-end hover:bg-black hover:text-white transition-colors cursor-pointer group">
                            <span className="font-bold uppercase tracking-widest text-lg group-hover:translate-x-1 transition-transform">Explore</span>
                        </div>
                        <div className="aspect-square border border-black p-4 flex flex-col justify-end hover:bg-black hover:text-white transition-colors cursor-pointer group">
                            <span className="font-bold uppercase tracking-widest text-lg group-hover:translate-x-1 transition-transform">Settings</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
