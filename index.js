var express = require('express');
var app = express();

// var sha1 = require('sha1');

// var _ = require('underscore');

// var fs = require('fs');

app.set('view engine', 'ejs');

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'));

app.get('/', function (req,res) {});

app.listen(3000);