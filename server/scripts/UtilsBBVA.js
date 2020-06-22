//Dependencies
const crypto = require('crypto');
const axios = require('axios');
const https = require('https');
var fs = require("fs");
const FormData = require('form-data');
const querystring = require('querystring');
//Sandbox URL
const httpHost="https://apis-i.redsys.es:20443/psd2/xs2a/api-entrada-xs2a/services/BBVA";
//Your client-id and secret go here
const client_id='';
//const client_id = '';
const client_secret = '';
//Your certificates go here
const clientSignCer = fs.readFileSync("./cert/cert.cer", 'utf-8');
const clientSignKey = fs.readFileSync("./cert/cert.key", 'utf-8');
const keyId = "";

//This file contains the functions that engage with the BBVA's PSD2 API
//TODO:All the redirect URIs should be updated

const agent = new https.Agent({
    rejectUnauthorized: false
});

module.exports = {
    //TODO: should use a real code verifier with sha-256
    //Function that starts the authentication process by requesting an access code
    getAuthCode:
    async function getAuthCode(state){
        var httpMethod="get";
        var reqPath=`https://apis-i.redsys.es:20443/psd2/xs2a/api-oauth-xs2a/services/rest/BBVA/authorize?response_type=code&client_id=${client_id}&scope=AIS%20PIS%20SVA&state=${state}&redirect_uri=http://localhost:3000/auth&code_challenge=prueba&code_challenge_method=plain`;
        const options = {
            method: httpMethod,
            headers: {
                'accept': 'application/json'
            },
            url: reqPath,
            httpsAgent: agent
        };
        try {
            var auxiliar = await axios(options).then(msg=>{
                console.log('Authorization code request successful');
                return msg.request.res.responseUrl;
            }).catch(error => {
                console.log(error.response)
            });
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
        return auxiliar;
    },
    //TODO: should use a real code verifier
    //Get an access token with the code
    getAccessToken:
    async function getAccessToken(code){
        var httpMethod="post";
        var reqPath="https://apis-i.redsys.es:20443/psd2/xs2a/api-oauth-xs2a/services/rest/BBVA/token";
        var body = `grant_type=authorization_code&client_id=${client_id}&code=${code}&redirect_uri=http://localhost:3000/auth&code_verifier=prueba`;
        body = encodeURI(body);
        let options = {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data:body,
            url: reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Access token request successful');return msg}).catch(error => { 
                console.log(error.response);
                console.log('ERROR')
            });
            return result.data;
            
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //Requests a new access token with the refresh token obtained previously
    //TODO: Test, couldn't be tested as no token expired
    refreshAccessToken:
    async function refreshAccessToken(refresh_token){
        var httpMethod="post";
        var reqPath = `https://apis-i.redsys.es:20443/psd2/xs2a/api-oauth-xs2a/services/rest/BBVA/token?grant_type=refresh_token&client_id=${client_id}&refresh_token=${refresh_token}`;
        let options = {
            method: httpMethod,
            url: reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Access token refresh request successful');return msg}).catch(error => { 
                console.log(error.response);
                console.log('ERROR')
            });
            return result.data;
            
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //Checks the status of the consent
    getConsentStatus:
    async function getConsentStatus(access_token,uuid,consent_id){
        var httpMethod="get";
        var reqPath=`/v1/consents/${consent_id}`;
        //Your certificate
        var certificate = "";
        var digest="47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
        var aux = `digest: SHA-256=${digest}\nx-request-id: ${uuid}`;
        const sign = crypto.createSign('SHA256');
        sign.write(aux);
        sign.end();
        const signature = sign.sign(clientSignKey, 'base64');
        let options = {
            method: httpMethod,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'X-Request-ID':uuid,
                "Digest":`SHA-256=${digest}`,
                "Signature":`keyId="${keyId}",algorithm="SHA-256",headers="digest x-request-id",signature="${signature}"`,
                "TPP-Signature-Certificate":certificate
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Consent status request successful');return msg}).catch(error => {
                if(error.response.data.tppMessages){
                    console.log(error);
                    console.log(error.response.data.tppMessages);
                }else{
                    console.log(error);
                }
                console.log('ERROR')
            });
            return result.data;
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //TODO: Update frequency
    //Requests consent for the access token
    getConsent:
    async function getConsent(pre_access_token,uuid){
        var httpMethod="post";
        var reqPath=`/v1/consents`;
        //Your certificate
        var certificate = "";
        var payload={"access":{"accounts":[],"balances":[],"transactions":[]},"recurringIndicator":true,"validUntil":"9999-12-31","frequencyPerDay":100,"combinedServiceIndicator":true};
        var payload64=Base64.encode(JSON.stringify(payload));
        var digest=crypto.createHash('sha256').update(payload64,"base64").digest("base64");
        var aux = `digest: SHA-256=${digest}\nx-request-id: ${uuid}\ntpp-redirect-uri: http://localhost:3000/main`;
        const sign = crypto.createSign('SHA256');
        sign.write(aux);
        sign.end();
        const signature = sign.sign(clientSignKey, 'base64');
        let options = {
            method: httpMethod,
            headers: {
                'Authorization':`Bearer ${pre_access_token}`,
                'Content-Type':'application/json',
                'X-Request-ID':uuid,
                'TPP-Redirect-URI':"http://localhost:3000/main",
                "Digest":`SHA-256=${digest}`,
                "Signature":`keyId="${keyId}",algorithm="SHA-256",headers="digest x-request-id tpp-redirect-uri",signature="${signature}"`,
                "TPP-Signature-Certificate":certificate
            },
            data:payload,
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('User consent request successful');return msg}).catch(error => {
                if(error.response.data.tppMessages){
                    console.log(error);
                    console.log(error.response.data.tppMessages);
                }else{
                    console.log(error);
                }
                console.log('ERROR')
            });
            return result.data;
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //Request the user's account data
    getAccountData:
    async function getAccountData(access_token,uuid,consent){
        var httpMethod="get";
        var reqPath="/v1/accounts?withBalance=true";
        //Your certificate
        var certificate = "";
        var digest="47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
        var aux = `digest: SHA-256=${digest}\nx-request-id: ${uuid}`;
        const sign = crypto.createSign('SHA256');
        sign.write(aux);
        sign.end();
        const signature = sign.sign(clientSignKey, 'base64');
        let options = {
            method: httpMethod,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'X-Request-ID':uuid,
                "Consent-ID":consent,
                "Digest":`SHA-256=${digest}`,
                "Signature":`keyId="${keyId}",algorithm="SHA-256",headers="digest x-request-id",signature="${signature}"`,
                "TPP-Signature-Certificate":certificate
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Accounts request successful');return msg}).catch(error => {
                console.log(error);
                if(error.response.data.tppMessages){console.log(error.response.data.tppMessages);}
                console.log('ERROR')
            });
            return result;
            
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //TODO: Should recive a date from which to request movements
    //Requests the movements of a given account
    getTransactions:
    async function getTransactions(access_token,iban,uuid,consent){
        var httpMethod="get";
        var reqPath=`/v1/accounts/${iban}/transactions?dateFrom=2017-10-25&bookingStatus=both`;
        //Your certificate
        var certificate = "";
        var digest="47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
        var aux = `digest: SHA-256=${digest}\nx-request-id: ${uuid}`;
        const sign = crypto.createSign('SHA256');
        sign.write(aux);
        sign.end();
        const signature = sign.sign(clientSignKey, 'base64');
        let options = {
            method: httpMethod,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'X-Request-ID':uuid,
                "Consent-ID":consent,
                "Digest":`SHA-256=${digest}`,
                "Signature":`keyId="${keyId}",algorithm="SHA-256",headers="digest x-request-id",signature="${signature}"`,
                "TPP-Signature-Certificate":certificate
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Movements request successful');return msg}).catch(error => {
                console.log(error);
                console.log(error.response.data.tppMessages);
                console.log('ERROR')
            });
            return result;
            
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //TODO: Should receive parameters of the transaction
    //Initiates a payment with all the info
    initiatePayment:
    async function initiatePayment(access_token,uuid,amount,debtor,creditor,credname,redir){
        var httpMethod="post";
        var reqPath=`/v1/payments/instant-sepa-credit-transfers`;
        //Your certificate
        var certificate = "";
        var payload={"instructedAmount":{"currency": "EUR","amount": amount/*"153.50"*/},"debtorAccount":{"iban":debtor/*"ES1801822200120201933578"*/},"creditorAccount":{"iban":creditor/*"ES1111111111111111111"*/},"creditorName":credname/*"Prueba"*/};
        var payload64=Base64.encode(JSON.stringify(payload));
        var digest=crypto.createHash('sha256').update(payload64,"base64").digest("base64");
        var aux = `digest: SHA-256=${digest}\nx-request-id: ${uuid}\ntpp-redirect-uri: ${redir}`;/*http://localhost:3000/main*/
        const sign = crypto.createSign('SHA256');
        sign.write(aux);
        sign.end();
        const signature = sign.sign(clientSignKey, 'base64');
        let options = {
            method: httpMethod,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'Content-Type':'application/json',
                'X-Request-ID':uuid,
                'TPP-Redirect-URI':redir/*"http://localhost:3000/main"*/,
                "Digest":`SHA-256=${digest}`,
                "Signature":`keyId="${keyId}",algorithm="SHA-256",headers="digest x-request-id tpp-redirect-uri",signature="${signature}"`,
                "TPP-Signature-Certificate":certificate,
                "PSU-IP-Address":"127.0.0.1" //TODO: When not used as a prorotype this should indicate the user's IP
            },
            data:payload,
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Payment initiation request successful');return msg}).catch(error => {
                if(error.response.data.tppMessages){
                    console.log(error);
                    console.log(error.response.data.tppMessages);
                }else{
                    console.log(error);
                }
                console.log('ERROR')
            });
            return result.data;
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //TODO: Should receive parameters of the transaction
    //Initiates a payment where the account of the debtor is unknown
    initiateSVAPayment:
    async function initiateSVAPayment(access_token,uuid,amount,creditor,credname,redir){
        var httpMethod="post";
        var reqPath=`/v1/sva/payments/instant-sepa-credit-transfers`;
        //Your certificate
        var certificate = "";
        var payload={"instructedAmount":{"currency": "EUR","amount": amount/*"153.50"*/},"creditorAccount":{"iban":creditor/*"ES1111111111111111111"*/},"creditorName":credname/*"Prueba"*/};
        var payload64=Base64.encode(JSON.stringify(payload));
        var digest=crypto.createHash('sha256').update(payload64,"base64").digest("base64");
        var aux = `digest: SHA-256=${digest}\nx-request-id: ${uuid}\ntpp-redirect-uri: ${redir}`; //http://localhost:3000/main
        const sign = crypto.createSign('SHA256');
        sign.write(aux);
        sign.end();
        const signature = sign.sign(clientSignKey, 'base64');
        let options = {
            method: httpMethod,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'Content-Type':'application/json',
                'X-Request-ID':uuid,
                'TPP-Redirect-URI':redir, //"http://localhost:3000/main",
                "Digest":`SHA-256=${digest}`,
                "Signature":`keyId="${keyId}",algorithm="SHA-256",headers="digest x-request-id tpp-redirect-uri",signature="${signature}"`,
                "TPP-Signature-Certificate":certificate,
                "PSU-IP-Address":"127.0.0.1"
            },
            data:payload,
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('SVA payment initiation request successful');return msg}).catch(error => {
                if(error.response.data.tppMessages){
                    console.log(error);
                    console.log(error.response.data.tppMessages);
                }else{
                    console.log(error);
                }
                console.log('ERROR')
            });
            return result.data;
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //Checks the status of a given transaction
    getTxStatus:
    async function getTxStatus(access_token,uuid,txid){
        var httpMethod="get";
        var reqPath=`/v1/payments/instant-sepa-credit-transfers/${txid}/status`;
        //Your certificate
        var certificate = "";
        var digest="47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
        var aux = `digest: SHA-256=${digest}\nx-request-id: ${uuid}`;
        const sign = crypto.createSign('SHA256');
        sign.write(aux);
        sign.end();
        const signature = sign.sign(clientSignKey, 'base64');
        let options = {
            method: httpMethod,
            headers: {
                'Authorization':`Bearer ${access_token}`,
                'X-Request-ID':uuid,
                "Digest":`SHA-256=${digest}`,
                "Signature":`keyId="${keyId}",algorithm="SHA-256",headers="digest x-request-id",signature="${signature}"`,
                "TPP-Signature-Certificate":certificate
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Transaction status request successful');return msg}).catch(error => {
                console.log(error);
                console.log(error.response.data.tppMessages);
                console.log('ERROR')
            });
            return result;
            
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //UUID generator https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
    uuid:
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }
}

//Base64 functionalities https://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript?rq=1
var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
    
        input = Base64._utf8_encode(input);
    
        while (i < input.length) {
    
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
    
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
    
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
    
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    
        }
    
        return output;
    },
    
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
    
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    
        while (i < input.length) {
    
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
    
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
    
            output = output + String.fromCharCode(chr1);
    
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
    
        }
    
        output = Base64._utf8_decode(output);
    
        return output;
    
    },
    
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
    
        for (var n = 0; n < string.length; n++) {
    
            var c = string.charCodeAt(n);
    
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
    
        }
    
        return utftext;
    },
    
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
    
        while ( i < utftext.length ) {
    
            c = utftext.charCodeAt(i);
    
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
    
        }
    
        return string;
    }
}