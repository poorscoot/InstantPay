var express = require('express');
var router = express.Router();
var BBDD = require('../scripts/BBDD.js');

//If the user exists and the password is correct, he is logged in
router.post('/', async function(req, res, next) {
  try {
    let user = await BBDD.read(req.body.user);
    if(user!==undefined){
      if(req.body.password===user.password){
        req.session.authenticated=true;
        req.session.user=req.body.user;
        res.sendStatus(200);
      } else {
        //TODO: The response should be more verbose
        res.sendStatus(400);
      }
    } else {
      //TODO: The response should be more verbose
      res.sendStatus(400);
    }
  }catch{
    //TODO: The response should be more verbose
    res.sendStatus(400);
  }
});

module.exports = router;