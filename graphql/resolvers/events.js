const Event = require("../../models/event");
const { user } = require('./share');

module.exports = {
    events: () => {
      return Event.find()
        .then(events => {
          return events.map(e => {
            return {
              ...e._doc,
              _id: e._doc._id.toString(),
              date: new Date(e._doc.date).toISOString(),
              creator: user.bind(this, e._doc.creator)
            };
          });
        })
        .catch(err => {
          throw err;
        });
    },
    createEvent: args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: "5e46ee25441b1b1def351c7f"
      });
  
      let createdEvent;
  
      return event
        .save()
        .then(res => {
          createdEvent = {
            ...res._doc,
            _id: res._doc._id.toString(),
            date: new Date(res._doc.date).toISOString(),
            creator: user.bind(this, res._doc.creator)
          };
          return User.findById("5e46ee25441b1b1def351c7f");
        })
        .then(user => {
          if (!user) throw new Error("User not found.");
  
          user.createdEvents.push(event);
          return user.save();
        })
        .then(() => {
          return createdEvent;
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    }
  };
  