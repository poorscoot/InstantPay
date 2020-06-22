var express = require('express');
var router = express.Router();
var BBDD = require('../scripts/BBDD.js');

//TODO: todo
//If the user is authenticated, returns the user's transactions with the offset specified
router.get('/', async function(req, res, next) {
  //Buscar usuario en BBDD y usar offset
  if(req.session.authenticated===true){
    var user = await BBDD.read(req.session.user);
    if(user!==undefined){
      res.json({tx:user.transactions.splice(req.query.offset,req.query.offset+20)})
    }else{
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;