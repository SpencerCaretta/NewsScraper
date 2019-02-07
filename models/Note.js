var mongoose = require("mongoose");

var Schema = mongoose.Schema;

//Note Schema allowing people to give each note a title and a body
var NoteSchema = new Schema({

  title: String,

  body: String
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;