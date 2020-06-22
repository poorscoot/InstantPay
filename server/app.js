var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var http = require('http');
var https = require('https');
var fs = require('fs');
var BBDD = require('./scripts/BBDD.js');

//Routes
var registerRouter = require('./routes/register');
var paymentRouter = require('./routes/payment');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var txRouter = require('./routes/tx');
var pispRouter = require('./routes/pisp');
var banksRouter = require('./routes/banks');
var bankAuthRouter = require('./routes/bankAuth');
var authRouter = require('./routes/auth');
var accountsRouter = require('./routes/accounts');
var loggedRouter = require('./routes/logged');
var movementsRouter = require('./routes/movements');
var getmovementsRouter = require('./routes/getmovements');
var paymentcheckRouter = require('./routes/paymentcheck');
var checkserviceRouter = require('./routes/checkservice');
var endpaymentRouter = require('./routes/endpayment');

//Your server cetificates go here
var sslkey = fs.readFileSync('./cert/ssl-key.pem');
var sslcert = fs.readFileSync('./cert/ssl-cert.pem');
var ca = fs.readFileSync('./cert/certrequest.csr');
var options = {key: sslkey, cert: sslcert, ca: ca};

var app = express();

//Server session
app.use(session({
  secret:"prueba",
  resave: false,
  saveUninitialized: true,
  cookie: {
    saveUninitialized: true,
    secure: false,
    expires: false
  }
  
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//Connect to the DB
BBDD.init(() => {
    console.log('Connected to DB');
});

//As the certificates are self-made, they are not used for the redirectURI, if they are updated, and https://<URL> is used, it sould be bellow the next function
app.use('/auth', authRouter);

//Forces https
app.use(function(req, res, next) {
  if(req.protocol!=='https'){
    console.log("Redirigiendo a https");
    res.redirect("https://localhost:8000");
  }else{next()}
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/main', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/payments', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/pisp', pispRouter);
app.use('/tx', txRouter);
app.use('/register', registerRouter);
app.use('/banks', banksRouter);
app.use('/bankAuth', bankAuthRouter);
app.use('/accounts', accountsRouter);
app.use('/payment', paymentRouter);
app.use('/logged', loggedRouter);
app.use('/movements', movementsRouter);
app.use('/getmovements', getmovementsRouter);
app.use('/paymentcheck', paymentcheckRouter);
app.use('/checkservice', checkserviceRouter);
app.use('/endpayment', endpaymentRouter);

//TODO: serve 404 page that doesn't show the error
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.ejs');
});

//Start the https server
https.createServer(options, app).listen(8000);

module.exports = app;
