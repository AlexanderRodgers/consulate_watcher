const nodemailer = require("nodemailer");
// const emails = ["alexedrodgers@gmail.com", "sagemgrothee@gmail.com", "arellanolilly7702@gmail.com"];
const emails = ["alexedrodgers@gmail.com", "aerodger@calpoly.edu", "alex.e.rodgers@gmail.com"];

const isObjectEmpty = (obj) => {
  return obj && Object.keys(obj).length !== 0;
};

exports.sendMail = (options) => {
  transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "spainconsulatewatcher@outlook.com",
      pass: "@>3Q/Xk`tvy(D-gs",
    },
  });
  if (options === undefined) {
    options = {
      from: "Consulate <spainconsulatewatcher@outlook.com>",
      to: "alexedrodgers@gmail.com",
      subject: "Test",
      text: "Testing email service.",
    };
  } else {
    options.from = "spainconsulatewatcher@outlook.com";
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
