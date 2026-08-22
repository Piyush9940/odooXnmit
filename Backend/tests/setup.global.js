import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";
import path from "path";
import { fileURLToPath } from "url";

let mongoServer;
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const downloadDir = path.join(testDirectory, ".mongodb-binaries");

jest.unstable_mockModule("../config/resend.js", () => ({
    default: {
        emails: {
            send: jest.fn().mockResolvedValue({
                data: { id: "test-email" },
                error: null
            })
        }
    }
}));

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
        binary: { downloadDir }
    });

    await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
}, 30000);
