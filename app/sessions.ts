import { createCookieSessionStorage } from "react-router";

export const { getSession, commitSession, destroySession } =
    createCookieSessionStorage({
        cookie: {
            name: "__session",
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secrets: [process.env.SESSION_SECRET || "s3cr3t"],
            secure: process.env.NODE_ENV === "production",
        },
    });
