import { createTransport } from "nodemailer";

const sendEmail = async (options) => {
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  })

  const emailOptions = {
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  await transport.sendMail(emailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};



export default sendEmail;

