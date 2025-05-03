import { transporter } from "../config/nodemailer.js"
 
const mailOptions = {
    from: "your-email@gmail.com",  
    to: "recipient@example.com",   
    subject: "Test Email",         
    text: "Hello, this is a test email!", 
    html: "<b>Hello, this is a test email!</b>", 
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log("Email sent: " + info.response);
});
