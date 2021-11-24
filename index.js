const mailer = require("./mailer");
const axios = require("axios");
const fs = require("fs");
const cron = require("node-cron");

let prev = null;
let curr = null;
let err = null;
let prevErr = null;
let ranErrMailer = false;

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

const calculateTime = (time) => {
  const timeInt = parseInt(time);
  const hour = Math.floor(timeInt / 60);
  let minutes = timeInt % 60;
  let minuteString = minutes === 0 ? `${minutes}` + `0` : `${minutes}`;
  return `${hour}:${minuteString}`;
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
        newDate["times"].push(calculateTime(time));
      }
      availableDates.push(newDate);
    }
  });
  return availableDates;
};

const mailTimes = async () => {
  const options = {
    subject: "",
    html: "",
  };
  const times = await findTimes();
  let html = "<html><h2>New Consulate Appointment: </h2>";
  if (!times.length) {
    return [[], options];
  }
  const availDate = times[0]["date"];
  const subjectStr = `New Consulate Appointment: ${availDate}`;
  options.subject = subjectStr;

  for (let time of times) {
    html += `<p><b> Date: ${time["date"]}</b></br>`;
    for (let hour of time["times"]) {
      html += `${hour}</br>`;
    }
    html += "</p>";
    html += "<a href=\"https://app.bookitit.com/en/hosteds/widgetdefault/275f65e80ce06aaf5cd24cebd11311897#services\">Click here to visit the consulate website</a></html>";
  }
  options.html = html;
  return [times, options];
};

const prettyDate = () => {
  var date = new Date();
  var localeSpecificTime = date.toLocaleTimeString();
  return localeSpecificTime.replace(/:\d+ /, " ");
};

const areTheSame = (p, c) => {
  if (c === null) return true;
  // A comparer used to determine if two entries are equal.
  const sameTimes = (a, b) => a.date === b.date;

  // Get items that only occur in the left array,
  // using the compareFunction to determine equality.
  const onlyInLeft = (left, right, compareFunction) =>
    left?.filter(
      (leftValue) =>
        !right?.some((rightValue) => compareFunction(leftValue, rightValue))
    );

  const prevDiff = onlyInLeft(p, c, sameTimes);
  if (prevDiff?.length) return false;
  const currDiff = onlyInLeft(c, p, sameTimes);
  if (currDiff?.length) return false;
  return true;
};

cron.schedule("0-59 * * * *", () => {
  let options = null;
  (async () => {
    console.log(`Checking Appointments: ${prettyDate()}`);
    try {
  [curr, options] = await mailTimes();
    if (curr.length && !areTheSame(prev, curr)) {
      mailer.sendMail(options);
    } 
    prev = [...curr];
    } catch (e) {
      err = e;
      if (!ranErrMailer) {
        mailer.sendMail({
          subject: 'Consulate Mailer has broken',
          text: e.toString()
        });
      }
      prevErr = e;
      ranErrMailer = true;
    }
  })();
});

cron.schedule("0 8,20 * * *", () => {
  console.log('Mailer is running!');
  mailer.sendMail({
    subject: "I'm still looking out for you!",
    text: "Hi, I'm just notifying you that I'm still looking for appointments for you. Make sure that you receive 2 emails a day because I might break and stop checking without notifying you. Contact alexedrodgers@gmail.com if you want to stop receiving emails. Thanks!",
  });
});

mailer.sendMail({
  subject: 'Consulate Watcher has started.',
  text: `You've been added to the consulate watcher list. Process started at: ${new Date()}.`
});
