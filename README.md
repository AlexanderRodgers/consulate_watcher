# LA Consulate Watcher
I created this repo when I was trying to get a Visa for Spain. Dealing with the Spanish consulate in Los Angeles is a huge pain. You have to wait every day at 12:00 PM to get an open visa appointment. If you don't get one at the time you want you need to wait for openings. However, the booking website that the LA consulate uses does not allow users to sign up to be notified for cancellations. That's what this repository is. 

To use this code do the following:

  1. Create an email with outlook (gmail blocks emails sent out by a bot)
  2. Update the fields in `mailer.js`
  3. Run this node process forever, it will check every minute if new consulate appointments are available and notify everyone who signed up to be notified.
