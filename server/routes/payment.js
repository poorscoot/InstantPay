var express = require('express');
const crypto = require('crypto');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');
var BBDD = require('../scripts/BBDD.js');

//TODO: Starting a different type of payment mid-payment, fails, as service is saved
//Receives a payment request, with some info (might receive bank and account, or not (00, 10, 11)) and redirects to a page that shows possible banks or just redirects to the bank it it's known
router.get('/', async function(req, res, next) {
    if (req.session.service==='startSVApayment'){
        if(req.query.bank==="BBVA"){
            req.session.currentBank=req.query.bank;
            req.session.service='SVAPayment';
            funcionesBBVA.getAuthCode(auxstate).then(msg=>{
                res.redirect(msg);
            });
        } else if(req.query.bank==="Santander"){
            req.session.currentBank=req.query.bank;
            req.session.service='SVAPayment';
            funcionesSantander.getAuthCode(auxstate).then(msg=>{
                res.redirect(msg);
            });
        } else {
            //TODO: The response should be more verbose
            res.status(400);
        }
    } else if (req.session.service==='startpaymentwauth') {
        if(req.session.currentBank==="BBVA"){
            req.session.service='paymentwauth';
            funcionesBBVA.getAuthCode(auxstate).then(msg=>{
                res.redirect(msg);
            });
        } else if(req.session.currentBank==="Santander"){
            req.session.service='paymentwauth';
            funcionesSantander.getAuthCode(auxstate).then(msg=>{
                res.redirect(msg);
            });
        } else {
            //TODO: The response should be more verbose
            res.status(400);
        }
    } else{
        try{
            var user = await BBDD.readID(req.query.shopid);
            if (user !== undefined){
                if(req.query.secret === crypto.createHash('sha256').update(user.userSecret+req.query.verifier,"base64").digest('base64')){
                    if(req.query.orgacc!==undefined && req.query.bank!==undefined){
                        if(req.query.bank==="BBVA"){
                            var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
                            req.session.amount=req.query.amount;
                            req.session.debtor=req.query.orgacc;
                            req.session.creditor=user.prefacc;
                            req.session.credname=user.shop_id;
                            req.session.shopid=req.query.shopid;
                            req.session.txid=req.query.txid;
                            req.session.state = auxstate;
                            //req.session.redir=user.redirecturi;
                            req.session.redir="https://localhost:8000/paymentcheck"
                            req.session.currentBank='BBVA';
                            req.session.service='startpaymentwauth';
                            res.redirect("https://localhost:8000/payments");
                        } else if (req.query.bank==="Santander") {
                            var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
                            req.session.amount=req.query.amount;
                            req.session.debtor=req.query.orgacc;
                            req.session.creditor=user.prefacc;
                            req.session.credname=user.shop_id;
                            req.session.shopid=req.query.shopid;
                            req.session.txid=req.query.txid;
                            req.session.state = auxstate;
                            //req.session.redir=user.redirecturi;
                            req.session.redir="https://localhost:8000/paymentcheck"
                            req.session.currentBank='Santander';
                            req.session.service='startpaymentwauth';
                            res.redirect("https://localhost:8000/payments");
                        } else {
                            //TODO: The response should be more verbose
                            res.status(400);
                        }  
                    } else {
                        //TODO: almacenar la info en sesión, y volver aquí, guardar cosas en sesión, mira, puede valer para lo otro
                        if(req.session.service===undefined){
                            req.session.amount=req.query.amount;
                            req.session.shopid=req.query.shopid;
                            req.session.txid=req.query.txid;
                            req.session.creditor=user.prefacc;
                            req.session.credname=user.shop_id;
                            //req.session.redir=user.redirecturi;
                            req.session.redir="https://localhost:8000/paymentcheck"
                            req.session.service='startSVApayment';
                            res.redirect("https://localhost:8000/payments");
                        }else {
                            //TODO: The response should be more verbose
                            res.status(400);
                        }
                    }
                } else {
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(400);
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(400);
        }
    }
});

module.exports = router;