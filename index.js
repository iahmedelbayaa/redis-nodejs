import express from 'express';
import axios from 'axios';
import cors from 'cors';
import redis from 'redis';

const app = express();
const client = redis.createClient(); // Creating an instance of Redis client
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/photos', async (req, res) => {
    client.get('photos', async (err, photos) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        if (photos) {
            return res.json(JSON.parse(photos));
        } else {
            try {
                const { data } = await axios.get('https://jsonplaceholder.typicode.com/photos');
                client.setex('photos', 3600, JSON.stringify(data));
                return res.json(data);
            } catch (error) {
                console.error(error);
                return res.status(500).send(error);
            }
        }
    });
});

app.get('/photos/:id', async (req, res) => {
    client.get(`photos:${req.params.id}`, async (err, photo) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        if (photo) {
            return res.json(JSON.parse(photo));
        }
        try {
            const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`);
            client.setex(`photos:${req.params.id}`, 3600, JSON.stringify(data));
            return res.json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).send(error);
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
