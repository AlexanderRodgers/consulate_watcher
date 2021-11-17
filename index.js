const mailer = require("./mailer");
const axios = require("axios");
const fs = require("fs");

const consulateDecember =
  "https://app.bookitit.com/onlinebookings/datetime/?callback=jQuery21104033592750694892_1637092123650&type=default&publickey=275f65e80ce06aaf5cd24cebd11311897&lang=en&services%5B%5D=bkt276859&agendas%5B%5D=bkt128898&version=12&src=https%3A%2F%2Fapp.bookitit.com%2Fen%2Fhosteds%2Fwidgetdefault%2F275f65e80ce06aaf5cd24cebd11311897&srvsrc=https%3A%2F%2Fapp.bookitit.com&start=2021-12-01&end=2021-12-30&selectedPeople=1&_=1637092123654";
const consulateNovember =
  "https://app.bookitit.com/onlinebookings/datetime/?callback=jQuery21104033592750694892_1637092123650&type=default&publickey=275f65e80ce06aaf5cd24cebd11311897&lang=en&services%5B%5D=bkt276859&agendas%5B%5D=bkt128898&version=12&src=https%3A%2F%2Fapp.bookitit.com%2Fen%2Fhosteds%2Fwidgetdefault%2F275f65e80ce06aaf5cd24cebd11311897&srvsrc=https%3A%2F%2Fapp.bookitit.com&start=2021-11-01&end=2021-11-30&selectedPeople=1&_=1637092123654";

const isObject = (maybeObj) => {
  return maybeObj.constructor.name === "Object";
};

const parseConsulateString = (dataString) => {
  const firstVal = dataString.indexOf("{");
  const lastVal = dataString.lastIndexOf("}");
  return JSON.parse(dataString.substring(firstVal, lastVal + 1));
};

const getAvailableTimes = async () => {
  const res = await axios.get(consulateDecember);
  const decemberString = res.data;
  const res2 = await axios.get(consulateNovember);
  const novemberString = res2.data;

  dJson = parseConsulateString(decemberString);
  nJson = parseConsulateString(novemberString);
  return nJson["Slots"].concat(dJson["Slots"]);
};

const createDateString = (dateStr) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  options.timeZone = "UTC";
  return new Date(dateStr).toLocaleDateString("en-US", options);
};

const findTimes = async () => {
  let times = await getAvailableTimes();
  const availableDates = [];
  times.forEach((time) => {
    const availableTimes = time?.times;
    // if availableTimes is an object then there are times in the object.
    if (isObject(availableTimes)) {
      const newDate = {
        date: createDateString(time["date"]),
        times: [],
      };
      for (const [time, idk] of Object.entries(availableTimes)) {
        newDate["times"].push(time);
      }
      availableDates.push(newDate);
    }
  });
  console.log(availableDates);
  return availableDates;
};

const mailTimes = async () => {
  const options = {
    subject: "",
    text: "",
  };
  const times = await findTimes();
  let text = "Available Times:\n";
  if (!times.length) {
    return;
  }
  const availDate = times[0]["date"];
  const subjectStr = `New Consulate Appointment: ${availDate}`;
  options.subject = subjectStr;

  for (let time of times) {
    text += `Date: ${time["date"]}\n`;
    for (let hour of time["times"]) {
      text += `${hour}\n`;
    }
    text += "\n";
  }
  options.text = text;
  mailer.sendMail(options);
};

mailTimes();
