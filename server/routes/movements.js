var express = require('express');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');
var BBDD = require('../scripts/BBDD.js');

//When called returns the movements for the given account
router.post('/', async function(req, res, next) {
  try{
    let user = await BBDD.read(req.session.user);
    if(user!==undefined){
    //Ask for account movements and save them to the DB
      if(req.session.authenticated===true){
        if(req.body.bank==="BBVA"){
            //TODO: The identifier should be stored for logging
            var ID = funcionesBBVA.uuid();
            //Chacks consent, as it sometimes fails to activate
            funcionesBBVA.getConsentStatus(req.session.bbva_access_token,ID,req.session.BBVAconsentId).then(msg=>{
              var ID = funcionesBBVA.uuid();
              funcionesBBVA.getTransactions(req.session.bbva_access_token,req.body.iban,ID,req.session.BBVAconsentId).then(msg=>{
                //TODO: Should ask for the next set of movements with the _links.next URL.
                //TODO: Parse the data to only send the necessary info:
                //var response = msg..map((item)=>{})
                //res.json({tx:response});
                if (msg===undefined){
                  throw "404"
                }
                if (msg.status!==200){
                  throw "404"
                }
                if(user.banks.length>0){
                  user.banks.forEach(
                    (item)=>{if(item.name==="BBVA"){
                      if(item.accounts.length>0){
                        item.accounts.forEach((item)=>{
                          //TODO: Should also store the date of the last request for the next requests and push the new transactions, not replace the array outright.
                          if(item.resourceId===req.body.iban){
                            if(msg.data.transactions.booked.length>0){
                              item.transactions=msg.data.transactions.booked
                            }
                          };
                        }
                        )
                      }
                    }}
                  )
                }
                BBDD.update(user);
                if(msg.data.transactions.booked.length>0){
                  res.json({tx:msg.data.transactions.booked.splice(0,20)});
                } else {
                  res.json({tx:[]});
                }
              }).catch(error => {
                //TODO: The response should be more verbose
                console.log(error);
                if(user.banks.length>0){
                  user.banks.forEach(
                    (item)=>{if(item.name==="BBVA"){
                      if(item.accounts.length>0){
                        item.accounts.forEach((item)=>{
                          if(item.resourceId===req.body.iban){res.json({tx:item.transactions.splice(0,20)})};
                        }
                        )
                      }
                    }}
                  )
                } else {
                  console.log(error);
                  res.sendStatus(400);
                }
              })
            }).catch (error=>{
              console.log(error);
              res.sendStatus(400);
            })
        } else if (req.body.bank==="Santander"){
          //TODO: The identifier should be stored for logging
          var ID = funcionesSantander.uuid();
          //Chacks consent, as it sometimes fails to activate
          funcionesSantander.getConsentStatus(req.session.santander_access_token,ID,req.session.santanderconsentId).then(msg=>{
            var ID = funcionesSantander.uuid();
            funcionesSantander.getTransactions(req.session.santander_access_token,req.body.iban,ID,req.session.santanderconsentId).then(msg=>{
              //TODO: Should ask for the next set of movements with the _links.next URL.
              //TODO: Parse the data to only send the necessary info:
              //var response = msg..map((item)=>{})
              //res.json({tx:response});
              if (msg===undefined){
                throw "404"
              }
              if (msg.status!==200){
                throw "404"
              }
              if(user.banks.length>0){
                user.banks.forEach(
                  (item)=>{if(item.name==="Santander"){
                    if(item.accounts.length>0){
                      item.accounts.forEach((item)=>{
                        //TODO: Should also store the date of the last request for the next requests and push the new transactions, not replace the array outright.
                        if(item.resourceId===req.body.iban){
                          if(msg.data.transactions.booked.length>0){
                            item.transactions=msg.data.transactions.booked
                          }
                        };
                      }
                      )
                    }
                  }}
                )
              }
              BBDD.update(user);
              if(msg.data.transactions.booked.length>0){
                res.json({tx:msg.data.transactions.booked.splice(0,20)});
              } else {
                res.json({tx:[]});
              }
            }).catch(error => {
              //TODO: The response should be more verbose
              console.log(error);
              if(user.banks.length>0){
                user.banks.forEach(
                  (item)=>{if(item.name==="Santander"){
                    if(item.accounts.length>0){
                      item.accounts.forEach((item)=>{
                        if(item.resourceId===req.body.iban){res.json({tx:item.transactions.splice(0,20)})};
                      }
                      )
                    }
                  }}
                )
              } else {
                console.log(error);
                res.sendStatus(400);
              }
            })
          }).catch (error=>{
            console.log(error);
            res.sendStatus(400);
          })
        } else {
          //TODO: The response should be more verbose
          res.sendStatus(400);
        }
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
                (item)=>{if(item.name==="Santander"){item.accounts=msg.data.accountList}}
              )
            }
            BBDD.update(user);
            res.json({accs:msg.data.accountList});
          }).catch(error => {
            //TODO: The response should be more verbose
            console.log(error);
            if(user.banks.length>0){
              user.banks.forEach(
                (item)=>{if(item.name==="Santander"){res.json({accs:item.accounts});}}
              )
              res.sendStatus(400);
            } else {
              console.log(error);
              res.sendStatus(400);
            }
          })
*/