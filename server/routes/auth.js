var express = require('express');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');
var BBDD = require('../scripts/BBDD.js');

//In this prototype, both redirect URIs given to the bank point to the same URI, and this router manages both flows
//As it can be seen, the code is complex, and a different redirectURI should be given for each bank, with a different route for each
//The calls to the endpoints should make use of the option to give a redirect URI, so as to make different routers and make each one less monolithic and confusing (And leave a smaller window for failures)
router.get('/', async function(req, res, next) {
    if(req.session.service==="payment"){
        if(req.session.currentBank==="BBVA"){
            var ID= funcionesBBVA.uuid();
            funcionesBBVA.initiatePayment(req.session.bbva_access_token,ID,req.session.amount,req.session.debtor,req.session.creditor,req.session.credname,req.session.redir).then((msg)=>{
                req.session.service="";
                req.session.bankid=msg.paymentId;
                res.json({href:msg._links.scaRedirect.href});
            }).catch((error)=>{
                req.session.service="";
                console.log(error);
                res.sendStatus(400);
            })
        } else if(req.session.currentBank==="Santander"){
            var ID= funcionesSantander.uuid();
            funcionesSantander.initiatePayment(req.session.santander_access_token,ID,req.session.amount,req.session.debtor,req.session.creditor,req.session.credname,req.session.redir).then((msg)=>{
                req.session.service="";
                req.session.bankid=msg.paymentId;
                res.json({href:msg._links.scaRedirect.href});
            }).catch((error)=>{
                req.session.service="";
                console.log(error);
                res.sendStatus(400);
            })
        } else {
            req.session.service="";
            res.status(400);
        }
    } else if (req.session.service==="paymentwauth"){
        if(req.session.currentBank==="BBVA"){
            req.session.auth_code=req.query.code;
            funcionesBBVA.getAccessToken(req.query.code).then(msg=>{
                //TODO: store the tokens alongside the transaction in order to check the status, (PREFERED) or put an intermediate step where the tx is polled and checks if it's ACCC
                //(OPT) TODO: In the case of a reinbursment made from IP, if the transaction is stored, store them for the user's transaction or store them in the user's bank variable, and use them for obtaining consent if needed
                req.session.bbva_access_token=msg.access_token;
                var ID= funcionesBBVA.uuid();
                funcionesBBVA.initiatePayment(req.session.bbva_access_token,ID,req.session.amount,req.session.debtor,req.session.creditor,req.session.credname,req.session.redir).then((msg)=>{
                    req.session.service="";
                    req.session.bankid=msg.paymentId;
                    res.redirect(msg._links.scaRedirect.href);
                }).catch((error)=>{
                    req.session.service="";
                    if(req.session.authenticated !== true){
                        req.session.destroy();
                    }
                    console.log(error)
                    res.sendStatus(400);
                })
            }).catch(error => {
                req.session.service="";
                if(req.session.authenticated !== true){
                    req.session.destroy();
                }
                console.log(error);
                res.status(400);
            })
        } else if(req.session.currentBank==="Santander"){
            req.session.auth_code=req.query.code;
            funcionesSantander.getAccessToken(req.query.code).then(msg=>{
                //TODO: store the tokens alongside the transaction in order to check the status, (PREFERED) or put an intermediate step where the tx is polled and checks if it's ACCC
                //(OPT) TODO: In the case of a reinbursment made from IP, if the transaction is stored, store them for the user's transaction or store them in the user's bank variable, and use them for obtaining consent if needed
                req.session.santander_access_token=msg.access_token;
                var ID= funcionesSantander.uuid();
                funcionesSantander.initiatePayment(req.session.santander_access_token,ID,req.session.amount,req.session.debtor,req.session.creditor,req.session.credname,req.session.redir).then((msg)=>{
                    req.session.service="";
                    req.session.bankid=msg.paymentId;
                    res.redirect(msg._links.scaRedirect.href);
                }).catch((error)=>{
                    req.session.service="";
                    if(req.session.authenticated !== true){
                        req.session.destroy();
                    }
                    console.log(error)
                    res.sendStatus(400);
                })
            }).catch(error => {
                req.session.service="";
                if(req.session.authenticated !== true){
                    req.session.destroy();
                }
                console.log(error);
                res.status(400);
            })
        } else {
            req.session.service="";
            if(req.session.authenticated !== true){
                req.session.destroy();
            }
            res.status(400);
        }
    } else if (req.session.service==="SVAPayment"){
        //Checks the bank that processes the payment, initiates payment and returns the state of the payment
        if(req.session.currentBank==="BBVA"){
            req.session.auth_code=req.query.code;
            funcionesBBVA.getAccessToken(req.query.code).then(msg=>{
                req.session.bbva_access_token=msg.access_token;
                var ID = funcionesBBVA.uuid();
                funcionesBBVA.initiateSVAPayment(req.session.bbva_access_token,ID,req.session.amount,req.session.creditor,req.session.credname,req.session.redir).then( async msg=>{
                    req.session.bankid=msg.paymentId;
                    res.redirect(msg._links.scaRedirect.href)
                }).catch(error => {
                    req.session.destroy();
                    console.log(error);
                    res.status(400);
                })
            }).catch(error => {
                req.session.destroy();
                console.log(error);
                res.status(400);
            })
        } else if(req.session.currentBank==="Santander"){
            req.session.auth_code=req.query.code;
            funcionesSantander.getAccessToken(req.query.code).then(msg=>{
                req.session.santander_access_token=msg.access_token;
                var ID = funcionesSantander.uuid();
                funcionesSantander.initiateSVAPayment(req.session.santander_access_token,ID,req.session.amount,req.session.creditor,req.session.credname,req.session.redir).then( async msg=>{
                    req.session.bankid=msg.paymentId;
                    res.redirect(msg._links.scaRedirect.href)
                }).catch(error => {
                    req.session.destroy();
                    console.log(error);
                    res.status(400);
                })
            }).catch(error => {
                req.session.destroy();
                console.log(error);
                res.status(400);
            })
        } else {
            req.session.service="";
            req.session.destroy();
            res.status(400);
        }
    } else {
        //Checks if the user is authenticated, then proceed with the authentication flow. This flow consists on first asking for an access token and then getting the user's consent
        //These flows are different and could not be handled the same way
        //TODO: Should just ask access to account list and access to the account should be requested when it is accessed, at least until the API works properly
        if(req.session.authenticated){
            let user = await BBDD.read(req.session.user);
            if ((req.query.state===req.session.state)){
                if(req.session.currentBank==='BBVA'){
                    if(req.session.step==='pre'){
                        req.session.auth_code=req.query.code;
                        funcionesBBVA.getAccessToken(req.query.code).then(msg=>{
                            let now = new Date();
                            var tokenexpires=now.getTime()+msg.expires_in;
                            req.session.bbva_access_token=msg.access_token;
                            req.session.bbva_refresh_token=msg.refresh_token;
                            req.session.bbva_token_expires=tokenexpires;
                            var ID = funcionesBBVA.uuid();
                            funcionesBBVA.getConsent(req.session.bbva_access_token,ID).then(msg=>{
                                req.session.BBVAconsentId=msg.consentId;
                                for (var i = 0; i < user.banks.length; i++) {
                                    if (user.banks[i].name === "BBVA") {
                                        user.banks[i].access_token = req.session.bbva_access_token;
                                        user.banks[i].refresh_token = req.session.bbva_refresh_token;
                                        user.banks[i].expires = req.session.bbva_token_expires;
                                        user.banks[i].consent_id = req.session.BBVAconsentId;
                                    break;
                                    }
                                }
                                BBDD.update(user);
                                req.session.step="";
                                res.redirect(msg._links.scaRedirect.href);
                            }).catch(error => {
                                //TODO: The response should be more verbose
                                console.log(error);
                                res.status(400);
                            })
                        }).catch(error => {
                            //TODO: The response should be more verbose
                            console.log(error);
                            res.status(400);
                        })
                    } else {
                        //TODO: The response should be more verbose
                        res.status(400);
                    }
                } else if (req.session.currentBank==="Santander") {
                    if(req.session.step==='pre'){
                        req.session.auth_code=req.query.code;
                        funcionesSantander.getAccessToken(req.query.code).then(msg=>{
                            let now = new Date();
                            var tokenexpires=now.getTime()+msg.expires_in;
                            req.session.santander_access_token=msg.access_token;
                            req.session.santander_refresh_token=msg.refresh_token;
                            req.session.santander_token_expires=tokenexpires;
                            var ID = funcionesSantander.uuid();
                            funcionesSantander.getConsent(req.session.santander_access_token,ID).then(msg=>{
                                req.session.santanderconsentId=msg.consentId;
                                for (var i = 0; i < user.banks.length; i++) {
                                    if (user.banks[i].name === "Santander") {
                                        user.banks[i].access_token = req.session.santander_access_token;
                                        user.banks[i].refresh_token = req.session.santander_refresh_token;
                                        user.banks[i].expires = req.session.santander_token_expires;
                                        user.banks[i].consent_id = req.session.santanderconsentId;
                                    break;
                                    }
                                }
                                BBDD.update(user);
                                req.session.step="";
                                res.redirect(msg._links.scaRedirect.href);
                            }).catch(error => {
                                //TODO: The response should be more verbose
                                console.log(error);
                                res.status(400);
                            })
                        }).catch(error => {
                            //TODO: The response should be more verbose
                            console.log(error);
                            res.status(400);
                        })
                    } else {
                        //TODO: The response should be more verbose
                        res.status(400);
                    }
                } else {
                    //TODO: The response should be more verbose
                    res.status(400);
                }
            } else {
                //TODO: The response should be more verbose
                res.status(400);
            }
        } else {
            //TODO: The response should be more verbose
            res.status(400);
        }
    }
});

module.exports = router;

//Obsolete code, used for the old Santander API, may come in handy
/*
if(req.session.step==='pre'){
                        req.session.auth_code=req.query.code;
                        funcionesSantander.getAccessToken(req.query.code).then(msg=>{
                            let now = new Date();
                            var tokenexpires=now.getTime()+(msg.expires_in*1000)
                            req.session.santander_pre_access_token=msg.access_token;
                            req.session.santander_pre_refresh_token=msg.refresh_token;
                            req.session.santander_pre_token_expires=tokenexpires;
                            var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
                            req.session.state = auxstate;
                            funcionesSantander.getConsent(req.session.santander_pre_access_token,auxstate).then(msg=>{
                                req.session.step='cons';
                                req.session.SantanderconsentId=msg.consentId;
                                res.redirect(msg.redirect_uri);
                            }).catch(error => {
                                //TODO: The response should be more verbose
                                console.log(error);
                                res.status(400);
                            })
                        }).catch(error => {
                            //TODO: The response should be more verbose
                            console.log(error);
                            res.status(400);
                        })
                    } else if (req.session.step==='cons'){
                        req.session.auth_code=req.query.code;
                        funcionesSantander.getAccessToken(req.query.code).then(msg=>{
                            let now = new Date();
                            var tokenexpires=now.getTime()+(msg.expires_in*1000)
                            req.session.santander_access_token=msg.access_token;
                            req.session.santander_refresh_token=msg.refresh_token;
                            req.session.santander_token_expires=tokenexpires;
                            for (var i = 0; i < user.banks.length; i++) {
                                if (user.banks[i].name === "Santander") {
                                    user.banks[i].access_token = req.session.santander_access_token;
                                    user.banks[i].pre_access_token = req.session.santander_pre_access_token;
                                    user.banks[i].refresh_token = req.session.santander_refresh_token;
                                    user.banks[i].pre_refresh_token = req.session.santander_pre_refresh_token;
                                    user.banks[i].expires = req.session.santander_token_expires;
                                    user.banks[i].pre_expires = req.session.santander_pre_token_expires;
                                    user.banks[i].consent_id = req.session.SantanderconsentId;
                                break;
                                }
                            }
                            BBDD.update(user)
                            req.session.step='';
                            res.redirect('/main');
                        }).catch(error => {
                            //TODO: The response should be more verbose
                            console.log(error);
                            res.status(400);
                        })
                    } else {
                        //TODO: The response should be more verbose
                        res.status(400);
                    }
*/