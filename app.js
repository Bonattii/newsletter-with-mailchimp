import path from 'path';
import { fileURLToPath } from 'url';

import bodyParser from 'body-parser';
import express from 'express';
import https from 'https';
import dotenv from 'dotenv';

// When is a module we need this imports to __dirname actually work
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// It allows to get informations from the body
app.use(bodyParser.urlencoded({ extended: true }));

// Allow the static files to work
app.use(express.static(__dirname + '/public/'));

// GET https://localhost:3000/
app.get('/', (req, res) => {
  // Just send the html file
  res.sendFile(`${__dirname}/public/signup.html`);
});

// POST https://localhost:3000/
app.post('/', (req, res) => {
  // Handle the user information and create an onject for that
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);

  // Handle the api configuration
  const mailchimpApiKey = process.env.apiKey;
  const mailchimpAudienceKey = process.env.audienceKey;
  const url = `https://us13.api.mailchimp.com/3.0/lists/${mailchimpAudienceKey}`;
  const options = {
    method: 'POST',
    auth: `rodrigo:${mailchimpApiKey}`
  };

  // Handle the api post request
  const request = https.request(url, options, response => {
    // Render the success or failure pages
    if (response.statusCode === 200) {
      res.sendFile(`${__dirname}/public/success.html`);
    } else {
      res.sendFile(`${__dirname}/public/failure.html`);
    }

    response.on('data', data => {
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
});

// POST https://localhost:3000/failure
app.post('/failure', (req, res) => {
  res.redirect('/');
});

// Getting app ready for Vercel with process.env.PORT
app.listen(process.env.PORT || 3000, () =>
  console.log('Server running on port 3000.')
);

export default app;
