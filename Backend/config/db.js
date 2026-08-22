import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        console.log("Connecting to MongoDB...");
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 4000,
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.warn("Primary MongoDB connection timed out / failed:", error.message);
        console.log("Attempting fallback connection...");

        try {
            const localUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/dayflow";
            const localConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
            console.log(`Fallback MongoDB connected: ${localConn.connection.host}`);
        } catch (localError) {
            try {
                const { MongoMemoryServer } = await import("mongodb-memory-server");
                const mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                const memConn = await mongoose.connect(uri);
                console.log(`In-Memory MongoDB server running & connected: ${memConn.connection.host}`);
            } catch (memError) {
                console.error("In-memory Mongo fallback error:", memError.message);
            }
        }
    }

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB runtime connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Error closing MongoDB connection:", error.message);
    }
};

export {
    connectDB,
    disconnectDB
};