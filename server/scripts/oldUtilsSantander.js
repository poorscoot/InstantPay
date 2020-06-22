//Dependencies
const crypto = require('crypto');
const axios = require('axios');
const https = require('https');
const FormData = require('form-data');
const querystring = require('querystring');
//Sandbox URL
const httpHost="https://apis-sandbox.bancosantander.es/canales-digitales/sb";
//Your client-id and secret go here
const client_id = '';
const client_secret = '';

//This file contains the functions that engage with the Santander's PSD2 API
//TODO:All the redirect URIs should be updated

const agent = new https.Agent({
    rejectUnauthorized: false
});

module.exports = {
    //Function that starts the authentication process by requesting an access code
    getAuthCode:
    function getAuthCode(state){
        var reqPath=`/prestep-authorize?client_id=${client_id}&response_type=code&state=${state}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth`;
        return httpHost + reqPath;
    },
    //Get an access token with the code
    getAccessToken:
    async function getAccessToken(code){
        var base64secret = Base64.encode(`${client_id}:${client_secret}`);
        var httpMethod="post";
        var reqPath="/v2/token";
        var body = `grant_type=authorization_code&code=${code}&redirect_uri=http://localhost:3000/auth`;
        body = encodeURI(body);
        let options = {
            method: httpMethod,
            headers: {
                'Authorization': `Basic ${base64secret}` ,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data:body,
            url: httpHost + reqPath,
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
    //Check if the access token has expired or not, not used
    checkAccessToken:
    async function checkAccessToken(access_token){
        var httpMethod="get";
        var reqPath="/introspect/";
        let options = {
            method: httpMethod,
            headers: {
                'Authorization': `Bearer ${access_token}` ,
                'Accept': 'application/json',
                'X-IBM-Client-Id': client_id
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Access token check successful');return msg}).catch(error => { 
                console.log(error.response);
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
    //Requests a new access token with the refresh token obtained previously
    refreshAccessToken:
    async function refreshAccessToken(refresh_token){
        var base64secret = Base64.encode(`${client_id}:${client_secret}`);
        var httpMethod="post";
        var reqPath="/v2/token";
        var body = `grant_type=refresh_token&refresh_token=${refresh_token}&redirect_uri=http://localhost:3000/auth`;
        body = encodeURI(body);
        let options = {
            method: httpMethod,
            headers: {
                'Authorization': `Basic ${base64secret}` ,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data:body,
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Access token refresh successful');return msg}).catch(error => { 
                console.log(error.response.data);
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
    async function getConsent(access_token,state){
        var httpMethod="post";
        var reqPath=`/v2/authorize/?client_id=${client_id}&redirect_uri=http://localhost:3000/auth&state=${state}&response_type=code`;
        reqPath = encodeURI(reqPath);
        let options = {
            method: httpMethod,
            headers: {
                'Authorization': `Bearer ${access_token}` ,
                'Accept':'application/json',
                'Content-Type': 'application/json'
            },
            data:{
                "access": {
                    "accounts": [],
                    "balances": [],
                    "transactions": []
                },
                "recurringIndicator": true,
                "validUntil": "9999-12-31",
                "frequencyPerDay": 5
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Consent request successful');return msg}).catch(error => { 
                if(error.response.status===403){
                    return error.response.data
                } else {
                    console.log(error.response);
                    console.log('ERROR')
                }
            });
            return result;
        } catch (e) {
            console.log('ERROR:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    },
    //Checks the status of the consent
    getConsentStatus:
    async function getConsentStatus(access_token,consent_id){
        var httpMethod="get";
        var reqPath=`/v2/authorize/${consent_id}/status?client_id=${client_id}`;
        let options = {
            method: httpMethod,
            headers: {
                'Authorization': `Bearer ${access_token}` ,
                'Accept':'application/json'
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Consent status request successful');return msg}).catch(error => { 
                console.log(error.response.data);
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
    //TODO: psu_active should be modified
    //Request the user's account data
    getAccountData:
    async function getAccountData(access_token,interaction_id){
        var httpMethod="get";
        var reqPath="/v2/accounts/";
        let options = {
            method: httpMethod,
            headers: {
                'Authorization': `Bearer ${access_token}` ,
                'Accept': 'application/json',
                'X-IBM-Client-Id': client_id,
                'psu_active': 0,
                'interaction_id': interaction_id
            },
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Account data request successful');return msg}).catch(error => { 
                console.log(error.response);
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
    //TODO: Request parameters should be modified
    //Requests the movements of a given account
    getTransactions:
    async function getTransactions(access_token,iban,interaction_id){
        var httpMethod="post";
        var reqPath=`/v2/movements/${iban}`;
        var body = {"redirect_uri":"http://localhost:3000/auth","state":"movement-request","movement":"BOTH","date_to":"2017-10-01","date_from":"2017-08-05","amount_to":100,"amount_from":0};
        let options = {
            method: httpMethod,
            headers: {
                'Authorization': `Bearer ${access_token}` ,
                'Accept': 'application/json',
                'content-type': 'application/json',
                'X-IBM-Client-Id': client_id,
                'psu_active': 1,
                'interaction_id': interaction_id
            },
            data:body,
            url: httpHost + reqPath,
            httpsAgent: agent
        };
        try {
            const result = await axios(options).then((msg)=>{console.log('Movements request successful');return msg}).catch(error => { 
                console.log(error.response);
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
    //TODO: todo
    //Initiates a payment with all the info
    initiatePayment:
    async function initiatePayment(pre_access_token,interaction_id){
        var httpMethod="POST";
        var reqPath="/v2/payment-initiation";
        var payload = JSON.stringify({
            "redirect_uri": "http://localhost:3000/main",
            "value": {
                "amount": "100.00",
                "currency": "EUR"
            },
            "type": "sepa_credit_transfer",
            "spending_policy": "SHARED",
            "beneficiary_data": {
                "residence_country": "ES",
                "account_name": "Gateway Payments ES euGBHm",
                "account_to": "ES8801826154820201528264"
            }
          });
        const options = {
            method: httpMethod,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${pre_access_token}` ,
                'Content-Type': 'application/json',
                //'interaction_id': interaction_id,
                'X-IBM-Client-Id': client_id
            },
            data: payload,
            url: httpHost + reqPath,
            httpAgent: agent
        };
        try {
            const auxiliar = await axios(options).catch(error => {
                console.log(error.response)
            });
            console.log('Account Information request successful!');
            return auxiliar;
        } catch (e) {
            console.log('ERROR INEXPLICABLE:\n');
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
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

//Old code
/*function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function lengthInUtf8Bytes(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}*/