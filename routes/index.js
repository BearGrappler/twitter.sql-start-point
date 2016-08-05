'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT name, content, tweets.id FROM tweets JOIN users ON users.id = tweets.userid', function (err, result) {
       // console.log(result)
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){

    client.query('SELECT users.name, tweets.content FROM tweets JOIN users ON users.id = tweets.userid WHERE users.name = $1', [req.params.username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweetsForNameFromDB = result.rows.filter( function(tweetObj){
        return tweetObj.name === req.params.username;
      });
      res.render('index', { title: 'Twitter.js', tweets: tweetsForNameFromDB, showForm: true, username: req.params.username });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    // console.log('We entered tweet id!')
    // console.log('heres the id', req.params.id, 'heres the type for the id', typeof req.params.id );
    client.query('SELECT tweets.id, users.name, tweets.content FROM tweets JOIN users ON users.id = tweets.userid WHERE tweets.id = $1', [req.params.id], function (err, result) {
      // console.log('tweet id result query ', result.rows);
      if (err) return next(err); // pass errors to Express
      // var tweetIDFromDB = result.rows.filter( function(tweetObj){
      //   return tweetObj.id === req.params.id;
      // });
      res.render('index', { title: 'Twitter.js', tweets: result.rows});
      });
  });





  // create a new tweet
  router.post('/tweets', function(req, res, next){

     //check if the user is a new user
      // var newTweet = tweetBank.add(req.body.name, req.body.content);
        //tweet comprises of two things
    //1. tweet content -> goes to tweet table
    //2. user who wrote and tweeted the tweet -> user table
    //Note we do not have to worry about primary keys because the tables auto-increment

      //check user exists already in the user table? if
      var userid;
      console.log('we entered the post!')
      console.log('Heres the request body name,', req.body.name);
      client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function (err, result){

        console.log("result rows are here ", result.rows);

        if(result.rows[0].id === undefined){
          userid = undefined;
        }
        else{userid = result.rows[0].id;}
        // console.log('inside query scope ' , userid);


       if(userid === undefined){
          console.log("we're in the undefined ");
          client.query('INSERT INTO Users (name, pictureUrl) VALUES ($1,$2);', [req.body.name, 'http://i.imgur.com/VUNS51q.jpg'], function (err, result) {
          console.log('tweet id result query ', result.rows);
          if (err) return next(err)
        })}

        client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function (err, result){
        if(result.rows[0].id === undefined){
          userid = undefined;
        }
        else{userid = result.rows[0].id;}
        })
      })


        //note queries are asynchronous

      // console.log(' we got past the if');
      // console.log("should be defined", userid

      //     //undefined has a user id at this stage
      //   client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function (err, result){
      //   if(result.rows[0].id === undefined){
      //     userid = undefined;
      //   }
      //   else{userid = result.rows[0].id;}
      //   })
      // }

      console.log(userid);

      //     client.query('INSERT INTO tweets', [req.body.content], function (err, result) {
      //       if (err) return next(err);
      //     })
      //     // pass errors to Express
      //     // var tweetIDFromDB = result.rows.filter( function(tweetObj){
      //     //   return tweetObj.id === req.params.id;
      //     // });
      //     res.render('index', { title: 'Twitter.js', tweets: result.rows});
      //     });
      // }


      // client.query('INSERT INTO tweets (', [req.params.id], function (err, result) {
      // console.log('tweet id result query ', result.rows);
      // if (err) return next(err); // pass errors to Express
      // // var tweetIDFromDB = result.rows.filter( function(tweetObj){
      // //   return tweetObj.id === req.params.id;
      // // });
      // res.render('index', { title: 'Twitter.js', tweets: result.rows});
      // });


    //point of sockets is so that users twitter page automatically updates if a new tweet is posted which is what the event emitter is listening for.

    // io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');


  });


  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
