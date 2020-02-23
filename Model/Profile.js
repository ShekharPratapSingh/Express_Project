//how to create schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ProfileSchema = new Schema({
    //html(addProfile.handlebars) name should be same as key of Profileschema object
    photo: {
        type: [""]
    },
    firstname: {
        type: String, //Mongodb dataType
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phonenumber: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default:Date.now
    }


});
module.exports = mongoose.model('profile', ProfileSchema); //model of the database