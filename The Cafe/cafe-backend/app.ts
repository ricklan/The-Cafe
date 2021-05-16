import { v4 as uuidV4 } from 'uuid';

const app = require('express')();
const secrets = require('./secrets');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const { PeerServer } = require('peer');

//PEERJS SERVER
const peerServer = PeerServer({
    port: process.env.PEERJS_PORT ?? 9000,
    path: '/',
    secure: true,
});

let sleep = require('system-sleep');

// For text and audio room matching queue
let textAndAudioMatchingQueue = [];

// To be used in websocket to match users
function matchUsers(counter, socket) {
    let sid = textAndAudioMatchingQueue[counter].socketId;
    textAndAudioMatchingQueue.splice(counter, 1);
    textAndAudioMatchingQueue.pop();
    let roomId = uuidV4();
    // Tell my own client that a partner has been found
    socket.emit('partner-found', roomId, false);
    // Get socket to join a new room. This room is designed for users to wait while the first user is joining the room
    socket.join('waiting-' + roomId);
    // Tell my partner's client that a partner has been found
    io.to(sid).emit('partner-found', roomId, true);
}

// WEBSOCKET
io.on('connection', (socket) => {
    // For joining a room
    socket.on('join-room', (userData) => {
        const { roomID, userID } = userData;
        socket.join(roomID);
        // notify that a new user has joined along with their user data
        socket.to(roomID).broadcast.emit('new-user-connect', userData);
        socket.on('disconnect', () => {
            socket.to(roomID).broadcast.emit('user-disconnected', userID);
        });
    });

    // To indicate that the existing user has all listener active and is ready for new users to join
    socket.on('listeners-ready', (roomId) => {
        socket.to('waiting-' + roomId).broadcast.emit('finished-' + roomId);
    });

    // To notify that a match has been found
    socket.on('notify-match', (userData) => {
        socket.to(userData[0].socketId).emit('partner-matched', userData);
    });

    socket.on('cancel-queue', (userId) => {
        textAndAudioMatchingQueue = textAndAudioMatchingQueue.filter(function (el) {
            return el.id != userId;
        });
        console.log(textAndAudioMatchingQueue)
    });

    // For joining a queue
    socket.on('search-video-partner', (userData) => {
        // Add user to matching queue
        textAndAudioMatchingQueue.push(userData);
        // Get socket to join the matchQueue room
        socket.join('matchQueue');
        while (socket.connected) {
            console.log(userData.id, textAndAudioMatchingQueue.length);
            // Match based on ethnicity, age and gender
            if (textAndAudioMatchingQueue.length > 1) {
                let newUser =
                    textAndAudioMatchingQueue[
                    textAndAudioMatchingQueue.length - 1
                    ]; // The new user who just arrived.

                // Random Match
                if (newUser.ethnicity === 0 || newUser.gender === 0) {
                    let sid = textAndAudioMatchingQueue[0].socketId;
                    textAndAudioMatchingQueue.shift();
                    textAndAudioMatchingQueue.pop();
                    let roomId = uuidV4();
                    // Tell my own client that a partner has been found
                    socket.emit('partner-found', roomId, false);
                    // Get socket to join a new room. This room is designed for users to wait while the first user is joining the room
                    socket.join('waiting-' + roomId);
                    // Tell my partner's client that a partner has been found
                    io.to(sid).emit('partner-found', roomId, true);
                    return true;
                }

                let counter = 0;
                while (counter < textAndAudioMatchingQueue.length - 1) {
                    // If a user has been waiting more than 15 seconds, instantly match the new user with that user.
                    if (
                        Date.now() -
                        textAndAudioMatchingQueue[counter].startDate >=
                        15000
                    ) {
                        matchUsers(counter, socket);
                        return true;
                    }

                    // Matching users based on personality
                    if (
                        newUser.ethnicity ===
                        textAndAudioMatchingQueue[counter].ethnicity &&
                        newUser.gender ===
                        textAndAudioMatchingQueue[counter].gender &&
                        Math.abs(
                            newUser.age - textAndAudioMatchingQueue[counter].age
                        ) <= 10
                    ) {
                        matchUsers(counter, socket);
                        return true;
                    }

                    // Matching users based on interests
                    let interestSet1 = newUser.interests.split(",");
                    interestSet1 = interestSet1.filter(function (el) {
                        return el != '';
                    });
                    let interestSet2 = textAndAudioMatchingQueue[counter].interests.split(",");
                    interestSet2 = interestSet2.filter(function (el) {
                        return el != '';
                    });
                    if (interestSet1.length !== 0 && interestSet2.length !== 0 && interestSet1.some(item => interestSet2.includes(item))) {
                        matchUsers(counter, socket);
                        return true;
                    }
                    counter++;
                }
            }
            sleep(1000); // 1 second break
        }
    });
});

//SESSIONS
const session = require('express-session');
app.use(
    session({
        secret: secrets.sessionSecret,
        resave: true,
        saveUninitialized: false,
    })
);

//CORS
const cors = require('cors');
app.use(
    cors({
        origin: process.env.PROD ? 'http://localhost' : 'http://localhost:3000',
        methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
        credentials: true,
    })
);

//BODY PARSER
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    req.userdemographic = req.session.userdemographic
        ? req.session.userdemographic
        : undefined;
    console.log(
        'HTTP request',
        //req.userdemographic,
        req.method,
        req.url,
        req.body
    );
    next();
});

///////////////////////////////////////      INIT VIEWS       /////////////////////////////////////
require('./views/users').init(app);
require('./views/matching').init(app);

const PORT = process.env.API_PORT || 3001;

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log('HTTP server on http://localhost:%s', PORT);
});
