import dotenv from "dotenv";

process.env.NODE_ENV = "test";

dotenv.config({
    path: new URL("../.env", import.meta.url),
    quiet: true
});

process.env.FRONTEND_URL ??= process.env.CLIENT_URL || "http://localhost:3000";
