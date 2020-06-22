This application has been developed for my end-of-master's-degree project.

It offers 3 folders, two of them being the application and the third being a fake shop to test the endpoints.

The first folder, client, contains all of the interface, the second one, server,contains all of the logic and the third one, shop, contains the fake shop.

In order for this application to run, you need to set-up a few things first:


*A Mongo DB, it can be installed as a native application, or as a docker container. In case you do not use the predetermined port, change it in server/scripts/BBDD


*HTTPS certificates, they should be stored in server/cert, as ssl-key.pem, ssl-cert.pem and certrequest.csr (If required). You can create them with openssl


*Certificates in order to use the bank APIs, they can be obtained in <https://market.apis-i.redsys.es/psd2/xs2a/nodos/bbva>, register your application and get a client id, secret and certificate. Add the identifier and secret to both server/scripts/UtilsBBVA and server/scripts/UtilsSantander. Store the certificate in server/cert, as cert.cer and cert.key.


*If you wish to use the Santander developer's API, <https://developers-sandbox.bancosantander.es/>, there's already some code in server/scripts/oldUtilsSantander, the code needs to be modified if you wish to implement it. You'l need to get your application identifier and client as well, and update the values in server/scripts/oldUtilsSantander

Once you have satisfied the requirements, go to the store and server folders, and execute the command `npm install`

You can then start each one with `npm start`, this will open a server on localhost:8080, the shop, and localhost:3000 (that will redirect you to https:localhost:8000), the application.

You can start by creating an account in the application and then try the services offered. Depending on the project version you download, the shop may be in spanish.

If you want to modify the webpage, after doing so, in oder to update the webpage in the server, head to the server folder, and execute `npm run front`.