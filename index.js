var express = require('express');
var app = express();

var mongo = require('mongodb'),
    MongoClient = mongo.MongoClient;


app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var _ = require('underscore');

var sha1 = require('sha1');

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.static('public'));

var pageNow = 1;

app.get('/', function (req,res) {
    pageNow = 1;
    if(req.cookies.email && req.cookies.name){
        var userName = req.cookies.name;
    }
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for /");
        var numOfPosts;
        db.collection("posts")
            .find()
            .count(function (err, docs) {
                if(err){
                    return console.log(err);
                }
                numOfPosts = docs;
                db.collection("posts")
                    .find()
                    .limit(10)
                    .toArray(function (err, docs) {
                        if(err){
                            return console.log(err);
                        }
                        db.close();
                        res.render("home.ejs", {
                            data: docs,
                            numOfPosts: numOfPosts,
                            numOfPage: 1,
                            userName: userName
                        })
                    });
            });
    });
});

app.get("/pages/:id", function (req, res) {
    pageNow = req.params.id;
    var numOfPage = req.params.id;
    if(req.cookies.email && req.cookies.name){
        var userName = req.cookies.name;
    }
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for /pages/...");
        var numOfPosts;
        db.collection("posts")
            .find()
            .count(function (err, docs) {
                if(err){
                    return console.log(err);
                }
                numOfPosts = docs;
                var num = numOfPage*10;
                var arrWithPages = [];
                for (var i = 10; i > 0; i--) {
                    arrWithPages.push(num-i);
                }
                var query = [];
                arrWithPages.forEach(function (elm) {
                    var obj = {};
                    obj.index = elm;
                    query.push(obj);
                });
                console.log(query)
                db.collection("posts")
                    .find({$or:query})
                    .toArray(function (err, docs) {
                        if(err){
                            return console.log(err);
                        }
                        db.close();
                        res.render("home.ejs", {
                            data: docs,
                            numOfPosts: numOfPosts,
                            numOfPage: numOfPage,
                            userName:userName
                        })
                    });
            });
    });
});

app.get("/page/prev", function (req, res) {
   pageNow = --pageNow;
    if(req.cookies.email && req.cookies.name){
        var userName = req.cookies.name;
    }
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for /page/prev");
        var numOfPosts;
        db.collection("posts")
            .find()
            .count(function (err, docs) {
                if(err){
                    return console.log(err);
                }
                numOfPosts = docs;
                var num = pageNow*10;
                var arrWithPages = [];
                for (var i = 10; i > 0; i--) {
                    arrWithPages.push(num-i);
                }
                var query = [];
                arrWithPages.forEach(function (elm) {
                    var obj = {};
                    obj.index = elm;
                    query.push(obj);
                });
                db.collection("posts")
                    .find({$or:query})
                    .toArray(function (err, docs) {
                        if(err){
                            return console.log(err);
                        }
                        db.close();
                        res.render("home.ejs", {
                            data: docs,
                            numOfPosts: numOfPosts,
                            numOfPage: pageNow,
                            userName:userName
                        })
                    });
            });
    });
});

app.get("/page/next", function (req, res) {
    pageNow = ++pageNow;
    if(req.cookies.email && req.cookies.name){
        var userName = req.cookies.name;
    }
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for /page/prev");
        var numOfPosts;
        db.collection("posts")
            .find()
            .count(function (err, docs) {
                if(err){
                    return console.log(err);
                }
                numOfPosts = docs;
                var num = pageNow*10;
                var arrWithPages = [];
                for (var i = 10; i > 0; i--) {
                    arrWithPages.push(num-i);
                }
                var query = [];
                arrWithPages.forEach(function (elm) {
                    var obj = {};
                    obj.index = elm;
                    query.push(obj);
                });
                db.collection("posts")
                    .find({$or:query})
                    .toArray(function (err, docs) {
                        if(err){
                            return console.log(err);
                        }
                        db.close();
                        res.render("home.ejs", {
                            data: docs,
                            numOfPosts: numOfPosts,
                            numOfPage: pageNow,
                            userName: userName
                        })
                    });
            });
    });
});

app.get('/posts/:id', function(req, res){
    var docsA;
    var docsP;
    if(req.cookies.email && req.cookies.name){
        var userName = req.cookies.name;
    }
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for /posts/...");
        db.collection("posts")
            .find({_id: mongo.ObjectId(req.params.id)})
            .toArray(function (err, docs) {
                if(err){
                    return console.log(err);
                }
                docsP = docs;
                    db.collection("authors")
                        .find({ _id : mongo.ObjectId(docsP[0].author) })
                        .toArray(function (err, docs) {
                            if (err) {
                                return console.log(err);
                            }
                            docsA = docs;
                            var comments = docsP[0].comments;
                            if (comments.length === 0) {
                                db.close();
                                res.render("post.ejs", {
                                    post: docsP,
                                    name: docsA
                                });
                            } else {
                                var arr = [];
                                comments.forEach(function (elm) {
                                    arr.push(elm.author.toString())
                                });
                                var authorsOfComments = [];
                                arr.forEach(function (elm, key, arr) {
                                    db.collection("authors")
                                        .find({'_id':mongo.ObjectId(elm)})
                                        .project({_id:true, name:true})
                                        .toArray(function (err, docsC) {
                                            if (err) {
                                                return console.log(err);
                                            }
                                            authorsOfComments.push(docsC[0]);
                                            if (arr.length-1 === key) {
                                                db.close();
                                                res.render("post.ejs", {
                                                    post: docsP,
                                                    name: docsA[0].name,
                                                    commentName: authorsOfComments,
                                                    userName:userName
                                                });
                                            }
                                        });
                                });
                            }
                        });
            });
    });
});

app.post('/sign-up', function (req, res) {
    var name = req.body.name;
    var age = req.body.age;
    var email = req.body.email;
    var password = sha1(req.body.password);
    var rePassword = sha1(req.body.rePassword);
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    if(name.length <= 1 || age.length == 0 || !validateEmail(email) || password.length < 6 || password != rePassword || rePassword == ""){
        res.status(406);
        res.send('validation error');
    }else{
        MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
            console.log("Connected correctly to server, for sign up");
            db.collection("authors")
                .insertOne({
                    age: age,
                    name: name,
                    email: email,
                    password: password
                }, function (err) {
                    if (err) {
                        console.log(err);
                        db.close();
                        res.status(500);
                        res.send('server error');
                    }else{
                        db.close();
                        res.cookie("email", email, {
                            maxAge:1000*60*60*24*30
                        });
                        res.cookie("name", name, {
                            maxAge:1000*60*60*24*30
                        });
                        res.send('success');
                    }
                })
        });

    }
});

app.post('/sign-in', function(req,res){
    MongoClient.connect("mongodb://localhost:27017/blog", function (err, db) {
        console.log("Connected correctly to server, for sign in");
        var email = req.body.email;
        db.collection("authors")
            .find({email:email})
            .toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    db.close();
                    res.status(500);
                    return res.redirect('/');
                }else{
                    db.close();
                    if (docs.length === 0) {
                        res.status(500);
                        return res.redirect(req.get('referer'));
                    }
                    if (docs[0].password == sha1(req.body.password)){
                        res.cookie("email", email, {
                            maxAge:1000*60*60*24*30
                        });
                        res.cookie("name", docs[0].name, {
                            maxAge:1000*60*60*24*30
                        });
                        res.redirect(req.get('referer'));
                    }else{
                        res.status(500);
                        res.redirect(req.get('referer'));
                    }
                }
            })
    });
});

app.post('/sign-out', function(req,res){
    res.clearCookie('email');
    res.clearCookie('name');
    res.redirect(req.get('referer'));
});

app.listen(3003);