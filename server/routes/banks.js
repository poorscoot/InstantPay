var express = require('express');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');
var BBDD = require('../scripts/BBDD.js');

//Checks if the user is authenticated and if so, proceeds to check if authentication is needed with any of their banks
//Each bank has a different flow. BBVA uses the same pair of tokens, while Santander uses two pairs
router.get('/', async function(req, res, next) {
  if(req.session.authenticated===true){
    try {
      let user = await BBDD.read(req.session.user);
      if (user !== undefined){
        var response = {banks:[]};
        if(user.banks.length > 0){
          //TODO: map should be updated to a for, as it doesn't return an array
          await Promise.all(user.banks.map(async (item) =>{
            if(item.access_token!==''){
              if(item.name==='BBVA'){
                let aux = new Date();
                let now = aux.getTime();
                //An extra minute is added so there's a smaller chance of it expiring mid-flow
                if(item.expires!=='' && item.expires<(now+60000)){
                  return funcionesBBVA.refreshAccessToken(item.refresh_token).then(msg=>{
                    let now = new Date();
                    var tokenexpires=now.getTime()+msg.expires_in;
                    req.session.bbva_access_token=msg.access_token;
                    req.session.bbva_token_expires=tokenexpires;
                    item.access_token=msg.access_token;
                    item.expires=tokenexpires;
                    //TODO: The identifier should be stored for logging
                    var ID = funcionesBBVA.uuid();
                    return funcionesBBVA.getConsentStatus(req.session.bbva_access_token,ID,item.consent_id).then(msg=>{
                      if(msg.consentStatus==="valid"){
                        req.session.bbva_access_token=item.access_token;
                        req.session.BBVAconsentId=item.consent_id;
                        return response.banks.push({bank:item.name,auth:true})
                      } else {
                        return response.banks.push({bank:item.name,auth:false})
                      }
                    }).catch(()=>{ return response.banks.push({bank:item.name,auth:false})});
                  }).catch(()=>{ return response.banks.push({bank:item.name,auth:false})});
                } else {
                  //TODO: The identifier should be stored for logging
                  var ID = funcionesBBVA.uuid();
                  return funcionesBBVA.getConsentStatus(item.access_token,ID,item.consent_id).then(msg=>{
                    if(msg.consentStatus==="valid"){
                      req.session.bbva_access_token=item.access_token;
                      req.session.BBVAconsentId=item.consent_id;
                      return response.banks.push({bank:item.name,auth:true})
                    } else {
                      return response.banks.push({bank:item.name,auth:false})
                    }
                  }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                }
              } else if (item.name==='Santander'){
                let aux = new Date();
                let now = aux.getTime();
                //An extra minute is added so there's a smaller chance of it expiring mid-flow
                if(item.expires!=='' && item.expires<(now+60000)){
                  return funcionesSantander.refreshAccessToken(item.refresh_token).then(msg=>{
                    let now = new Date();
                    var tokenexpires=now.getTime()+msg.expires_in;
                    req.session.santander_access_token=msg.access_token;
                    req.session.santander_token_expires=tokenexpires;
                    item.access_token=msg.access_token;
                    item.expires=tokenexpires;
                    //TODO: The identifier should be stored for logging
                    var ID = funcionesSantander.uuid();
                    return funcionesSantander.getConsentStatus(req.session.santander_access_token,ID,item.consent_id).then(msg=>{
                      if(msg.consentStatus==="valid"){
                        req.session.santander_access_token=item.access_token;
                        req.session.santanderconsentId=item.consent_id;
                        return response.banks.push({bank:item.name,auth:true})
                      } else {
                        return response.banks.push({bank:item.name,auth:false})
                      }
                    }).catch(()=>{ return response.banks.push({bank:item.name,auth:false})});
                  }).catch(()=>{ return response.banks.push({bank:item.name,auth:false})});
                } else {
                  //TODO: The identifier should be stored for logging
                  var ID = funcionesSantander.uuid();
                  return funcionesSantander.getConsentStatus(item.access_token,ID,item.consent_id).then(msg=>{
                    if(msg.consentStatus==="valid"){
                      req.session.santander_access_token=item.access_token;
                      req.session.santanderconsentId=item.consent_id;
                      return response.banks.push({bank:item.name,auth:true})
                    } else {
                      return response.banks.push({bank:item.name,auth:false})
                    }
                  }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                }
              } else {
                return response.banks.push({bank:item.name,auth:false});
              }
            } else {
              return response.banks.push({bank:item.name,auth:false});
            }
          }))
          BBDD.update(user);
          res.json(response)
        } else {
          res.json(response)
        }
      } else {
        //TODO: The response should be more verbose
        res.sendStatus(400);
      }
    }catch{
      //TODO: The response should be more verbose
      res.sendStatus(400);
    }
  } else {
    //TODO: The response should be more verbose
    res.sendStatus(400);
  }
});

module.exports = router;

//Obsolete code, used for the old Santander API, may come in handy
/*
let aux = new Date();
                let now = aux.getTime();
                //An extra minute is added so there's a smaller chance of it expiring mid-flow
                if(item.pre_expires!=='' && item.pre_expires<(now+60000)){
                  return funcionesSantander.refreshAccessToken(item.pre_refresh_token).then(msg=>{
                    
                    let now = new Date();
                    var tokenexpires=now.getTime()+msg.expires_in;
                    req.session.santander_pre_access_token=msg.access_token;
                    req.session.santander_pre_token_expires=tokenexpires;
                    item.pre_access_token=msg.access_token;
                    item.pre_expires=tokenexpires;
                    //An extra minute is added so there's a smaller chance of it expiring mid-flow
                    if(item.expires!=='' && item.expires<(now+60000)){
                      return funcionesSantander.refreshAccessToken(item.refresh_token).then(msg=>{
                        let now = new Date();
                        var tokenexpires=now.getTime()+msg.expires_in;
                        req.session.santander_access_token=msg.access_token;
                        req.session.santander_token_expires=tokenexpires;
                        item.access_token=msg.access_token;
                        item.expires=tokenexpires;
                        return funcionesSantander.getConsentStatus(req.session.santander_pre_access_token,item.consent_id).then(msg=>{
                          if(msg.consentStatus==="valid"){
                            req.session.santander_access_token=item.access_token;
                            req.session.SantanderconsentId=item.consent_id;
                            return response.banks.push({bank:item.name,auth:true})
                          } else {
                            return response.banks.push({bank:item.name,auth:false})
                          }
                        }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                      }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                    } else {
                      return funcionesSantander.getConsentStatus(item.pre_access_token,item.consent_id).then(msg=>{
                        if(msg.consentStatus==="valid"){
                          req.session.santander_access_token=item.access_token;
                          req.session.SantanderconsentId=item.consent_id;
                          return response.banks.push({bank:item.name,auth:true})
                        } else {
                          return response.banks.push({bank:item.name,auth:false})
                        }
                      }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                    }
                  }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                } else {
                  //An extra minute is added so there's a smaller chance of it expiring mid-flow
                  if(item.expires!=='' && item.expires<(now+60000)){
                    return funcionesSantander.refreshAccessToken(item.refresh_token).then(msg=>{
                      let now = new Date();
                      var tokenexpires=now.getTime()+msg.expires_in;
                      req.session.santander_access_token=msg.access_token;
                      req.session.santander_token_expires=tokenexpires;
                      item.access_token=msg.access_token;
                      item.expires=tokenexpires;
                      return funcionesSantander.getConsentStatus(req.session.santander_pre_access_token,item.consent_id).then(msg=>{
                        if(msg.consentStatus==="valid"){
                          req.session.santander_access_token=item.access_token;
                          req.session.SantanderconsentId=item.consent_id;
                          return response.banks.push({bank:item.name,auth:true})
                        } else {
                          return response.banks.push({bank:item.name,auth:false})
                        }
                      }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                    }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                  } else {
                    return funcionesSantander.getConsentStatus(item.pre_access_token,item.consent_id).then(msg=>{
                      if(msg.consentStatus==="valid"){
                        req.session.santander_access_token=item.access_token;
                        req.session.SantanderconsentId=item.consent_id;
                        return response.banks.push({bank:item.name,auth:true})
                      } else {
                        return response.banks.push({bank:item.name,auth:false})
                      }
                    }).catch(()=>{return response.banks.push({bank:item.name,auth:false})});
                  }
                }
*/