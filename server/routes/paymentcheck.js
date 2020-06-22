var express = require('express');
var router = express.Router();
var funcionesBBVA = require('../scripts/UtilsBBVA.js');
var funcionesSantander = require('../scripts/UtilsSantander.js');
var BBDD = require('../scripts/BBDD.js');

//TODO: If the status check fails, it should repeat until it manages to get the status
//TODO: It should also check for the other possibilities of status and act accordingly
//TODO: When an operation ends in a catch, Should it send a fail status? Meanwhile kept as an error
//After the store's user has gone through with the payment, this router checks wether or not it was successful or not
router.get('/', async function(req, res, next) {
    try{
        var user = await BBDD.readID(req.session.shopid);
        if (user !== undefined){
            if(req.session.currentBank==="BBVA"){
                var ID = funcionesBBVA.uuid();
                funcionesBBVA.getTxStatus(req.session.bbva_access_token,ID,req.session.bankid).then(async msg=>{
                    if(msg.data.transactionStatus==="ACSC"){
                        try{
                            //TODO: if debtor account is there, save it
                            var currentdate = new Date(); 
                            var datetime =  currentdate.getDate() + "/"
                                            + (currentdate.getMonth()+1)  + "/" 
                                            + currentdate.getFullYear() + " - "  
                                            + currentdate.getHours() + ":"  
                                            + currentdate.getMinutes() + ":" 
                                            + currentdate.getSeconds();
                            if(req.session.authenticated!==true){
                                if(req.session.debtor!==undefined) {
                                    //TODO: In case the user changes his preferred bank account later, this should store the store's bank account and bank so to reimbursement can take place
                                    user.transactions.unshift({id:req.session.txid,amount:req.session.amount,bank:"BBVA",debtor:req.session.debtor,date:datetime});
                                    BBDD.update(user);
                                } else {
                                    user.transactions.unshift({id:req.session.txid,amount:req.session.amount,bank:"BBVA",date:datetime});
                                    BBDD.update(user); 
                                }
                            }
                        }catch{
                            console.log("Could not save transaction")
                            //TODO: This should not be logged, but offer a different solution in case the transaction is made but not saved
                            console.log({id:req.session.txid,amount:req.session.amount,bank:"BBVA",bankId:msg.paymentId,status:msg.transactionStatus})
                        }
                       //var redir=user.redirecturi+`?id=${req.session.txid}&status=success`
                        //req.session.destroy();
                        req.session.paymentstatus="success";
                        req.session.service="post";
                        res.redirect("/payments");
                    } else {
                        //var redir=user.redirecturi+`?id=${req.session.txid}&status=failed`
                        //req.session.destroy();
                        req.session.paymentstatus="failure";
                        req.session.service="post";
                        res.redirect("/payments");
                    }
                }).catch(error=>{
                    console.log(error);
                    req.session.destroy();
                    res.sendStatus(400);
                })
            }else if (req.session.currentBank==="Santander"){
                var ID = funcionesSantander.uuid();
                funcionesSantander.getTxStatus(req.session.santander_access_token,ID,req.session.bankid).then(async msg=>{
                    if(msg.data.transactionStatus==="ACSC"){
                        try{
                            //TODO: if debtor account is there, save it
                            var currentdate = new Date(); 
                            var datetime =  currentdate.getDate() + "/"
                                            + (currentdate.getMonth()+1)  + "/" 
                                            + currentdate.getFullYear() + " - "  
                                            + currentdate.getHours() + ":"  
                                            + currentdate.getMinutes() + ":" 
                                            + currentdate.getSeconds();
                            if(req.session.authenticated!==true){                
                                if(req.session.debtor!==undefined) {
                                    console.log("undefined")
                                    //TODO: In case the user changes his preferred bank account later, this should store the store's bank account and bank so to reimbursement can take place
                                    user.transactions.unshift({id:req.session.txid,amount:req.session.amount,bank:"Santander",debtor:req.session.debtor,date:datetime});
                                    BBDD.update(user);
                                } else {
                                    console.log("defined")
                                    user.transactions.unshift({id:req.session.txid,amount:req.session.amount,bank:"Santander",date:datetime});
                                    BBDD.update(user); 
                                }
                            }
                        }catch{
                            console.log("Could not save transaction")
                            //TODO: This should not be logged, but offer a different solution in case the transaction is made but not saved
                            console.log({id:req.session.txid,amount:req.session.amount,bank:"Santander",bankId:msg.paymentId,status:msg.transactionStatus})
                        }
                        //var redir=user.redirecturi+`?id=${req.session.txid}&status=success`
                        //req.session.destroy();
                        req.session.paymentstatus="success";
                        req.session.service="post";
                        res.redirect("/payments");
                    } else {
                        //var redir=user.redirecturi+`?id=${req.session.txid}&status=failed`
                        //req.session.destroy();
                        req.session.paymentstatus="failure";
                        req.session.service="post";
                        res.redirect("/payments");
                    }
                }).catch(error=>{
                    console.log(error);
                    req.session.destroy();
                    res.sendStatus(400);
                })
            }else{
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(400);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

module.exports = router;