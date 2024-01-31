import nodemailer from 'nodemailer';

const sendEmail = async (options) => {

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      service :process.env.SMTP_SERVICE,
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailOptions = {
      from:process.env.MY_MAIL,
      to:options.email,
      subject:options.subject,
      text:options.message
    };

    await transport.sendMail(emailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
};

export default sendEmail;
