exports.init = (app, db) => {

    // Endpoint for setting a current time for the user in session. Timer is later used for matching users.
    app.get('/api/matchVideo/', function (req, res, next) {
        if ('userdemographic' in req.session) {
            req.session.userdemographic.startDate = Date.now();
            return res.status(200).json(req.session.userdemographic);
        }
        return res.status(404).end("You did not fill out the details on the dashboard.");
    });
};
