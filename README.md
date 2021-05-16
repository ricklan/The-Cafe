# CSCC09 Project

## Project Title: Cafe (Note: It was originally called ABC but we changed it to Cafe.)

## Team Members

-   Qing Yu (Rick) Lan

-   Zhe Fan (Jefferson) Li

-   Jia Zheng (Mark) Li

## Disclaimer
We made a lot of changes to our original idea. All new features will have a [new] beside their description.
Furthermore, our credits are commented in the code.

## Link to Our Deployed Web Application 
https://thecafe.ml/

## Link to Our Documentation
https://github.com/UTSCC09/project-cafe/blob/main/Doc.md

## Link to Our Video Presentation
https://www.youtube.com/watch?v=vsuU0TGqF4k

## Description of Web Application

Cafe is an online chatting app that allows users to connect and interact with a stranger through audio, text or video. When a user opens our web application, they will fill out some details about themselves, such as their age, gender, race and interests. Then, they will be put into a queue where they will be matched with another person based on the details they gave before. After 2 users have been matched, they will be put into a room where they can text, audio chat or video chat. 

## Key Features for Beta Release
-   Users will have the ability to enter information about themselves, such as their age, ethnicity, and gender, when they open our web application. [new]

-   Users will have the ability to go to a queue where they will be matched with another user based on the information they filled out. [new]

-   Paired users will have the ability to automatically join a room.

-   Users will have the ability to chat through audio call, video call or text with other users in the room.

-   Users will have the ability to share their webcam, screen, and mute their mic.

-   Users will be able to send emojis in chat. [new]

## Additional Features for Final Release

-   Users will be able to enter information about their interests when they open our web application and we updated our matching algorithm to pair users with similar interests. [new]

-   We implemented security features to prevent random users from joining rooms. [new]

Note: We were able to finish most of our features by the beta deadline. We spent most of the time for the final release fixing bugs, updating the styling and refactoring code.

## Technologies for Building and Deploying the Web App

-   We will use React]for the frontend and Node.js for the backend. [Removed MongoDB]

-   We will use DigitalOcean for the deployment and freenom for the domain name. [new]

-   We will use Docker to containerize our application. [new]

-   We wil use NGINX for a reverse proxy. [new]

-   We will use PeerJS to allow users to text, audio chat and video chat. [new]

-   We will use Socket.io for matching users and creating rooms. [new]


## Top 5 Technical Challenges

-   Learning and becoming familiar with React. [Removed Node.js and MongoDB]

-   Learning how to containerize our application using Docker. [new]

-   Learning how to use NGINX as a reverse proxy. [new]

-   Learning how to use PeerJs for letting users text, audio-call and video-call. [new]

-   Learning how to use Socket.io for matching users and creating rooms. [new]

# DEPLOYMENT GUIDE

## DROPLET/VM

-   `ssh root@159.203.41.181`

-   username: `root`

-   password: [REDACTED]

-   `cd cafe-frontend`

-   `git pull` (get recent changes)

-   `docker stop $(docker ps -aq)` (stop preexisting docker containers)

-   If `data` file doesnt exist
    -   `docker-compose build && bash ./init-letsencrypt.sh` (run in powershell, run `restart-service *docker*` if error) (we can can only this request a certificate 25 times per week)
-   `docker-compose build && docker-compose up`
