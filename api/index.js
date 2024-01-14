import express from 'express';
import { config } from 'dotenv';
import { connect } from 'mongoose';
import { UserModel as User } from './models/User.js';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { WebSocketServer } from 'ws';
import { MessageModel as Message } from './models/Message.js';

const app = express();
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));

// Need to use in order to parse the json in the request body
app.use(express.json());
app.use(cookieParser());
config();

connect(process.env.MONGO_URL);
const JWT_SECRET = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);


app.get('/test', (req, res) => {
    res.json("testing successful");
});
app.get('/', (req, res) => {
    res.json("Root path");
});


app.post('/register', (req, res) => {
    const { username, password } = req.body;

    User.create({
        username: username,
        password: bcrypt.hashSync(password, bcryptSalt)
    })
        .then(userDetails => {
            // After Creating the user we want it to Sign it by auth via a JWT
            jwt.sign({ userId: userDetails._id, username: userDetails.username }, JWT_SECRET, {}, (err, token) => {
                if (err) throw err;

                res.cookie('token', token).status(201).json({
                    username: userDetails.username,
                    id: userDetails._id
                });
            });
            console.log("Created User ");
        })
        .catch(err => {
            console.log(err);
        });


});
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username })
        .then((foundUser) => {
            if (foundUser) {
                const isPassOk = bcrypt.compare(password, foundUser.password);
                if (isPassOk) {
                    jwt.sign({ userId: foundUser._id, username: username }, JWT_SECRET, {}, (err, token) => {
                        if (err) throw err;

                        res.cookie('token', token).json({
                            id: foundUser._id,
                            username: foundUser.username
                        });
                    });
                }
            }
            else {
                res.status(404).json("User not found");
            }
        })
        .catch((err) => {
            console.log("Error while Logging in", err);
        });
});


app.get('/allUsers', async (req, res) => {
    const users = await User.find({}, { '_id': 1, username: 1 });
    res.json(users);
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;

    if (token) {
        jwt.verify(token, JWT_SECRET, {}, (err, UserData) => {
            if (err) throw err;

            res.json(UserData);

        });
    }

    else {
        res.status(401).json("No token found");
    }
});

app.get('/messages/:userId', (req, res) => {
    const { userId } = req.params;
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, JWT_SECRET, {}, (err, UserData) => {
            if (err) throw err;

            // Fetch all the messages corresponding to userId and ourUserId
            const ourUserId = UserData.userId
            console.log("TEST response message fetch", { userId, ourUserId });

            Message.find({
                sender: { $in: [userId, ourUserId] },
                recipient: { $in: [userId, ourUserId] },
            })
                .sort({ createdAt: 1 })
                .then((messages) => {
                    res.json(messages);
                });
        });
    }

    else {
        res.status(401).json("No token found");
    }

});

const server = app.listen(4000);

// Create a new webSocket
const webSS = new WebSocketServer({ server })

webSS.on('connection', (connection, req) => {

    // After connection we try to ping the user to check if the user is Alive
    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping()
    }, 5000);

    connection.on("pong", () => {
        console.log("pongggg!");
    });

    const cookies = req.headers.cookie;

    // Read the user name and id from the cookie on connection
    // We can have multiple cookies so split on ;
    if (cookies) {
        const tokenCookie = cookies.split(';').find(str => str.startsWith('token='));
        if (tokenCookie) {
            const token = tokenCookie.split('=')[1];
            if (token) {
                // Verify/Decode our token
                jwt.verify(token, JWT_SECRET, {}, (err, userData) => {
                    if (err) throw err;

                    const { userId, username } = userData;

                    // Save the user details to the connection and all of the connections
                    // are inside the webSS client
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }

    // Receive the message send on the websocket and then broadcast to all the instances of recipients
    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
        const { recipient, text } = messageData;
        // Save the message to DB
        const MessageDoc = await Message.create({
            sender: connection.userId,
            recipient,
            text
        });

        console.log("Message Saved to DB")

        if (recipient && text) {
            //Broadcast the message to recipient instances
            [...webSS.clients]
                .filter(client => client.userId === recipient)
                .forEach(client => client.send(JSON.stringify({
                    text,
                    sender: connection.userId,
                    recipient,
                    _id: MessageDoc._id
                })));
        }

    });

    // After getting the above information, check all the client from the webSS and find who is online
    // Online here means that the socket connection is open for them
    // console.log([...webSS.clients].map(data => data.username));

    [...webSS.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...webSS.clients].map(client => ({ username: client.username, userId: client.userId }))

        }));
    });
});