import React, { useState, useEffect } from 'react';
import '../dashboard/Dashboard.scss';
import './Queue.scss';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createQueueUserInstance } from '../../services/queue/queue';

const url = process.env.REACT_APP_PROD ? '/api' : 'http://localhost:3001/api';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing(2),
        },
    },
}));

function Queue(props) {
    const classes = useStyles();
    const history = useHistory();
    let queueInstance = createQueueUserInstance();
    const [state, setState] = useState({
        error: false,
        errorMessage: '',
    });

    useEffect(() => {
        // Checks if the user chose a method of communication.
        if (!props.history.location.state) {
            setState({
                error: true,
                errorMessage:
                    'You did not choose a communication method.',
            });
        }

        // Checks that the user entered the information on the dashboard.
        if (!state.error) {
            axios
                .get(`${url}/matchVideo/`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true, //! must set this to interact with session
                })
                .then(function (response) {
                    queueInstance.searchVideoPartner(response.data);
                    let sub = queueInstance.roomId.subscribe((val) => {
                        if (val) {
                            props.history.push({
                                pathname: '/room/' + queueInstance.roomId.value,
                                state: queueInstance.roomId.value
                            });
                        }
                    });
                })
                .catch(function (error) {
                    setState({
                        error: true,
                        errorMessage: error.response.data,
                    });
                });
        }
    }, []);

    const handleDisconnect = () => {
        queueInstance.cancelQueue();
        history.push('/dashboard/');
    }

    return (
        <div id="dashboard-host" className={classes.root}>
            <div className="floating-title logo"> The Cafe </div>

            {/* If there's no errors, show the queue sign. Otherwise, show the error message. */}
            {state.error ? (
                <h2 className="error"> {state.errorMessage} </h2>
            ) : (
                <div className="waitMessage">
                    <h2> Please Wait While We Find A Match </h2>
                    <CircularProgress
                        className="waitIcon"
                        color="primary"
                        size="10rem"
                    />
                </div>
            )}

            <Button
                variant="outlined"
                size="large"
                color="primary"
                onClick={handleDisconnect}
            >
                Dashboard
            </Button>
        </div>
    );
}

export default Queue;
