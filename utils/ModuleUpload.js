import Mailgen from "mailgen";
import nodemailer from "nodemailer";

export const uploadModuleEmail = async (email1, name, line) => {
    const transporter = nodemailer.createTransport({
        port:587,
        host:"smtp.gmail.com",
        secure: false,
        auth: {
            // 
            user: process.env.SERVICE,
            pass: process.env.ApplicationPassword,
        },
    });
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Acceslerator",
            link: "www.accelerator.com",
        },
        header: {
            title: "Yours truly",
            imageUrl: "https://example.com/logo.png", // Replace with your logo image URL
        },
        footer: {
            name: "Hi",
            title: "Accelerator",
            imageUrl: "https://example.com/signature.png",
        },
    });

    const email = {
        body: {
            name: name,
            intro: `New Module ${line} is Uploaded`,
        },
    };

    const emailBody = mailGenerator.generate(email);

    const mailOptions = {
        from: process.env.SERVICE,
        to: email1,
        subject: "Accelerator: New Module Uploaded",
        html: emailBody,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent successfully:", info.response);
        }
    });
};
