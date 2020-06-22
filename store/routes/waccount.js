var express = require('express');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
var router = express.Router();

const agent = new https.Agent({
  rejectUnauthorized: false
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  //res.redirect(`https://localhost:8000/payment?txid=1&shopid=TTDT&bank=BBVA&orgacc=ES7301826208302012068108&amount=100.00&secret=${crypto.createHash('sha256').update("pruebaprueba","base64").digest("base64")}&verifier=prueba`)
  res.redirect(`https://localhost:8000/payment?txid=1&shopid=TTDT&bank=Santander&orgacc=ES0300490001530000000005&amount=100.00&secret=${crypto.createHash('sha256').update("pruebaprueba","base64").digest("base64")}&verifier=prueba`)
  //Hacer post y redirigir a la URL que devuelve
  /*var httpMethod="get";
  var reqPath=`https://localhost:8000/payment`;
  let options = {
      method: httpMethod,
      data:{
        txid:"1",
        shopid:"TTDT",
        bank:"BBVA",
        orgacc:"ES7301826208302012068108",
        amount:"100.00",
        secret:crypto.createHash('sha256').update("pruebaprueba","base64").digest("base64"),
        verifier:"prueba"
      },
      url: reqPath,
      httpsAgent: agent
  };
  try {
    const result = await axios(options).catch(error => {
        console.log(error);
        console.log('ERROR');
      });
      //console.log(result.headers)
      //res.redirect(result.data.href)
  } catch (e) {
      console.log('ERROR:');
      console.log(e.stack);
      console.log(e.name);
      console.log(e.message);
  }*/
});

module.exports = router;