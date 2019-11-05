var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var ItemSchema = new Schema({
    // `body` is of type String
    name:{type: String},
    quantity: {type: Number},
    group: {type: String}
});

// This creates our model from the above schema, using mongoose's model method
var Item = mongoose.model("Item", ItemSchema);

// Export the Note model
module.exports = Item;