import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI is not defined in environment variables"
            );
        }

        const connection = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );

        mongoose.connection.on("error", (error) => {
            console.error(
                "MongoDB connection error:",
                error.message
            );
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected");
        });

    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();

        console.log("MongoDB connection closed");
    } catch (error) {
        console.error(
            "Error while closing MongoDB connection:",
            error.message
        );
    }
};

export {
    connectDB,
    disconnectDB
};