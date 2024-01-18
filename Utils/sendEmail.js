import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // Use true for SSL, false for other ports like 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailOptions = {
      from: 'ashishsantani.it21@scet.ac.in',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transport.sendMail(emailOptions);

    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
