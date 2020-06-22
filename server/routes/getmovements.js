var express = require('express');
var router = express.Router();
var BBDD = require('../scripts/BBDD.js');

//When called returns the movements for the given account
router.post('/', async function(req, res, next) {
  try{
    let user = await BBDD.read(req.session.user);
    if(user!==undefined){
    //Ask for account movements and save them to the DB
      if(req.body.bank==="BBVA"){
        if(req.session.authenticated===true){
            if(user.banks.length>0){
            user.banks.forEach(
                (item)=>{if(item.name==="BBVA"){
                if(item.accounts.length>0){
                    item.accounts.forEach((item)=>{
                    //TODO: Should also store the date of the last request for the next requests and push the new transactions, not replace the array outright.
                    if(item.resourceId===req.body.iban){
                        if((req.body.offset!==undefined)&&(req.body.offset<item.transactions.length)){
                            res.json({tx:msg.data.accounts.splice(req.body.offset,req.body.offset+20)});
                        }
                    }
                    }
                    )
                }
                }}
            )
            }
            res.sendStatus(400);
        } else {
          //TODO: The response should be more verbose
          res.sendStatus(400);
        }
      } else if(req.body.bank==="Santander"){
        if(req.session.authenticated===true){
          if(user.banks.length>0){
          user.banks.forEach(
              (item)=>{if(item.name==="Santander"){
              if(item.accounts.length>0){
                  item.accounts.forEach((item)=>{
                  //TODO: Should also store the date of the last request for the next requests and push the new transactions, not replace the array outright.
                  if(item.resourceId===req.body.iban){
                      if((req.body.offset!==undefined)&&(req.body.offset<item.transactions.length)){
                          res.json({tx:msg.data.accounts.splice(req.body.offset,req.body.offset+20)});
                      }
                  }
                  }
                  )
              }
              }}
          )
          }
          res.sendStatus(400);
      } else {
        //TODO: The response should be more verbose
        res.sendStatus(400);
      }
      }else{
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