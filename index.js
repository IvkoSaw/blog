var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient;

app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var _ = require('underscore');

// var sha1 = require('sha1');
// var fs = require('fs');
// var cookieParser = require('cookie-parser');
// app.use(cookieParser());

app.use(express.static('public'));

app.get('/', function (req,res) {
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for /");
        db.collection("posts")
            .find()
            .toArray(function (err, docs) {
                if(err){
                    return console.log(err);
                }
                db.close();
                res.render("home.ejs", {data: docs})
            });
    });
});

app.get('/posts/:id', function(req, res){
    var docsA;
    var docsP;
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for /posts/...");
        db.collection("posts")
            .find({ _id: req.params.id  })
            .toArray(function (err, docs) {
                if(err){
                    return console.log(err);
                }
                docsP = docs;
                    db.collection("authors")
                        .find({ _id : docsP[0].author })
                        .toArray(function (err, docs) {
                            if(err){
                                return console.log(err);
                            }
                            docsA = docs;
                            getComment(docsP[0].comments);
                        });
            });
    });
    function getComment(post) {
        var arr = [];
        var arrNames = [];
        post.forEach(function (elm) {
            arr.push(elm.author)
        });
        MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
            console.log("Connected correctly to server, for /posts/...");
            var query = [];
            arr.forEach(function (elm) {
                var obj = {};
                obj._id = elm;
                query.push(obj);
            });
            db.collection("authors")
                .find({$or:query})
                .toArray(function (err, docsC) {
                    if (err) {
                        return console.log(err);
                    }
                    docsC.forEach(function (elm) {
                       arrNames.push(elm.name);
                    });
                    db.close();
                    res.render("post.ejs", {
                        post: docsP,
                        name: docsA,
                        commentName: arrNames
                    });
                });
        })

    }
});

app.listen(3000);