exports.init = (app, db) => {
  const userModels = require('../models/users');
  const { v4: uuidv4 } = require('uuid');

  app.post('/api/setUserDemographic/', function (req, res, next) {
    req.session.userdemographic = req.body;
    req.session.userdemographic.id = uuidv4();
    return res.status(200).json(req.session.userdemographic);
  });

  app.get('/api/getUserDemographic/', function (req, res, next) {
    return res.status(200).json(req.session.userdemographic);
  });

  // app.get('/api/sessionInfo/', function (req, res, next) {
  //   if ('userdemographic' in req.session) {
  //     return res.status(200).json(req.session.userdemographic);
  //   }
  //   return res.status(404).end("You did not fill out the details on the dashboard.");
  // });
};
