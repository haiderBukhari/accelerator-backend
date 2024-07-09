import Mailgen from "mailgen";
import nodemailer from "nodemailer";

export const SendEmail = (email1, name, otp) => {
    const transporter = nodemailer.createTransport({
        port:587,
        host:"smtp.gmail.com",
        secure: false,
        auth: {
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
            imageUrl: "https://example.com/signature.png", // Replace with your signature image URL
        },
    });

    const email = {
        body: {
            name: name,
            intro: `Otp for your application is ${otp}`,
        },
    };

    const emailBody = mailGenerator.generate(email);

    const mailOptions = {
        from: process.env.SERVICE,
        to: email1,
        subject: "Accelerator Application verification OTP",
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
