//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://new-user-1:odKSO34iwe537@cluster0.qovp6.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

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

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

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
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();

    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  
  
});

app.post("/delete", (req, res) => {
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
    if(!err) {
      console.log("deleted");
      res.redirect("/");
    }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  
})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, (err, foundList) => {
    if (!err){
      if (!foundList){
        const list = new List({
    name: customListName,
    items: defaultItems
  });

  list.save();
  res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
  

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
