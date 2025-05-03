import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS,  
    },
    secure: true
});

export {
    transporter
};
