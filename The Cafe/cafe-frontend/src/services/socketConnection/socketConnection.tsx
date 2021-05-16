import openSocket from 'socket.io-client';
import Peer from 'peerjs';

class Connection {
    myID = '';
    videoContainer = {};
    settings;
    streaming = false;
    streamObject;
    myPeer;
    socket;
    connected = false;
    connect;
    connectUser2;
    isScreenSharing = false;
    peers = {};
    roomId = '';
    constructor(settings) {
        this.settings = settings;
        // peer server is on port 9000 for now
        this.myPeer = new Peer(undefined, {
            host: '/',
            port: process.env.REACT_APP_PROD ? 443 : 9000,
            secure: process.env.REACT_APP_PROD !== undefined, // enables https
        });
        // socket is listening to port 5000 for now
        this.socket = openSocket.connect(
            process.env.REACT_APP_PROD ? 'wss://' : 'ws://localhost:3001',
            {
                secure: true,
                reconnection: true,
                rejectUnauthorized: false,
                reconnectionAttempts: 10,
            }
        );
        // initialize socket and peers
        this.initializeSocketEvents();
        this.initializePeersEvents();
    }

    // initialize socket events
    initializeSocketEvents = () => {
        this.socket.on('connect', () => {
        });
        this.socket.on('user-disconnected', (userID) => {
            // close peer connection
            if (this.peers[userID]) {
                this.peers[userID].close();
            }
            this.removeVideo(userID);
        });
        this.socket.on('disconnect', () => {
        });
        this.socket.on('error', (err) => {
            console.log('socket error: ' + err);
        });
    };

    // initialize peer events
    initializePeersEvents = () => {
        this.myPeer.on('open', (id) => {
            this.myID = id;
            this.roomId = window.location.pathname.split('/')[2];
            const userData = {
                userID: id,
                roomID: this.roomId
            };
            // set user's own video stream and listen for other users' stream
            this.setStreamAndPeerListener(userData);
        });
        this.myPeer.on('error', (err) => {
            console.log('peer connection error', err);
            this.myPeer.reconnect();
        });
    };

    // set user's own video stream and listen for other users' stream
    setStreamAndPeerListener = (userData) => {
        this.getVideoAudioStream().then((stream) => {
            // let other users know that a new user has joined and is ready to be called
            this.socket.emit('join-room', userData);
            if (stream) {
                this.streamObject = stream;
                this.streaming = true;
                this.createVideo({ id: this.myID, stream });
                // listen for incoming calls
                this.setPeersListeners();
                // call incoming users
                this.newUserConnection();
            }
        });
    };

    // set and return video and audio media stream
    getVideoAudioStream = (video = true, audio = true) => {
        let quality = this.settings.params?.quality;
        if (quality) {
            quality = parseInt(quality);
        }
        const myNavigator = navigator.mediaDevices.getUserMedia;
        return myNavigator({
            video: video
                ? {
                    frameRate: quality ? quality : 12,
                    noiseSuppression: true,
                    width: 450,
                    height: 200
                }
                : false,
            audio: audio,
        });
    };

    // create video
    createVideo = (createObj) => {
        if (!this.videoContainer[createObj.id]) {
            this.videoContainer[createObj.id] = {
                ...createObj,
            };
            const roomContainer = document.getElementById('room-container');
            const videoContainer = document.createElement('div');
            const video = document.createElement('video');
            video.srcObject = this.videoContainer[createObj.id].stream;
            video.id = createObj.id;
            video.autoplay = true;
            if (this.myID === createObj.id) video.muted = true;
            videoContainer.appendChild(video);
            if (roomContainer) roomContainer.append(videoContainer);
        } else {
            const streamObj = document.getElementById(
                createObj.id
            ) as HTMLMediaElement;
            if (streamObj) streamObj.srcObject = createObj.stream;
        }
    };

    // listen for incoming calls
    setPeersListeners = () => {
        // when a user calls the the current peer, answer the call and create new video for the user calling them
        let stream = this.streamObject;
        this.myPeer.on('call', (call) => {
            call.answer(stream);
            // create new video for incoming caller
            call.on('stream', (userVideoStream) => {
                this.createVideo({
                    id: call.metadata.id,
                    stream: userVideoStream,
                });
            });
            // close video for incoming caller if they leave or an error occurs
            call.on('close', () => {
                this.removeVideo(call.metadata.id);
            });
            call.on('error', () => {
                this.removeVideo(call.metadata.id);
            });
            this.peers[call.metadata.id] = call;
        });

        this.myPeer.on('connection', (dataConnection) => {
            dataConnection.on('open', () => {
                this.connected = true;

                this.connectUser2 = dataConnection;
                dataConnection.on('data', (data) => {
                    this.createNewMessage(data);
                });

                dataConnection.on('error', (err) => {
                    console.log(err);
                });
            });
        });
    };

    // when new user joins room, establish peer connection to new user
    newUserConnection() {
        this.socket.on('new-user-connect', (userData) => {
            let stream = this.streamObject;
            // need to wait a bit because peer instance may not be fully initialized
            setTimeout(() => {
                this.connectToNewUser(userData, stream);
            }, 1500);
        });
        // emit this event to indicate that every listener is active and ready to listen for new user joining the room
        this.socket.emit("listeners-ready", this.roomId);
    }

    // establish peer connection to a new user by calling them
    connectToNewUser(userData, stream) {
        const { userID } = userData;
        // call new the user that joined the room
        const call = this.myPeer.call(userID, stream, {
            metadata: { id: this.myID },
        });
        // create new video for the new user that joined
        call.on('stream', (userVideoStream) => {
            this.createVideo({ id: userID, stream: userVideoStream, userData });
        });
        // close video when user leaves or error occurs
        call.on('close', () => {
            this.removeVideo(userID);
        });
        call.on('error', () => {
            this.removeVideo(userID);
        });
        this.peers[userID] = call;

        this.connect = this.myPeer.connect(userID);
        this.connect.on('open', () => {
            this.connected = true;

            this.connect.on('connection', (dataConnection) => {
            });

            this.connect.on('data', (data) => {
                this.createNewMessage(data);
            });

            this.connect.on('error', (err) => {
                console.log(err);
            });
        });
    }

    createNewMessage(data) {
        const latestMessage = document.getElementById('chats');
        const newMessage = document.createElement('p');
        // Converting the emoji hexcode into the emoji symbol.
        let words = data.split(" ");
        data = "";
        words.forEach(word => {
            if (word.slice(0, 2) === "0x") {
                try {
                    word = String.fromCodePoint(parseInt(word));
                }
                catch (err) {

                }
            }
            data = data + ' ' + word;
        })
        newMessage.innerHTML = data;
        newMessage.className = `receivedMessage`;
        latestMessage.append(newMessage);
    }

    sendData(data) {
        if (this.connected) {
            this.connect
                ? this.connect.send(data)
                : this.connectUser2.send(data);
        }
    }

    // remove video
    removeVideo = (id) => {
        delete this.videoContainer[id];
        const video = document.getElementById(id);
        if (video) video.remove();
    };

    toggleCamera = () => {
        const myMediaTracks = this.streamObject.getTracks();
        if (this.isScreenSharing) {
            myMediaTracks[0].enabled = !myMediaTracks[0].enabled; // Stops the camera.
        } else {
            myMediaTracks[1].enabled = !myMediaTracks[1].enabled; // Stops the camera.
        }
    };

    toggleAudio = () => {
        const myMediaTracks = this.streamObject.getTracks();
        myMediaTracks[0].enabled = !myMediaTracks[0].enabled; // Stops the audio.
    };

    // close peer connection
    destoryConnection = () => {
        const myMediaTracks = this.streamObject.getTracks();
        myMediaTracks?.forEach((track: any) => {
            track.stop();
        });
        this.socket.disconnect();
        this.myPeer.destroy();
    };

    // SCREEN SHARE FUNCTIONS

    // set and return video and audio media stream
    getScreenStream = (video = true, audio = true) => {
        let quality = this.settings.params?.quality;
        if (quality) {
            quality = parseInt(quality);
        }
        const mediaDevices = navigator.mediaDevices as any;
        return mediaDevices.getDisplayMedia({
            video: video
                ? {
                    frameRate: quality ? quality : 12,
                    noiseSuppression: true,
                    // width: { min: 640, ideal: 640, max: 1920 },
                    // height: { min: 480, ideal: 480, max: 1080 },
                    width: 800,
                    height: 250
                }
                : false,
            audio: audio,
        });
    };

    // reinitialize media stream for screen share or video share
    reInitializeStream = (video, audio, type = 'userMedia') => {
        let media;
        this.isScreenSharing = !this.isScreenSharing;
        if (type === 'userMedia') {
            // get webcam media track
            media = this.getVideoAudioStream(video, audio);
        } else {
            // get screen share media track
            let displayMediaOptions = {
                video: {
                    cursor: 'always',
                    width: 800,
                    height: 250
                },
                audio: false,
            };
            const mediaDevices = navigator.mediaDevices as any;
            media = mediaDevices.getDisplayMedia(displayMediaOptions);
        }

        return new Promise((resolve, reject) => {
            media.then((stream) => {
                this.streamObject = stream;
                // close previous media track
                this.closeVideoTrack();
                // create new media track
                this.createVideo({ id: this.myID, stream });
                // notify connected peer users of new media track
                this.replaceStream(stream);
                resolve(stream);
            }).catch(() => {
                this.isScreenSharing = !this.isScreenSharing;
            });

            media.catch((err) => {
                reject();
            });
        });
    };

    // get user's own media track
    getMyVideo = () => {
        return document.getElementById(this.myID) as HTMLMediaElement;
    };

    // to turn off the current video track
    closeVideoTrack = () => {
        const myVideo = this.getMyVideo();
        if (myVideo) {
            if ('getVideoTracks' in myVideo.srcObject) {
                myVideo.srcObject.getVideoTracks().forEach((track) => {
                    if (track.kind === 'video') {
                        track.stop();
                    }
                });
            }
        }
    };

    // to replace and send the new media track to connected peer users
    replaceStream = (mediaStream) => {
        Object.values(this.peers).map((peer: any) => {
            peer.peerConnection?.getSenders().map((sender) => {
                if (sender.track.kind == 'audio') {
                    if (mediaStream.getAudioTracks().length > 0) {
                        sender.replaceTrack(mediaStream.getAudioTracks()[0]);
                    }
                }
                if (sender.track.kind == 'video') {
                    if (mediaStream.getVideoTracks().length > 0) {
                        sender.replaceTrack(mediaStream.getVideoTracks()[0]);
                    }
                }
            });
        });
    };
}

export function createSocketConnectionInstance(settings = {}) {
    return new Connection(settings);
}
