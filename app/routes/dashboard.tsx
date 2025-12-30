import type { Route } from "./+types/dashboard";
import { Form, redirect, useLoaderData } from "react-router";
import { getSession, destroySession } from "../sessions";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { resources } from "../db/schema";
import { eq, like, and, or } from "drizzle-orm";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { ResourceCard, type Resource } from "../components/ResourceCard";
import { Search, X } from "lucide-react";
import { useState } from "react";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Discover Resources - Method Knowledge Hub" }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    if (!token) {
        throw redirect("/login");
    }

    let userEmail = "";
    try {
        const payload = jwt.verify(token, process.env.SESSION_SECRET || "s3cr3t") as { email: string };
        userEmail = payload.email;
    } catch (error) {
        throw redirect("/login", {
            headers: { "Set-Cookie": await destroySession(session) },
        });
    }

    // Filter Logic
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const types = url.searchParams.getAll("type");
    const tags = url.searchParams.getAll("tag");

    let query = db.select().from(resources).$dynamic();

    const filters = [];

    if (q) {
        filters.push(or(like(resources.title, `%${q}%`), like(resources.description, `%${q}%`)));
    }

    if (types.length > 0) {
        // Simple OR for types. In a real app with exact string matching this is cleaner.
        // Since seed has "Article", "Code Snippet", we need to match carefully or use ILIKE/lower (sqlite 'like' is case insens usually)
        const typeFilters = types.map(t => like(resources.type, `%${t}%`));
        filters.push(or(...typeFilters));
    }

    if (tags.length > 0) {
        const tagFilters = tags.map(t => like(resources.tags, `%${t}%`));
        filters.push(or(...tagFilters));
    }

    // Apply all filters with AND
    if (filters.length > 0) {
        // @ts-ignore - drizzle dynamic query types can be tricky
        query = query.where(and(...filters));
    }

    const result = await query;

    // Transform for UI (parse tags)
    const formattedResources: Resource[] = result.map(r => ({
        ...r,
        tags: JSON.parse(r.tags),
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
        authorId: r.authorId ?? 0 // Handle nullable authorId
    }));

    return { userEmail, resources: formattedResources, q };
}

export async function action({ request }: Route.ActionArgs) {
    // Logout action handled in Header normally, but if we need dashboard specific actions:
    const formData = await request.formData();
    // Stub for future
    return null;
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    const { userEmail, resources, q } = loaderData;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-black font-sans">
            <Header userEmail={userEmail} onMenuClick={() => setIsMobileMenuOpen(true)} />

            <div className="flex flex-1 container mx-auto px-6 gap-12 relative">
                {/* Desktop Sidebar */}
                <Sidebar className="hidden lg:block" />

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold">Filters</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <Sidebar />
                        </div>
                    </div>
                )}

                <main className="flex-1 py-8 space-y-8">
                    <section className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">Discover Resources</h1>
                        <p className="text-gray-500 max-w-2xl">
                            Explore shared knowledge from our community
                        </p>

                        <div className="relative">
                            <Form>
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={q || ""}
                                    placeholder="Search resource..."
                                    className="w-full h-12 rounded-lg border border-gray-200 pl-12 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                />
                                {/* Preserve filters on search */}
                            </Form>
                        </div>
                    </section>

                    <section>
                        <div className="mb-4 text-sm text-gray-500 font-medium">
                            {resources.length} resources found
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {resources.map(resource => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>

                        {resources.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                No resources found matching your criteria.
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
