var MongoClient = require('mongodb').MongoClient;
var sanitize = require('mongo-sanitize');

//Manages the Mongo DB

//Could be updated to offer structured data persistence, with Mongoose or perhaps sequelize

//Your DB's URL
var db_url = 'mongodb://localhost:27017';

var db;
var col;
module.exports = {
    //Connects to the database, must be done beofre calling any other DB function
    init:
    async function (callback) {
        console.log('Connecting to the database', db_url, '...');
        const client = new MongoClient(db_url,{useNewUrlParser: true});
        try{
            await client.connect();
            db = client.db('instantpay');
            col = db.collection('users');
            console.log('Successfully connected to the database.');
            callback();
        } catch (err) {
            console.log('Could not connect to the database. Reason:');
            console.log(err.stack);
        }
    },
    //Create a new user with the received data
    //This is a prototype, so the user, their bank account and transactions are all stored together. For better data management, they should be stored separately
    //The user secret should be randomly generated and sent to the user in a safe way with the email
    //
    create:
    async function (user) {
        try{
            var data={
                user_id: sanitize(user.user),
                password: sanitize(user.password),
                banks: user.bancos.map((item)=>{return ({name:sanitize(item), access_token:"", refresh_token:"",expires:"", consent_id:"",accounts:[]})}),
                email: sanitize(user.email),
                prefacc: sanitize(user.depositaccount),
                prefaccbank: sanitize(user.prefaccbank),
                redirecturi:sanitize(user.redirecturi),
                shop_id:sanitize(user.shopid),
                userSecret:"prueba",
                transactions:[]
            };
            let promise = await col.insertOne(data);
            if (promise.insertedCount === 1){
                console.log("Success on creating user.")
                return;
            } else {
                console.log("Failure on creating user.")
            }
        } catch (err){
            console.log("An error has ocurred while creating the user. Error:")
            console.log(err.stack);
        }
    },
    //Finds and returns the user with the recived id
    read:
    async function (userId) {
        try {
            let user = await col.find({user_id: sanitize(userId)}).limit(1).toArray();
            return user[0];
        } catch (err) {
            console.log("An error has ocurred while getting the user. Error:")
            console.log(err.stack);
        }
    },
    //Finds the user with the matching identifier for payments
    readID:
    async function (shopid) {
        try {
            let user = await col.find({shop_id: sanitize(shopid)}).limit(1).toArray();
            return user[0];
        } catch (err) {
            console.log("An error has ocurred while getting the user. Error:")
            console.log(err.stack);
        }
    },
    //Updates the received user
    //TODO: sanitize "data", as it can be dangerous, as of now it's only called inside the app, but when users can change their data, it's a new vector of attack
    update:
    async function (data) {
        try {
            let promise = await col.updateOne({_id: data._id},{$set:data});
            if (promise.matchedCount === 1 && promise.modifiedCount === 1){
                console.log("The user has been updated.");
                return;
            } else if (promise.matchedCount === 0) {
                console.log("The user could not be found.");
            } else if (promise.modifiedCount === 0){
                console.log("The user could not be updated.");
            } else {
                console.log("The user could not be updated due to an unknown error.");
            }
        } catch (err) {
            console.log("An error has ocurred while updating the user. Error:")
            console.log(err.stack);
        }
    },
    //Deletes the user with the received id
    delete:
    async function (userId) {
            try {
            let promise = await col.deleteOne({restaurant_id: sanitize(userId)});
            if (promise.deletedCount === 1){
                console.log("The restaurant has been deleted.")
                return;
            } else {
                console.log("The restaurant could not be deleted.");
            }
        } catch (err) {
            console.log("An error has ocurred while deleting the restaurant. Error:")
            console.log(err.stack);
        }
    }
}
    