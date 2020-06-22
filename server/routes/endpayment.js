var express = require('express');
var router = express.Router();
var BBDD = require('../scripts/BBDD.js');

//Logs out the user
//TODO: should use another endpoint for logout after payment, this component should just logout the user, not have added functionality
router.get('/', async function(req, res, next) {
    try{
        if(req.session.authenticated===true){
            req.session.service="";
            res.json({href:"/main"});
        }else{
        var user = await BBDD.readID(req.session.shopid);
        if (user !== undefined){
            if(req.session.paymentstatus==="success"){
            var redir = user.redirecturi+`?id=${req.session.txid}&status=success`
            req.session.destroy();
            res.json({href:redir});
            }else{
            var redir = user.redirecturi+`?id=${req.session.txid}&status=failed`
            req.session.destroy();
            res.json({href:redir});
            }
        } else {
            req.session.destroy();
            res.sendStatus(200);
        }
        }
    } catch (error){
        req.session.destroy();
        res.sendStatus(200);
    }
});

module.exports = router;