import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { UserDemograpic } from './models';

const url = process.env.REACT_APP_PROD ? '/api' : 'http://localhost:3001/api';
export const getUserDemographic = () => {
    axios
        .get(`${url}/getUserDemographic/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, //! must set this to interact with session
        })
        .then(function (response) {
            userDemographic$.next(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
};
export const setUserDemographic = (data: UserDemograpic) => {
    axios
        .post(`${url}/setUserDemographic/`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, //! must set this to interact with session
        })
        .then(function (response) {
            userDemographic$.next(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
};

///////// BEHAVIOUR SUBJECTS //////////
//read about them here https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject#example-1-simple-behaviorsubject
export const userDemographic$ = new BehaviorSubject<
    UserDemograpic | undefined | string
>(undefined); //init emit is undefined, indicating no demographic,
