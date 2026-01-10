import type { Route } from "./+types/my-posts";
import { Form, redirect, useLoaderData, useNavigation, Link } from "react-router";
import { getSession, destroySession } from "../sessions.server";
import jwt from "jsonwebtoken";
import { db } from "../db/index.server";
import { resources } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { Header } from "../components/Header";
import { ResourceCard, type Resource } from "../components/ResourceCard";
import { ResourceForm } from "../components/ResourceForm";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { useState, useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "My Posts - Method Knowledge Hub" }];
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

    // Fetch User's Resources
    const result = await db.select().from(resources).where(eq(resources.authorId, userId)).orderBy(desc(resources.createdAt));

    const formattedResources: Resource[] = result.map(r => ({
        ...r,
        tags: JSON.parse(r.tags),
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
        authorId: r.authorId ?? 0,
        codeSnippet: r.codeSnippet
    }));

    return { userEmail, userId, resources: formattedResources };
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
            // Verify ownership
            const resource = await db.select().from(resources).where(eq(resources.id, id)).get();
            if (resource && resource.authorId === userId) {
                await db.delete(resources).where(eq(resources.id, id));
            }
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
                // Verify ownership for update
                const resource = await db.select().from(resources).where(eq(resources.id, id)).get();
                if (resource && resource.authorId === userId) {
                    await db.update(resources).set(data).where(eq(resources.id, id));
                }
            }
        }
    }

    return null;
}

export default function MyPosts({ loaderData }: Route.ComponentProps) {
    const { userEmail, resources } = loaderData;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);

    const navigation = useNavigation();

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

            <div className="flex flex-1 container mx-auto px-6 py-8 overflow-hidden flex-col items-center">
                <div className="w-full max-w-4xl flex-1 flex flex-col overflow-hidden">
                    <div className="mb-8 shrink-0 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">My Posts</h1>
                            <p className="text-gray-500">Manage your shared resources</p>
                        </div>
                        <Link to="/" className="text-sm font-semibold text-gray-900 hover:underline">
                            ← Back to Dashboard
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 pb-20">
                        {resources.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <p className="mb-4">You haven't posted any resources yet.</p>
                                <button
                                    onClick={handleShareClick}
                                    className="text-black font-semibold hover:underline"
                                >
                                    Share your first resource
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {resources.map(resource => (
                                    <ResourceCard
                                        key={resource.id}
                                        resource={resource}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
