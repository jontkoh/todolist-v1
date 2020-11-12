import express, {json, urlencoded} from "express";
import mongoose from "mongoose";
import { getDay } from "./get-day";
import _ from "lodash";

const app = express();
app.use(urlencoded({extended:true}));
app.use(json());
app.use(express.static("public"));
app.set("view engine", 'ejs');

//------------------used for local development------------------------
// mongoose.connect("mongodb://localhost:27017/todolistDB", 
//                  {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(`mongodb+srv://admin-jtk:${MONGODB_PASSWORD}@cluster0.zt6mz.mongodb.net/todolistDB?retryWrites=true&w=majority`)
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
  name: "Make a new item"
});

const item2 = new Item({
  name: "<---- click here to delete"
});

const item3 = new Item({
  name: "🤯"
});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  const thisDay = getDay();
  try {
    Item.findOne({}, (err, item) => {
      if(!err) {
        if (!item) {
          // item1.save();
          // item2.save();
          // item3.save();
          defaultItems.forEach(element => {
            
            Item.create({name: element.name}, (err, doc) => {
              if (err) {
                console.log(err);
              }
              else{
                console.log("added: " + doc.name)
              }
            }) 
          });
          res.redirect("/");
        }
        else {
          Item.find({}, (err, foundItems)=> {
            if(err) {
              console.log(err);
            }
            else{
              // console.log(foundItems);
              res.render('list', {listTitle: thisDay, items: foundItems})
            }
          })
        }
      }
    }) 
  } catch (error) {
    console.error(error);
  } 

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
  const {listName} = req.body;
  try {
    if(listName === getDay()){
        Item.findByIdAndDelete(deletedItem, (err, doc) => {
          if (err) {
            console.log(err);
          }
          else {
            res.redirect("/");
          }
        })
      }
      else{
        List.findOneAndUpdate({name: listName}, {$pull: { items: {_id: deletedItem}}}, (err, result) => {
          if (!err) {
            console.log(result);
            res.redirect("/"+listName);
          }
        })
      }
  } catch (error) {
    console.log(error);
  }
})

app.get("/:theme", (req, res) => {
  const theme = _.capitalize(req.params.theme);
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