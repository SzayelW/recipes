import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/dashboard.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("my-posts", "routes/my-posts.tsx"),
    route("profile", "routes/profile.tsx"),
    route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
