const mongoose = require("mongoose")
const {Schema} = mongoose


const schemaBlock = new Schema({
  blockid: { type: Number },
  title: { type: String },
  date: { Date },
  published: {type:Boolean, default: false },
  body:  {
    type: String,
    validate: {
      validator: function (body) { 
        let text = body.replace(/\r?\n/g," ").replace(/[ ]+/g," ").replace (/^ /,"").replace (/ $/,"")
        let words = text.split(" ")
        return words.length>=200 && words.length<=500 ? true : false },
      message: "El fragmento ha de tener entre 200 y 500 palabras"
    }
  },
  closure: [{type: String}],
  likes: { type: Number, default:0},
  author: {type:Schema.Types.ObjectId, ref:'user'},
  story: {type:Schema.Types.ObjectId, ref:'story'}
})

module.exports=mongoose.model('Block',schemaBlock)