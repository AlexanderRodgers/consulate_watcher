const nodemailer = require("nodemailer");
const emails = ["testemail@gmail.com"];

const isObjectEmpty = (obj) => {
  return obj && Object.keys(obj).length !== 0;
};

exports.sendMail = (options) => {
  transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "<YOUR USERNAME>",
      pass: "<YOUR PASSWORD>",
    },
  });
  if (options === undefined) {
    options = {
      from: "Consulate <OUTLOOK_EMAIL@outlook.com>",
      to: "alexedrodgers@gmail.com",
      subject: "Test",
      text: "Testing email service.",
    };
  } else {
    options.from = "OUTLOOK_EMAIL@outlook.com";
    options.to = emails;
  }

  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(info.response);
  });
};
