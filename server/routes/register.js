var express = require('express');
var router = express.Router();
var BBDD = require('../scripts/BBDD.js');

//Receives a new user's data, checks if this user already exists and, if not, creates the user
router.post('/', async function(req, res, next) {
  try {
    let test = await BBDD.read(req.body.user);
    let test2 = await BBDD.readID(req.body.shopid);
    if(test===undefined && test2===undefined){
      await BBDD.create(req.body);
      res.sendStatus(200);
    } else {
      //TODO: The response should be more verbose (User already exists)
      res.sendStatus(400);
    }
  }catch{
    //TODO: The response should be more verbose
    res.sendStatus(400);
  }
});

module.exports = router;