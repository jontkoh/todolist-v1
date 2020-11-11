import express, {json, urlencoded} from "express";
import mongoose from "mongoose";
import { getDay } from "./get-day";

const app = express();
const itemsArr = [];
const workItemsArr = [];
app.use(urlencoded({extended:true}));
app.use(json());
app.use(express.static("public"));
app.set("view engine", 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB", 
                 {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model('Item', itemsSchema);

const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

const item1 = new Item({
  name: "test1"
});

const item2 = new Item({
  name: "test2"
});

const item3 = new Item({
  name: "test3"
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, (err) => {
//   if (err){
//     console.log(err);
//   }
//   else{
//     console.log("success");
//   }
// });

// const itemsArr = Item.find((err, arr) => {
//   if (err){
//     console.log(err);
//   }
//   else {
//     arr.forEach((element) => {
//       return element.name;
//     }) 
//   }
// })



app.get("/", (req, res) => {
  const thisDay = getDay();
  Item.find({}, (err, foundItems)=> {
    if(err) {
      console.log(err);
    }
    else{
      // console.log(foundItems);
      res.render('list', {listTitle: thisDay, items: foundItems})
    }
  }) 
  

});

app.post("/", (req, res) => {
  const {newItem} = req.body;
  const {list} = req.body;
  if (list === getDay()) {
    Item.create({name: newItem}, (err, doc) => {
      if (err) {
        console.log(err);
      }
      else{
        console.log("added: " + doc.name)
      }
    })
    res.redirect("/");
  }
  else {
    List.findOne({name: list}, (err, listOfitems) => {
        const item = new Item({
          name: newItem
        });
        listOfitems.items.push(item);
        listOfitems.save();
    })
    res.redirect("/" + list);
  }
});

app.post("/delete", (req, res) => {
  const {deletedItem} = req.body;
  Item.findByIdAndDelete(deletedItem, (err, doc) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log("deleted: "+ doc.name);
      res.redirect("/");
    }
  })
})

app.get("/:theme", (req, res) => {
  const {theme} = req.params;
  List.findOne({name: theme}, (err, item) => {
    if(!err) {
      if (!item) {
        const newList = new List({
          name: theme,
          items: defaultItems
        })
        newList.save();
        res.redirect("/"+theme);
      }
      else {
        res.render('list', {listTitle: theme, items: item.items});
      }
    }
  })
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on port ${process.env.PORT || 3000}`);
});