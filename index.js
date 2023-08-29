require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const url = require('url');
const bodyparser = require('body-parser');
const { MongoClient } = require('mongodb')
// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env['CONNECTION'])
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

async function main() {
  await client.connect().then(() => { console.log("connected") })
}
main()
// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  const parsedurl=url.parse(req.body.url,true).hostname
  dns.lookup(parsedurl,async (err,value) => {
    if (err|| value == null)
      res.json({ error: 'invalid url' });
    else
    {
      const count=await client.db("data").collection('freecode').countDocuments({})
      const insert=await client.db('data').collection('freecode').insertOne({
        original_url:req.body.url,
        short_url:count
      })
      res.json({
        original_url:req.body.url,
        short_url:count
      })
    }
  })
});

app.get('/api/shorturl/:num',async (req,res)=>{
  const number=parseInt(req.params.num)
  const query=await client.db('data').collection('freecode').find({short_url:number}).toArray()
  if(JSON.stringify(query)==JSON.stringify([]))
  {
    res.send("it seems such a shorturl hasn't been made till now")
  }
  else
  {
    const responseurl=await client.db('data').collection('freecode').find({short_url:number}).toArray();
    const fetch=responseurl[0].original_url
    res.redirect(fetch)
  }
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
