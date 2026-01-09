import type { Route } from "./+types/dashboard";
import { Form, redirect, useLoaderData, useNavigation } from "react-router";
import { getSession, destroySession } from "../sessions";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { resources } from "../db/schema";
import { eq, like, and, or } from "drizzle-orm";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { ResourceCard, type Resource } from "../components/ResourceCard";
import { ResourceForm } from "../components/ResourceForm";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

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
    let userId = 0;
    try {
        const payload = jwt.verify(token, process.env.SESSION_SECRET || "s3cr3t") as { email: string, userId: number };
        userEmail = payload.email;
        userId = payload.userId;
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
        const typeFilters = types.map(t => like(resources.type, `%${t}%`));
        filters.push(or(...typeFilters));
    }

    if (tags.length > 0) {
        const tagFilters = tags.map(t => like(resources.tags, `%${t}%`));
        filters.push(or(...tagFilters));
    }

    if (filters.length > 0) {
        // @ts-ignore
        query = query.where(and(...filters));
    }

    const result = await query;

    const formattedResources: Resource[] = result.map(r => ({
        ...r,
        tags: JSON.parse(r.tags),
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
        authorId: r.authorId ?? 0,
        codeSnippet: r.codeSnippet
    }));

    return { userEmail, userId, resources: formattedResources, q };
}

export async function action({ request }: Route.ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");
    if (!token) return redirect("/login");

    let userId = 0;
    try {
        const payload = jwt.verify(token, process.env.SESSION_SECRET || "s3cr3t") as { userId: number };
        userId = payload.userId;
    } catch {
        return redirect("/login");
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
        const id = parseInt(formData.get("id") as string);
        if (id) {
            await db.delete(resources).where(eq(resources.id, id));
        }
        return null;
    }

    if (intent === "create" || intent === "update") {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const type = formData.get("type") as string;
        const tags = formData.get("tags") as string; // JSON string
        const link = (formData.get("link") as string) || "#";
        const codeSnippet = (formData.get("code_snippet") as string) || null;

        const data = {
            title,
            description,
            type,
            tags,
            link,
            codeSnippet,
            authorId: userId
        };

        if (intent === "create") {
            await db.insert(resources).values(data);
        } else {
            const id = parseInt(formData.get("id") as string);
            if (id) {
                await db.update(resources).set(data).where(eq(resources.id, id));
            }
        }
    }

    return null;
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    const { userEmail, resources, q } = loaderData;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);

    // Delete Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);

    const navigation = useNavigation();

    // Close form/dialog on successful navigation (submission)
    useEffect(() => {
        if (navigation.state === "loading") {
            if (isFormOpen) {
                setIsFormOpen(false);
                setEditingResource(null);
            }
            if (isDeleteDialogOpen) {
                setIsDeleteDialogOpen(false);
                setResourceToDelete(null);
            }
        }
    }, [navigation.state]);

    const handleShareClick = () => {
        setEditingResource(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (resource: Resource) => {
        setEditingResource(resource);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setResourceToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingResource(null);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-black font-sans relative">
            <Header
                userEmail={userEmail}
                onMenuClick={() => setIsMobileMenuOpen(true)}
                onShareClick={handleShareClick}
            />

            <ResourceForm
                isOpen={isFormOpen}
                onClose={closeForm}
                initialData={editingResource}
            />

            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                resourceId={resourceToDelete}
            />

            <div className="flex flex-1 container mx-auto px-6 gap-12 relative overflow-hidden">
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

                <main className="flex-1 flex flex-col h-full overflow-hidden py-8">
                    <section className="space-y-4 shrink-0 mb-6">
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

                    <div className="mb-4 text-sm text-gray-500 font-medium shrink-0">
                        {resources.length} resources found
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {resources.map(resource => (
                                <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>

                        {resources.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                No resources found matching your criteria.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
