var express = require('express');
var router = express.Router();

//Checks if the user is logged in in server side
router.get('/', function(req, res, next) {
  if(req.session.authenticated===true){
    //TODO: The response should be more verbose
    res.sendStatus(200);
  } else {
    //TODO: The response should be more verbose
    res.sendStatus(400);
  }
});

module.exports = router;