import openSocket from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

class User {
    myID = '';
    socket;
    roomId = new BehaviorSubject(null);
    constructor() { }

    cancelQueue = () => {
        if (this.socket) {
            this.socket.emit('cancel-queue', this.myID);
            this.socket.disconnect();
        }
    };

    searchVideoPartner = (userData) => {
        this.socket = openSocket.connect(
            process.env.REACT_APP_PROD ? 'wss://' : 'ws://localhost:3001',
            {
                secure: true,
                reconnection: true,
                rejectUnauthorized: false,
                reconnectionAttempts: 10,
            }
        );
        this.myID = userData.id;
        this.socket.on('connect', () => {
            userData.socketId = this.socket.id;
            this.socket.emit('search-video-partner', userData);
        });
        this.socket.on('user-disconnected', (userID) => {
        });
        this.socket.on('disconnect', (reason) => {
        });
        this.socket.on('error', (err) => {
            console.log('socket error: ' + err);
        });
        this.socket.on('partner-found', (roomId, joinFirst) => {
            if (joinFirst) {
                this.socket.disconnect();
                this.roomId.next(roomId);
            } else {
                this.socket.on('finished-' + roomId, (err) => {
                    this.socket.disconnect();
                    this.roomId.next(roomId);
                });
            }
        });
    };
}

export function createQueueUserInstance() {
    return new User();
}
