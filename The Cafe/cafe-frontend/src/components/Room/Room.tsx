import React, { useState, useEffect, useRef } from 'react';
import './Room.module.scss';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ChatIcon from '@material-ui/icons/Chat';
import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import MicOffIcon from '@material-ui/icons/MicOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import Picker from 'emoji-picker-react';
import { createSocketConnectionInstance } from '../../services/socketConnection/socketConnection';

const useStyles = makeStyles({
    icon: {
        width: '5vh',
        height: '10vh',
    },
    videoes: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '50%'
    },
    videoButtons: {
        display: 'flex',
        justifyContent: 'space-evenly',
        alignContent: 'center',
        flexWrap: 'wrap',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        margin: '1rem 0',
    },
    textBox: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        backgroundColor: '#D3D3D3',
        height: '70vh',
        width: '18vw',
    },
    messageBox: {
        overflowY: 'auto',
        display: 'flex',
        'flex-direction': 'column',
        width: "100%",
        height: "100%"
    },
    messageInputBox: {
        width: '80%',
        fontSize: 20,
        outline: "none",
    },
    newMessage: {
        backgroundColor: 'Blue',
        fontSize: '1.25rem',
        marginBottom: '2px',
        overflowWrap: 'break-word',
        color: 'white',
        border: 'Blue',
        borderRadius: 10,
        marginTop: 2,
        padding: '0.5rem'
    },
    textBoxContainer: {
        backgroundColor: 'White',
        position: 'relative',
    },
    emojiButton: {
        position: 'absolute',
        padding: 0,
        right: 0,
        'margin-top': 'auto',
        height: '2rem',
        'margin-bottom': 'auto',
        width: "20%"
    },
    emoji: {
        position: 'relative',
        top: -406,
        left: -3,
    },
    emojiButtonIcon: {
        width: "100%",
        height: "100%"
    }
});

export default function Room(props) {
    const classes = useStyles();

    const [clicks, setClicks] = useState({
        showTextBox: false,
        mute: false,
        video: false,
        screenSharing: false,
        inputText: '',
        showEmoji: false,
    });

    let socketInstance = useRef(null);
    useEffect(() => {
        startConnection();
    }, []);

    // get a socket connection instance that can initialize socket and peer events that handles streaming
    const startConnection = () => {
        // parameters for stream qualities
        let params = { quality: 12 };
        socketInstance.current = createSocketConnectionInstance({
            params,
        });
    };

    // handle when a user disconnects from a room
    const handleDisconnect = () => {
        socketInstance.current?.destoryConnection();
        props.history.push('/');
    };

    {
        /* Got the information below from these sources:
        https://stackoverflow.com/questions/54985085/react-update-single-value-in-state-made-of-array-of-objects
        https://dev.to/andyrewlee/cheat-sheet-for-updating-objects-and-arrays-in-react-state-48np
    */
    }
    const handleMuteClick = () => {
        setClicks({ ...clicks, mute: !clicks.mute });
        socketInstance.current?.toggleAudio();
    };

    const handleVideoClick = () => {
        setClicks({ ...clicks, video: !clicks.video });
        socketInstance.current?.toggleCamera();
    };

    const handleTextBoxClick = () => {
        setClicks({ ...clicks, showTextBox: !clicks.showTextBox });
    };

    const onShowEmojiClick = () => {
        setClicks({ ...clicks, showEmoji: !clicks.showEmoji });
    };

    const handleSendEmoji = (e, emojiObject) => {
        (document.querySelector(
            '#messageInputBox'
        ) as HTMLInputElement).value = (document.querySelector(
            '#messageInputBox'
        ) as HTMLInputElement).value.concat(' 0x' + emojiObject.unified + ' ');
    };

    const handleSendMessage = (e) => {
        if (e.key === 'Enter') {
            let msg = '';

            msg = msg.concat(e.target.value);

            if (
                Object.keys(socketInstance.current.videoContainer).length == 2
            ) {
                socketInstance.current?.sendData(msg);
            }

            let chat = document.querySelector('#chats');
            if (msg !== '') {
                // Got this line from here: https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript
                msg = msg
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/"/g, '&quot;');
                let newMsg = document.createElement('div');
                newMsg.className = classes.newMessage;
                // Converting the emoji hexcode into the emoji symbol.
                let words = msg.split(' ');
                msg = '';
                words.forEach((word) => {
                    if (word.slice(0, 2) === '0x') {
                        try {
                            word = String.fromCodePoint(parseInt(word));
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    msg = msg + ' ' + word;
                });

                newMsg.innerHTML = msg;
                chat.append(newMsg);
                chat.scrollTop = chat.scrollHeight - chat.clientHeight + 1000;
            }
            e.target.value = '';
        }
    };

    // variable that indicates if the user is screen sharing
    // handle when a user clicks on screen share button
    const toggleScreenShare = (displayStream) => {
        setClicks({ ...clicks, screenSharing: !clicks.screenSharing });
        const { reInitializeStream } = socketInstance.current;
        // to either share screen or go back to sharing webcam
        if (displayStream === 'displayMedia') {
            // reinitialize media player for sharing screen
            reInitializeStream(false, true, displayStream).then((stream) => {
                setClicks({ ...clicks, screenSharing: true });
                // to handle if user clicks 'stop sharing' from chrome extension
                stream.getVideoTracks()[0].onended = function () {
                    reInitializeStream(true, true, 'userMedia').then(
                        (stream) => {
                            setClicks({ ...clicks, mute: false, video: false, screenSharing: false });
                        }
                    );
                };
            }).catch(() => {
                setClicks({ ...clicks, screenSharing: false });
            });
        } else {
            // reinitialize media player for sharing web cam
            reInitializeStream(true, true, displayStream).then(() => {
                setClicks({ ...clicks, mute: false, video: false, screenSharing: false });
            });
        }
    };

    return (
        <React.Fragment>
            <div id="room-container" className={classes.videoes}></div>
            <div className={classes.videoButtons}>
                <Button onClick={handleTextBoxClick}>
                    <ChatIcon
                        className={classes.icon}
                    ></ChatIcon>
                </Button>

                <Button onClick={handleDisconnect}>
                    <CallEndIcon
                        className={classes.icon}
                        style={{ fill: 'red' }}
                    ></CallEndIcon>
                </Button>

                <Button onClick={handleMuteClick}>
                    {clicks.mute ? (
                        <MicOffIcon className={classes.icon} />
                    ) : (
                        <KeyboardVoiceIcon className={classes.icon} />
                    )}
                </Button>

                <Button
                    onClick={() =>
                        toggleScreenShare(
                            clicks.screenSharing ? 'userMedia' : 'displayMedia'
                        )
                    }
                >
                    {clicks.screenSharing ? (
                        <ScreenShareIcon className={classes.icon} />
                    ) : (
                        <StopScreenShareIcon className={classes.icon} />
                    )}
                </Button>

                <Button onClick={handleVideoClick}>
                    {clicks.video ? (
                        <VideocamOffIcon className={classes.icon} />
                    ) : (
                        <VideocamIcon className={classes.icon} />
                    )}
                </Button>
            </div>

            <div
                className={classes.textBox}
                style={{
                    visibility: clicks.showTextBox ? 'visible' : 'hidden',
                }}
            >
                <div id="chats" className={classes.messageBox}></div>
                <div className={classes.textBoxContainer}>
                    <input
                        id="messageInputBox"
                        className={classes.messageInputBox}
                        onKeyPress={handleSendMessage}
                    ></input>
                    <button
                        className={classes.emojiButton}
                        onClick={onShowEmojiClick}
                    >
                        <InsertEmoticonIcon className={classes.emojiButtonIcon}></InsertEmoticonIcon>
                    </button>
                </div>

                {/* Got the below snippet of code from here: https://github.com/Allegra9/chat-client/blob/master/src/components/NewMessageForm.js */}
                {clicks.showEmoji ? (
                    <span className={classes.emoji}>
                        <Picker onEmojiClick={handleSendEmoji} />
                    </span>
                ) : null}
            </div>
        </React.Fragment>
    );
}
