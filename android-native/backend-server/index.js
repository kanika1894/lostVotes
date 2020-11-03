const express = require('express')
const app = express()
const port = 3000
var mysql = require('mysql');

app.get('/', (req, res) => {
  res.send('Hello World!')
});

var con = mysql.createConnection({
  host: "localhost",
  user: "<your_user>",
  password: "<your_password>",
  database: "lostVotes"
});

app.get('/getConstituency', (req, res) => {
  console.log(req.query.aadhar);
  res.setHeader('Content-Type', 'application/json');
  let query = "select constituency from voter_registrations where aadharid="+req.query.aadhar+";";
  con.query(query, function(err, result) {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      res.end(JSON.stringify({ constituency: result[0].constituency }));
    }
  };
});

app.get('/votingEnabled', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  console.log(req.query.constituency);
  let query = "select * from constituency_election where constituency in (select constituency from voter_registrations where aadharid="+req.query.aadhar+")";
  con.query(query, function(err, result) {
    if (err) {
      throw err;
    }
    if(result.length > 0) {
      console.log(result[0]);
      console.log(result[0].isvoting);
      if (result[0].isvoting == 1) {
        res.end(JSON.stringify({ isVotingEnabled: true }));
      }
      else {
        res.end(JSON.stringify({ isVotingEnabled: false }));
      }
    }
    else {
      res.end(JSON.stringify({ isVotingEnabled: false }));
    }
  });
});

app.get('/isVoterRegistered', (req, res) => {
  console.log(req.query.aadhar);
  let isRegistered = false;
  res.setHeader('Content-Type', 'application/json');
  var sql = "select isregistered from voter_registrations where aadharid="+req.query.aadhar+";";
  con.query(sql, function (err, result) {
    if (err) {
      isRegistered = false;
    }
    if (result.length > 0) {
      console.log("Result: " + result);
      console.log(result[0].isregistered);
      console.log('here');
      res.end(JSON.stringify({ isRegistered: true }));
    }
    else {
      res.end(JSON.stringify({ isRegistered: false }));
    }
    });
});

app.get('/registerVoter', (req, res) => {
  var sql = "insert into voter_registrations (aadharid, isRegistered, constituency) values ("+req.query.aadhar+", true, 'Kothrud, Pune (210)');"; // set constituency of choice as can't access any direct api yet.
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
    });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ isRegistered: true }));
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
