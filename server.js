//Required for app
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Required models
var db = require("./models");

//Port
var PORT = 3000;

//Express
var app = express();

//Middleware
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//Mongo DB
mongoose.connect("mongodb://localhost/NewsScraperdb", { useNewUrlParser: true });

// Routes

// A GET route for scraping
app.get("/scrape", function(req, res) {

  axios.get("https://www.sciencenews.org/").then(function(response) {
    //Load Cheerio
    var $ = cheerio.load(response.data);

    //Grab each article tag
    $("article").each(function(i, element) {
      //Empty result object
      var result = {};

      // Adds title, summary, link and picture to object to be put into database
      result.title = $(this)
        .children("header")
        .text();
      result.summary = $(this)
        .children("content clearfix")
        .text();  
      result.link = $(this)
        .children("main-image")
        .attr("href");
      result.picture = $(this)
        .children("main-image")
        .attr("img");


      // New Article created using our results object
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

// Gets all scraped articles
app.get("/articles", function(req, res) {
  db.Article.find({}).then(function(dbArticle) {
    res.json(dbArticle);
  })
});

//Grabs a specific Article by id and populates it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
  .populate("note")
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
  .then(function(dbNote){
    return db.Article.findOneAndUpdate({ _id: req.params.id}, { note: dbNote._id}, {new: true});
  }.then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err) {
    res.json(err);
  })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
