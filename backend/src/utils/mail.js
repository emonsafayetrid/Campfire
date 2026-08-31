import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => { 
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "http://taskmanager.com",
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    // Updated process.env keys to match your .env file
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    });

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    };

    try {
        await transporter.sendMail(mail);
        console.log("Email sent successfully to Mailtrap");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const emailVerificationMailgenContent = (name, verificationUrl) => {
    return {
        body: {
            name: name,
            intro: "Welcome to our platform! Please verify your email address by clicking the button below:",
            action: {
                instructions: "Click the button below to verify your email:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verificationUrl
                }
            },
            outro: "If you did not create an account, please ignore this email."
        }
    };
};

const forgotPasswordMailgenContent = (name, passwordResetUrl) => {
    return {
        body: {
            name: name,
            intro: "You have requested to reset your password. Please click the button below to proceed:",
            action: {
                instructions: "Click the button below to reset your password:",
                button: {
                    color: "#FF6F61",
                    text: "Reset Password",
                    link: passwordResetUrl
                }
            },
            outro: "If you did not request a password reset, please ignore this email."
        }
    };
};

export { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent };