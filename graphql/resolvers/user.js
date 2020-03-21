const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

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
    },
    login: async ({email, password}) => {
        const user = await User.findOne({email: email});
        if (!user)
            throw new Error('Invalid credentials!')
        
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual)
            throw new Error('Invalid credentials!')

        const token = jwt.sign({userId: user.id, email: user.email}, 'asupersecretkey', {
            expiresIn: '1h'
        });

        return {
            userId: user.id,
            token: token,
            tokenExpiration: 1
        }
    }
  };
  