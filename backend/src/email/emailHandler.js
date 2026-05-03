import { resendClient, sender } from "../utils/resend.js"
import { createWelcomeEmailTemplate, createVerificationEmailTemplate } from "./emailTemplate.js"


export const sendWelcomeEmail = async (email, name, clientURL) => {
    const { data, error } = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to Bitchat ",
        html: createWelcomeEmailTemplate(name, clientURL)
    });

    if (error) {
        console.error("Error sending welcome email", error);
        throw new Error("Failed to send welcome email");
    }

    console.log("Welcome email sent successfully", data);
};

export const sendVerificationEmail = async (email, name, verificationURL) => {
    const { data, error } = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Verify your Bitchat account ",
        html: createVerificationEmailTemplate(name, verificationURL)
    });
 
    if (error) {
        console.error("Error sending verification email", error);
        throw new Error("Failed to send verification email");
    }
 
    console.log("Verification email sent to", email, data);
};