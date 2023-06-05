const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@simple-crud-server.g8zjk15.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const serviceCollection = client.db('DoctorPortal').collection('services');
        const bookingCollection = client.db('DoctorPortal').collection('bookings');


        // SERVICES 

        app.get('/services', async (req, res) => {
            const result = await serviceCollection.find().toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(quary);
            res.send(result);
        })


        app.post('/services', async (req, res) => {
            const service = req.body;
            // console.log(service)
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })


        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const updatedService = req.body;

            const updatedDoc = {
                $set: {
                    name: updatedService.name,
                    category: updatedService.category,
                    price: updatedService.price,
                    photo: updatedService.photo,
                }
            }

            const options = { upsert: true }

            const result = await serviceCollection.updateOne(quary, updatedDoc, options)
            res.send(result)
        })


        // bookings

        app.get('/bookings', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.findOne(query)
            res.send(result)
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: { status: update.status }
            }
            const result = await bookingCollection.updateOne(query, updatedDoc)
            res.send(result)

        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result)

        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
});

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})