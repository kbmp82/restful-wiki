//jshint esversion:6

const express = require("express");
//const _ = require("lodash");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//connect to MongoDB
mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser:true});

//create Schema for DB
const articleSchema = {
  title: String,
  content: String
};
//inform Mongo to use this schema in a collection called articles
const Article = mongoose.model("Article",articleSchema);

//chain routes together so it checks each one
app.route("/articles")
.get(function(req,res){
  Article.find({}, function(err, results) {
      if(!err){
        if(results.length != 0){
          res.send(results);
        }
      }else{
          res.send(err);
      }
    //  res.render("articles",{homeStartingContent:homeStartingContent, posts:allArticles});
    });
})
.post(function(req,res){
  const title = req.body.title;
  const content = req.body.content;
  if(title.length > 2 && content.length > 2 ){
  const newArticle = new Article({
    title: title,
    content: content
  });
  newArticle.save(function(err){
    if(!err){
    res.send('document added');
  }else{
    res.send(err);
  }
  });

}else{
  console.log('you didnt write anything!');
}

})
.delete(function(req,res){
Article.remove({},function(err){
if(err){
    res.send(err);
  }else{
    res.send('all articles deleted');
  }
});


});
////////////////////////// Manipulate a singel article/////////////////////////////////
app.route("/articles/:articleTitle")
.get(function(req,res){
  const title = req.params.articleTitle;
  Article.findOne({title:title}, function(err, results) {
      if(!err){
        if(results){
          res.send(results);
        }
      }else{
          res.send(err);
      }
    });
})
.put(function(req,res){
  const originalTitle = req.params.articleTitle;
  const newTitle = req.body.title;
  const newBody = req.body.content;
  if(newTitle.length > 2 && newBody.length > 2 ){
    Article.findOne({title:originalTitle}, function(err, results) {
        if(!err){
          if(results){
            Article.updateOne({title:originalTitle}, { $set: { "title" : newTitle,"content": newBody} }, function(err) {
                  if(err){
                  res.send(err);
                  }

                });

            res.send('article updated');
          }else{
            res.send('no article found with that title');
          }
        }else{
            res.send(err);
        }
      });
  }else{
    res.send('error: must include both title and content!');
  }



})
.patch(function(req,res){
  const title = req.params.articleTitle;
  const newTitle = req.body.title;
  const newBody = req.body.content;
  Article.findOne({title:title}, function(err, results) {
      if(!err){
        if(results){
          const originalTitle = results.title;
          const originalContent = results.content;
          if(originalContent !== newBody){
            Article.updateOne({title:title}, { $set: { "content" : newBody } }, function(err) {
                if(err){
                res.send(err);
                }
              });
          }
          if(originalTitle !== newTitle){
            Article.updateOne({title:title}, { $set: { "title" : newTitle } }, function(err) {
                if(err){
                res.send(err);
                }

              });
          }
          res.send('article patched');
        }else{
          res.send('no article found with that title');
        }
      }else{
          res.send(err);
      }
    });

})
.delete(function(req,res){
    const title = req.params.articleTitle;
  Article.findOne({title:title}, function(err, results) {
      if(!err){
        if(results){
          Article.deleteOne({title:title}, function(err) {
                if(err){
                res.send(err);
              }else{
                  res.send('article deleted');
              }

              });


        }else{
          res.send('no article found with that title');
        }
      }else{
          res.send(err);
      }
    });
});
//if port is set use that or make it = 3000
let port = process.env.PORT || 3000;
// if(port == null || port == ""){
//   port = 3000;
// }

app.listen(port, function() {
  console.log("Server started on port "+port);
});
