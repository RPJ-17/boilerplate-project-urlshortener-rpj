import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890', 3);
const app = express();
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const shortUrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: String,
    required: true
  }
});
const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async (req, res) => {
  const urlData = req.body.url;
  const shortData = nanoid();

  if (urlData.startsWith('http')) {
    const record = new ShortUrl({
      original_url: urlData,
      short_url: shortData
    });
    await record.save();
    res.json({original_url: urlData, short_url: shortData});
  } else {
    res.json({error: 'invalid url'});
  }
});

app.get('/api/shorturl/:shortId', (req, res) => {
  ShortUrl.findOne({short_url: req.params.shortId}, (err, url) => {
    if (err) console.log(err);
    res.redirect(url.original_url);
  });
});

mongoose.connection.on('open', () => {
  app.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });
});


