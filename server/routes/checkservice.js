var express = require('express');
var router = express.Router();

//Checks if the user is logged in in server side
router.get('/', function(req, res, next) {
  if(req.session.service==="startpaymentwauth"){
    res.json({service:"payment"});
  } else if(req.session.service==="startSVApayment"){
    res.json({service:"SVA"});
  } else if(req.session.service==="post"){
    res.json({service:"post",status:req.session.paymentstatus,bankid:req.session.bankid,storeid:req.session.txid,amount:req.session.amount});
  } else {
      //TODO: The response should be more verbose
      res.sendStatus(400);
  }
});

module.exports = router;