var express = require('express');
var router = express.Router();
var BBDD = require('../scripts/BBDD.js');

//Logs out the user
router.get('/', async function(req, res, next) {
  if(req.query.step==="pay"){
    try{
      var user = await BBDD.readID(req.session.shopid);
      if (user !== undefined){
        var redir = user.redirecturi+`?id=${req.session.txid}&status=failed`
        req.session.destroy();
        res.json({href:redir});
      } else {
        req.session.destroy();
        res.sendStatus(200);
      }
    } catch (error){
      req.session.destroy();
      res.sendStatus(200);
    }
  } else {
    req.session.destroy();
    res.sendStatus(200);
  }
  
});

module.exports = router;