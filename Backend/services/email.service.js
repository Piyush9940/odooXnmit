import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import resend from "../config/resend.js";

/*
|--------------------------------------------------------------------------
| Path Configuration
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMAIL_TEMPLATE_PATH = path.join(
    __dirname,
    "../templates/email"
);

/*
|--------------------------------------------------------------------------
| Environment Validation
|--------------------------------------------------------------------------
*/

const FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL;

if (!FROM_EMAIL) {
    console.warn(
        "WARNING: RESEND_FROM_EMAIL is not configured"
    );
}

/*
|--------------------------------------------------------------------------
| Load Email Template
|--------------------------------------------------------------------------
*/

const loadTemplate = async (
    templateName,
    variables = {}
) => {
    if (!templateName) {
        throw new Error(
            "Email template name is required"
        );
    }

    const templatePath = path.join(
        EMAIL_TEMPLATE_PATH,
        templateName
    );

    let html;

    try {
        html = await fs.readFile(
            templatePath,
            "utf-8"
        );
    } catch (error) {
        throw new Error(
            `Email template not found: ${templateName}`
        );
    }

    /*
     * Replace template variables.
     *
     * Example:
     * {{name}}
     * {{employeeId}}
     * {{message}}
     */
    for (
        const [key, value] of Object.entries(
            variables
        )
    ) {
        const regex = new RegExp(
            `{{\\s*${key}\\s*}}`,
            "g"
        );

        html = html.replace(
            regex,
            value ?? ""
        );
    }

    return html;
};

/*
|--------------------------------------------------------------------------
| Send Email
|--------------------------------------------------------------------------
*/

const sendEmail = async ({
    to,
    subject,
    template,
    variables = {},
    html,
    attachments = []
}) => {
    if (!to) {
        throw new Error(
            "Recipient email is required"
        );
    }

    if (!subject) {
        throw new Error(
            "Email subject is required"
        );
    }

    if (!template && !html) {
        throw new Error(
            "Email template or HTML content is required"
        );
    }

    if (!FROM_EMAIL) {
        throw new Error(
            "RESEND_FROM_EMAIL is not configured"
        );
    }

    let emailHtml = html;

    if (template) {
        emailHtml = await loadTemplate(
            template,
            variables
        );
    }

    try {
        const response =
            await resend.emails.send({
                from: FROM_EMAIL,
                to: Array.isArray(to)
                    ? to
                    : [to],
                subject,
                html: emailHtml,
                attachments
            });

        if (response?.error) {
            throw new Error(
                response.error.message ||
                "Resend failed to send email"
            );
        }

        return {
            success: true,
            id: response?.data?.id || null
        };
    } catch (error) {
        console.error(
            "Email sending failed:",
            error
        );

        throw new Error(
            `Failed to send email: ${error.message}`
        );
    }
};

/*
|--------------------------------------------------------------------------
| Verify Email
|--------------------------------------------------------------------------
*/

const sendVerificationEmail = async ({
    email,
    name,
    verificationUrl
}) => {
    return sendEmail({
        to: email,

        subject:
            "Verify your Dayflow account",

        template:
            "verify-email.html",

        variables: {
            name,
            verificationUrl
        }
    });
};

/*
|--------------------------------------------------------------------------
| Welcome Email
|--------------------------------------------------------------------------
*/

const sendWelcomeEmail = async ({
    email,
    name,
    employeeId
}) => {
    return sendEmail({
        to: email,

        subject:
            "Welcome to Dayflow",

        template:
            "welcome.html",

        variables: {
            name,
            employeeId
        }
    });
};

/*
|--------------------------------------------------------------------------
| Password Reset Email
|--------------------------------------------------------------------------
*/

const sendPasswordResetEmail = async ({
    email,
    name,
    resetUrl
}) => {
    return sendEmail({
        to: email,

        subject:
            "Reset your Dayflow password",

        template:
            "reset-password.html",

        variables: {
            name,
            resetUrl
        }
    });
};

/*
|--------------------------------------------------------------------------
| Leave Approved Email
|--------------------------------------------------------------------------
*/

const sendLeaveApprovedEmail = async ({
    email,
    name,
    leaveType,
    startDate,
    endDate,
    totalDays,
    adminComment
}) => {
    return sendEmail({
        to: email,

        subject:
            "Your Dayflow leave request has been approved",

        template:
            "leave-approved.html",

        variables: {
            name,
            leaveType,
            startDate,
            endDate,
            totalDays,
            adminComment
        }
    });
};

/*
|--------------------------------------------------------------------------
| Leave Rejected Email
|--------------------------------------------------------------------------
*/

const sendLeaveRejectedEmail = async ({
    email,
    name,
    leaveType,
    startDate,
    endDate,
    totalDays,
    adminComment
}) => {
    return sendEmail({
        to: email,

        subject:
            "Your Dayflow leave request has been rejected",

        template:
            "leave-rejected.html",

        variables: {
            name,
            leaveType,
            startDate,
            endDate,
            totalDays,
            adminComment
        }
    });
};

/*
|--------------------------------------------------------------------------
| Salary Slip Email
|--------------------------------------------------------------------------
*/

const sendSalarySlipEmail = async ({
    email,
    name,
    employeeId,
    month,
    year,
    netSalary,
    salarySlipUrl
}) => {
    return sendEmail({
        to: email,

        subject:
            `Dayflow Salary Slip - ${month}/${year}`,

        template:
            "salary-slip.html",

        variables: {
            name,
            employeeId,
            month,
            year,
            netSalary,
            salarySlipUrl
        }
    });
};

/*
|--------------------------------------------------------------------------
| Admin Notification Email
|--------------------------------------------------------------------------
|
| Admin can send a custom notification to
| an employee through the notification service.
|
*/

const sendNotificationEmail = async ({
    email,
    name,
    title,
    message
}) => {
    /*
     * Notification emails intentionally use
     * generated HTML instead of requiring a
     * separate template for every notification.
     */

    const safeName =
        String(name || "Employee");

    const safeTitle =
        String(title || "Dayflow Notification");

    const safeMessage =
        String(message || "");

    return sendEmail({
        to: email,

        subject: safeTitle,

        html: `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    />
                    <title>${safeTitle}</title>
                </head>

                <body
                    style="
                        margin: 0;
                        padding: 0;
                        background: #f5f7fb;
                        font-family: Arial, sans-serif;
                    "
                >
                    <div
                        style="
                            max-width: 600px;
                            margin: 40px auto;
                            background: #ffffff;
                            padding: 30px;
                            border-radius: 10px;
                        "
                    >
                        <h2>
                            ${safeTitle}
                        </h2>

                        <p>
                            Hello ${safeName},
                        </p>

                        <p>
                            ${safeMessage}
                        </p>

                        <hr />

                        <p
                            style="
                                color: #777;
                                font-size: 13px;
                            "
                        >
                            This notification was sent
                            through Dayflow HRMS.
                        </p>
                    </div>
                </body>
            </html>
        `
    });
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    sendEmail,

    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,

    sendLeaveApprovedEmail,
    sendLeaveRejectedEmail,

    sendSalarySlipEmail,

    sendNotificationEmail
};