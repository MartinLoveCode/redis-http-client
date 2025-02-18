require("dotenv").config()
const express = require('express')
const app = express()
const {createClient} = require('redis');

async function bootStrap() {

    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));

    const client = createClient({
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT
        }
    });
    
    client.on('error', err => console.log('Redis Client Error', err));
    
    await client.connect();

    app.get('/:cluster', async(req, res) => {
        try{
            const {cluster} = req.params;
            console.log(
                cluster
            )
            const result = await client.hGetAll(cluster);
    
            res.send(result);
        }catch(error){
            console.log(error);
            res.status(400);
            res.send(error.message)
        }
    })

    app.get('/:cluster/:key', async(req, res) => {
        try{
            const {cluster, key} = req.params;
            console.log(
                cluster, key
            )
            const result = await client.hGet(cluster, key);
    
            res.send(result);
        }catch(error){
            console.log(error);
            res.status(400);
            res.send(error.message)
        }
    })


    app.post('/:cluster', async(req, res) => {
        try{
            console.log(req.params);
            const {cluster} = req.params;
            const value = req.body;
            await client.hSet(cluster, value);
            res.send('SET!')
        }catch(error){
            res.status(400);
            res.send(error.message)
        }
    })

    
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
}

bootStrap()