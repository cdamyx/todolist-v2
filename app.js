//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const clean = new Item ({
  name: "Cleaning"
});

const cook = new Item ({
  name: "Cooking"
});

const trash = new Item ({
  name: "Trash"
});

const defaultItems = [clean, cook, trash];



app.get("/", function(req, res) {

  Item.find({}, (err, docs) => {

    if (docs.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if(err){
          console.log(err);
        } else {
          console.log("successfully added array to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: docs});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item ({
    name: itemName
  });

  item.save();

  res.redirect("/");
  
});

app.post("/delete", (req, res) => {
  
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, (err) => {
    if(!err) {
      console.log("deleted");
      res.redirect("/");
    }
  });
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
