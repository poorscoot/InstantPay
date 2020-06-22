var express = require('express');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');
var BBDD = require('../scripts/BBDD.js');


//TODO: save accounts and serve them in case there's an error
//When called returns the available accounts for the given bank
router.post('/', async function(req, res, next) {
  try{
    let user = await BBDD.read(req.session.user);
    if(user!==undefined){
    //Ask for bank accounts and save them to the DB
      if(req.session.authenticated===true){
        if(req.body.bank==="BBVA"){
            //TODO: The identifier should be stored for logging
            var ID = funcionesBBVA.uuid();
            //TODO: This variable is for the protoype, in an actual application the request should be made and just update the camps that differ
            var update = true;
            if(user.banks.length>0){
              user.banks.forEach(
                (item)=>{
                  if(item.name==="BBVA"){
                    if(item.accounts.length>0){
                      update=false;
                      
                    }
                  }
                }
              );
            }
            if(update){
              //Requests the available accounts
              funcionesBBVA.getAccountData(req.session.bbva_access_token,ID,req.session.BBVAconsentId).then(msg=>{
              //TODO: Parse the data to only send the necessary info: resourceId, iban, ownerName, product, balances (last one only with balanceAmount, not BalanceType) 
              //var response = msg.accounts.map((item)=>{})
              //res.json({accs:response});
              //Should only update info, not directly substitute the existing accounts
              if (msg===undefined){
                throw "404"
              }
              /*var aux = msg.data.accounts;
              if(aux.length>0){
                aux.forEach(
                  (item)=>{
                      item.transactions=[];
                  }
                );
              }*/
              if(user.banks.length>0){
                user.banks.forEach(
                  (item)=>{
                    if(item.name==="BBVA"){
                      item.accounts=msg.data.accounts;
                    }
                  }
                );
              }
              BBDD.update(user);
              res.json({accs:msg.data.accounts});
              }).catch(error => {
                console.log(error);
                if(user.banks.length>0){
                  user.banks.forEach(
                    (item)=>{
                      if(item.name==="BBVA"){
                        res.json({accs:item.accounts});
                      }
                    }
                  );
                } else {
                  //TODO: The response should be more verbose
                  console.log(error);
                  res.sendStatus(400);
                }
              })
            } else {
              if(user.banks.length>0){
                user.banks.forEach(
                  (item)=>{
                    if(item.name==="BBVA"){
                      res.json({accs:item.accounts});
                    }
                  }
                );
              } else {
                //TODO: The response should be more verbose
                console.log(error);
                res.sendStatus(400);
              }
            }
        } else if (req.body.bank==="Santander"){
          //TODO: The identifier should be stored for logging
          var ID = funcionesSantander.uuid();
          //TODO: This variable is for the protoype, in an actual application the request should be made and just update the camps that differ
          var update = true;
          if(user.banks.length>0){
            user.banks.forEach(
              (item)=>{
                if(item.name==="Santander"){
                  if(item.accounts.length>0){
                    update=false;
                    
                  }
                }
              }
            );
          }
          if(update){
            //Requests the available accounts
            funcionesSantander.getAccountData(req.session.santander_access_token,ID,req.session.santanderconsentId).then(msg=>{
            
            //TODO: Parse the data to only send the necessary info: resourceId, iban, ownerName, product, balances (last one only with balanceAmount, not BalanceType) 
            //var response = msg.accounts.map((item)=>{})
            //res.json({accs:response});
            //Should only update info, not directly substitute the existing accounts
            if (msg===undefined){
              throw "404"
            }
            /*var aux = msg.data.accounts;
            if(aux.length>0){
              aux.forEach(
                (item)=>{
                    item.transactions=[];
                }
              );
            }*/
            if(user.banks.length>0){
              user.banks.forEach(
                (item)=>{
                  if(item.name==="Santander"){
                    item.accounts=msg.data.accounts;
                  }
                }
              );
            }
            BBDD.update(user);
            res.json({accs:msg.data.accounts});
            }).catch(error => {
              console.log(error);
              if(user.banks.length>0){
                user.banks.forEach(
                  (item)=>{
                    if(item.name==="Santander"){
                      res.json({accs:item.accounts});
                    }
                  }
                );
              } else {
                //TODO: The response should be more verbose
                console.log(error);
                res.sendStatus(400);
              }
            })
          } else {
            if(user.banks.length>0){
              user.banks.forEach(
                (item)=>{
                  if(item.name==="Santander"){
                    res.json({accs:item.accounts});
                  }
                }
              );
            } else {
              //TODO: The response should be more verbose
              console.log(error);
              res.sendStatus(400);
            }
          }
        } else {
          //TODO: The response should be more verbose
          res.sendStatus(400);
        }
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

//Obsolete code, used for the old Santander API, may come in handy
/*
//TODO The identifier should be stored for logging
let r = Math.random().toString(36).substring(5);
//Requests the available accounts
funcionesSantander.getAccountData(req.session.santander_access_token,r).then(msg=>{
  //TODO: Parse the data to only send the necessary info: resourceId, iban, ownerName, product, balances (last one only with balanceAmount, not BalanceType) 
  //var response = msg.data.accountList.map((item)=>{console.log(item)}))
  //res.json({accs:response});
  if(user.banks.length>0){
    user.banks.forEach(
      (item)=>{
        if(item.name==="Santander"){
          item.accounts=msg.data.accountList;
        }
      }
    );
  }
  BBDD.update(user);
  res.json({accs:msg.data.accountList});
}).catch(error => {
  //TODO: The response should be more verbose
  console.log(error);
  if(user.banks.length>0){
    user.banks.forEach(
      (item)=>{
        if(item.name==="Santander"){
          res.json({accs:item.accounts});
        }
      }
    );
    res.sendStatus(400);
  } else {
    console.log(error);
    res.sendStatus(400);
  }
})*/