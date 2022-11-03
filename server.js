// did this along with Ellie, Hassan, Jasmine, and the cohort that was present.

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

var db, collection;

const url =
  "mongodb+srv://new-user:FYySNVUCpPPPGNRd@cluster0.jrxcjiu.mongodb.net/playlist?retryWrites=true&w=majority";
const dbName = "playlist";

// password: FYySNVUCpPPPGNRd

app.listen(3000, () => {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      db = client.db(dbName);
      console.log("Connected to `" + dbName + "`!");
    }
  );
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  db.collection("songCollection")
    .find()
    .toArray((err, allDocuments) => {
      // sort logic
      // stackoverflow help
      allDocuments.sort((a, b) => parseFloat(b.upVote) - parseFloat(a.upVote));
  
      if (err) return console.log(err);
      res.render("index.ejs", { playlistCollection: allDocuments });
    });
});

app.post("/songCollection", (req, res) => {
  db.collection("songCollection").insertOne(
    {
      artistName: req.body.artistName,
      msg: req.body.msg,
      upVote: 0,
      musicVideo:  req.body.musicVideo,
      heart: false
    },
    (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      res.redirect("/");
    });
});


// update 
app.put("/messages", (req, res) => {
  // heart a song logic
  // click heart, fetch 
  db.collection("songCollection").findOneAndUpdate(
    {name: req.body.name, 
      msg: req.body.msg},
    {
      $set: {
        upVote: req.body.upVote + 1,
      },
    },
    {
      sort: { _id: -1 },
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

app.put("/favorites", (req, res) => {
  // heart a song logic
  // click heart, fetch 

  db.collection("songCollection").findOneAndUpdate({
      name: req.body.name, 
      msg: req.body.msg
    },
    {
      $set: {
        heart: !req.body.heart,
      },
    },
    {
      sort: { _id: -1 },
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
      console.log(result)
    }
  );
});



app.delete("/messages", (req, res) => {
  db.collection("songCollection").findOneAndDelete(
    {name: req.body.name, msg: req.body.msg},
    (err, result) => {
      if (err) return res.send(500, err);
      res.send("Message deleted!");
    }
  );
});
