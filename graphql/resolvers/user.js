const User = require("../../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
    createUser: args => {
      return User.findOne({ email: args.userInput.email })
        .then(user => {
          if (user) throw new Error("A user with this email already exists.");
          return bcrypt.hash(args.userInput.password, 12);
        })
        .then(hashedPass => {
          const user = new User({
            email: args.userInput.email,
            password: hashedPass
          });
  
          return user.save();
        })
        .then(result => {
          return { ...result._doc, password: null, _id: result.id };
        })
        .catch(err => {
          throw err;
        });
    }
  };
  