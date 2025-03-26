require("dotenv").config()
const express = require('express')
const app = express()
const { createClient } = require('redis');

async function bootStrap() {

  app.use(express.json({ limit: '500mb', parameterLimit: 1000000 }));

  app.use(express.urlencoded({ extended: true, limit: '500mb', parameterLimit: 100000000000 }));

  const client = createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT
    }
  });

  client.on('error', err => console.log('Redis Client Error', err));

  const mode = process.env.MODE || 'RAM';
  let ramCache = {};

  if (mode === 'REDIS') {
    await client.connect();
    console.log("Webdis is started on REDIS mode")
  } else {
    console.log("Webdis is started on RAM mode")
  }




  app.get('/:cluster', async (req, res) => {
    try {
      const { cluster } = req.params;

      if (mode === 'RAM') {
        res.send(ramCache[cluster]);
      }

      const result = await client.hGetAll(cluster);
      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(400);
      res.send(error.message)
    }
  })

  app.get('/hScan/:cluster/:key', async (req, res) => {

    try {
      const { cluster, key } = req.params;
      if (mode !== 'REDIS') {
        throw new Error("This api only support on Redis mode")
      }

      let cursor = '0';
      let results = await client.hScan(cluster, cursor, {
        MATCH: key,
        COUNT: 100000000000
      })

      res.send(results.tuples);
    } catch (error) {
      console.log(error);
      res.status(400);
      res.send(error.message)
    }
  })

  app.get('/:cluster/:key', async (req, res) => {
    try {
      const { cluster, key } = req.params;
      if (mode === 'RAM') {
        if (!ramCache[cluster]) {
          res.send(null);
        } else {
          res.send(ramCache[cluster][key]);
        }
        return;
      }
      const result = await client.hGet(cluster, key);

      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(400);
      res.send(error.message)
    }
  })

  app.post('/command', async (req, res) => {
    try {
      const { command, parameters } = req.body;
      if (!command) throw new Error("Unknown command");

      if (mode !== 'REDIS') {
        throw new Error("This api only working on REDIS mode")
      }

      const result = await client[command](...parameters);
      res.send(result)
    } catch (error) {
      res.status(400);
      res.send(error.message)
    }
  })
  app.post('/:cluster', async (req, res) => {
    try {
      const { cluster } = req.params;
      const { body } = req;
      if (mode === 'RAM') {
        ramCache[cluster] = body;
        res.send('SET!')
        return;
      }
      await client.hSet(cluster, body);
      res.send('SET!')
    } catch (error) {
      console.error(error)
      res.status(400);
      res.send(error.message)
    }
  })



  const port = +process.env.PORT;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

bootStrap()
