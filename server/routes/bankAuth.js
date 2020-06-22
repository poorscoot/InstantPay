var express = require('express');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');

//Receives a bank, checks if the user is authenticated, and starts the authentication flow with that bank
router.get('/', function(req, res, next) {
    if(req.session.authenticated){
        if(req.query.bank==="BBVA"){
            var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
            req.session.state = auxstate;
            req.session.currentBank='BBVA';
            req.session.step='pre';
            funcionesBBVA.getAuthCode(auxstate).then(msg=>{
                res.redirect(msg);
            });
        } else if (req.query.bank==="Santander") {
            var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
            req.session.state = auxstate;
            req.session.currentBank='Santander';
            req.session.step='pre';
            funcionesSantander.getAuthCode(auxstate).then(msg=>{
                res.redirect(msg);
            });
        } else {
            //TODO: The response should be more verbose
            res.status(400);
        }  
    } else {
        //TODO: The response should be more verbose
        res.status(400);
    }
});

module.exports = router;

//Obsolete code, used for the old Santander API, may come in handy
/*
var auxstate = [...Array(10)].map(_=>(Math.random()*36|0).toString(36)).join``;
            req.session.state = auxstate;
            req.session.currentBank='Santander';
            req.session.step='pre';
            res.redirect(funcionesSantander.getAuthCode(auxstate));
*/