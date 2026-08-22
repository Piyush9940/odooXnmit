import { Resend } from "resend";

const connectResend = () => {
    try {
        const { RESEND_API_KEY } = process.env;

        if (!RESEND_API_KEY) {
            throw new Error(
                "RESEND_API_KEY is not defined in environment variables"
            );
        }

        const resend = new Resend(RESEND_API_KEY);

        console.log("Resend configured successfully");

        return resend;
    } catch (error) {
        console.error(
            "Resend configuration failed:",
            error.message
        );

        process.exit(1);
    }
};

export default connectResend;