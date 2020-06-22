var express = require('express');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');
var BBDD = require('../scripts/BBDD.js');

//TODO: todo
//Receives a reinbursment requet, checks the data and sends it
//TODO: if the payment is from a user and if the user is not logged in to the bank, he should be redirected to simple login (Not access to acc)
router.post('/', async function(req, res, next) {
    if(req.session.authenticated===true){
        if(req.session.user===req.body.user){
            try{
                let user = await BBDD.read(req.session.user);
                if (user!==undefined){
                    if(user.prefaccbank==='BBVA'){
                        //If the user is not authenticated in the bank only ask for an auth token without consent, as it is not needed, otherwise use the already existing token
                        if(user.banks.length>0){
                            for(let i =0; i<user.banks.length; i++){
                                if(user.banks[i].name==="BBVA"){
                                    var aux = user.banks[i].access_token;
                                    var auxt = user.banks[i].expires;
                                    let t = new Date();
                                    let now = t.getTime();
                                    if((aux !== "") && (auxt!=='' && auxt>(now+60000))){
                                        req.session.amount=req.body.amount;
                                        req.session.debtor=user.prefacc;
                                        req.session.creditor=req.body.destacc;
                                        req.session.shopid=user.shop_id;
                                        if(req.body.credname!==undefined){
                                            req.session.credname=req.body.credname;
                                        } else {
                                            req.session.credname="User of "+user.shop_id;
                                        }
                                        req.session.txid=req.body.txid;
                                        req.session.bbva_access_token=user.banks[i].access_token;
                                        req.session.redir="https://localhost:8000/paymentcheck";
                                        req.session.currentBank='BBVA';
                                        req.session.service='payment';
                                        res.redirect('/auth')
                                    } else {
                                        var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
                                        req.session.state = auxstate;
                                        req.session.amount=req.body.amount;
                                        req.session.debtor=user.prefacc;
                                        req.session.creditor=req.body.destacc;
                                        req.session.shopid=user.shop_id;
                                        if(req.body.credname!==undefined){
                                            req.session.credname=req.body.credname;
                                        } else {
                                            req.session.credname="User of "+user.shop_id;
                                        }
                                        req.session.txid=req.body.txid;
                                        req.session.redir="https://localhost:8000/paymentcheck";
                                        req.session.currentBank='BBVA';
                                        req.session.service='paymentwauth';
                                        funcionesBBVA.getAuthCode(auxstate).then(msg=>{
                                            res.json({href:msg});
                                        });
                                    }
                                }
                            }
                        }  else {
                            res.sendStatus(400);
                        }
                    } else if(user.prefaccbank==='Santander'){
                        //If the user is not authenticated in the bank only ask for an auth token without consent, as it is not needed, otherwise use the already existing token
                        if(user.banks.length>0){
                            for(let i =0; i<user.banks.length; i++){
                                if(user.banks[i].name==="Santander"){
                                    var aux = user.banks[i].access_token;
                                    var auxt = user.banks[i].expires;
                                    let t = new Date();
                                    let now = t.getTime();
                                    if((aux !== "") && (auxt!=='' && auxt>(now+60000))){
                                        req.session.amount=req.body.amount;
                                        req.session.debtor=user.prefacc;
                                        req.session.creditor=req.body.destacc;
                                        req.session.shopid=user.shop_id;
                                        if(req.body.credname!==undefined){
                                            req.session.credname=req.body.credname;
                                        } else {
                                            req.session.credname="User of "+user.shop_id;
                                        }
                                        req.session.txid=req.body.txid;
                                        req.session.santander_access_token=user.banks[i].access_token;
                                        req.session.redir="https://localhost:8000/paymentcheck";
                                        req.session.currentBank='Santander';
                                        req.session.service='payment';
                                        res.redirect('/auth')
                                    } else {
                                        var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
                                        req.session.state = auxstate;
                                        req.session.amount=req.body.amount;
                                        req.session.debtor=user.prefacc;
                                        req.session.creditor=req.body.destacc;
                                        req.session.shopid=user.shop_id;
                                        if(req.body.credname!==undefined){
                                            req.session.credname=req.body.credname;
                                        } else {
                                            req.session.credname="User of "+user.shop_id;
                                        }
                                        req.session.txid=req.body.txid;
                                        req.session.redir="https://localhost:8000/paymentcheck";
                                        req.session.currentBank='Santander';
                                        req.session.service='paymentwauth';
                                        funcionesSantander.getAuthCode(auxstate).then(msg=>{
                                            res.json({href:msg});
                                        });
                                    }
                                }
                            }
                        }  else {
                            res.sendStatus(400);
                        }
                    } else {
                        res.sendStatus(400);
                    }
                } else {
                    res.sendStatus(400);
                }
            } catch (error) {
                console.log(error)
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;