const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  servingSize: {type: Number, default: 1},
  date: { type: Date, default: Date.now },
  items: [
      {
          id:{type: Number, required: true},
          name:{type: String, required: true},
          quantity:{type: Number}
      }
  ]
});

// User.beforeCreate(function(user) {
//     user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
//   });


const User = mongoose.model("User", userSchema);

module.exports = user;