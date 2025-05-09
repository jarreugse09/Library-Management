const nodemailer = require('nodemailer');

const sendEmail = option => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'Library OTP <library-access-guide@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.text,
    html: `
        <div style="
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 10px;
            border: 1px solid #ccc;
            text-align: center;
            max-width: 400px;
            margin: auto;
        ">
            <h2 style="color: #333;">Your OTP Code</h2>
            <div style="
                font-size: 32px;
                font-weight: bold;
                background-color: #fff;
                border: 2px dashed #4CAF50;
                padding: 15px 0;
                margin: 20px 0;
                border-radius: 8px;
                color: #4CAF50;
            ">
                ${option.otp}
            </div>
            <p>This OTP is valid for 3 minutes. Do not share it with anyone.</p>
        </div>
    `,
  };

  transporter.sendMail(mailOptions);
};

const sendEmailReset = async option => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'Library OTP <library-access-guide@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, sendEmailReset };
