const express = require("express"); //loading express module
const exphbs = require("express-handlebars");
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const multer = require("multer")
var methodOverride = require('method-override');
const app = express(); //top level function
//for this two we need to install------------- npm install handlebars-intl-----------
//this is for date modification purpose
var Handlebars     = require('handlebars');
var HandlebarsIntl = require('handlebars-intl');

//end

//Date format js middleware
HandlebarsIntl.registerWith(Handlebars);
//end 

Handlebars.registerHelper("trimArray", function (passedString) {
    var theArray = [...passedString].splice(6).join("");
    return new Handlebars.SafeString(theArray);
})

//multer middleware for uploading files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})
const upload =multer( { storage: storage });
// multer code is ending


//load Profile schema module...
require('./Model/Profile');
const Profile = mongoose.model('profile');


const cloudMongourl =
    "mongodb+srv://fullstack:fullstack123@cluster0-jbate.mongodb.net/test?retryWrites=true&w=majority"
//connection database middleware
mongoose.connect(cloudMongourl, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
    if (err) throw err;
    console.log("database connected")
})

//application-level  

// var logger = function (req, res, next) {
//     console.log("LOGGED");
//     next();
// }
// app.use(logger);

//serve static file in express app by using express.static method
app.use(express.static(__dirname+"/node_modules/jquery")) //express static middleware
app.use(express.static(__dirname+"/node_modules/bootstrap")) //express static middleware
app.use(express.static(__dirname+"/public")) //express static middleware

//bodyparser middleware(To use middleware use app.use)
app.use(bodyparser.urlencoded({ extended: false}));
app.use(bodyparser.json())

//methodoverride middleware for put and delete method because httml does not have put and delete method
// override with different headers; last one takes precedence
app.use(methodOverride('X-HTTP-Method-Override'))
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))


//create express routing
app.get('/Profiles/addprofile', (req, res) => {
    res.render("Profiles/addprofile")
})

//edit profile route here

app.get('/Profiles/editprofile/:id', (req, res) => {
    //find mongodb ObjectId through findOne method
    Profile.findOne({ _id: req.params.id })
        .then(profile => {
          
            res.render('Profiles/editprofile', {
            profile:profile
        })
        })
        .catch(err => console.log(err))
})



//create profiles route
app.get('/Profiles/profiles', (req, res) => {
  //find data from mongodb database by using mongodb find method , to find only one object use findOne method
    Profile.find({}).then(profile => {
        res.render('Profiles/profiles', {
            profile:profile
        })
    }).catch(err => console.log(err))

})

//*****************************delete data http delete method***************************************8
app.delete("/Profiles/deleteprofile/:id", (req, res) => {
    Profile.remove({ _id: req.params.id }).then(profile => {
        res.redirect("Profiles/profiles",301,{profile})
    }).catch(err=>console.log(err))
})
//************************************************************************************************** */
app.get("/", (req, res) => {
    res.render("home.handlebars",{title:"Home"});
});//home page route

app.get("**", (req, res) => {
    res.render('404.handlebars',{title:"404 page"})
})

//********************************Create Profile Data*********************************************
app.post('/Profiles/addprofile',upload.single('photo'), (req, res) => {
    const errors = [];
    if (!req.body.firstname) {
        errors.push({text:"firstname is required"})
    }
    if (!req.body.lastname) {
        errors.push({text:"lastname is required"})
    }
    if (!req.body.email) {
        errors.push({text:"email is required"})
    }
    if (!req.body.phonenumber) {
        errors.push({text:"phonenumber is required"})
    }
    if (errors.length > 0) {
        res.render('Profiles/addprofile', {
            errors: errors,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phonenumber: req.body.phonenumber
        });
    }
    else {
        const newProfile = {
            photo:req.file,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phonenumber:req.body.phonenumber
        }
        //save data to mongodb
        new Profile(newProfile)
            .save()
            .then(profile => {
            res.redirect("/",301,{profile})
            })
            .catch(
            err=> console.log(err)
        )

    }
}) // for create should use http post method

//put req here for updating data
app.put("/Profiles/editprofile/:id", upload.single('photo'), (req, res) => {
    Profile.findOne({ _id: req.params.id })
        .then(profile => {
        //save new Data
            console.log(profile)
            profile.photo = req.file,
            
            profile.firstname = req.body.firstname;
            profile.lastname = req.body.lastname;
            profile.email = req.body.email;
            profile.phonenumber = req.body.phonenumber;
        
        profile.save().then(profile => {
            res.redirect("/Profiles/profiles", 301,{ profile })
        }).catch(err=>console.log(err))
       
           
        }).catch(err=>console.log(err))
    })



//middlewares
app.engine("handlebars", exphbs());
app.set("view engine","handlebars")
// close template engines middleware here


const port = process.env.PORT || 4000;
app.listen(port, (err) => {
    if (err) throw err;
    console.log(`server is running on a port number ${port}`)
})