import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT}`
            );

            console.log(
                `Environment: ${
                    process.env.NODE_ENV || "development"
                }`
            );
        });

        const shutdown = async (signal) => {
            console.log(
                `${signal} received. Shutting down server...`
            );

            server.close(async () => {
                console.log(
                    "HTTP server closed."
                );

                process.exit(0);
            });
        };

        process.on(
            "SIGTERM",
            () => shutdown("SIGTERM")
        );

        process.on(
            "SIGINT",
            () => shutdown("SIGINT")
        );
    } catch (error) {
        console.error(
            "Failed to start server:",
            error.message
        );

        process.exit(1);
    }
};

startServer();