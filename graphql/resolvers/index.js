const { buildSchema } = require("graphql");
const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } }) //TODO: consider changing to async/await
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

const singleEvent = eventId => {
  return Event.findById(eventId)
    .then(event => {
      return {
        ...event._doc,
        _id: event.id,
        creator: user.bind(this, event.creator)
      };
    })
    .catch(err => {
      throw err;
    });
};

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

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
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      });
    } catch (err) {
      throw err;
    }
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
  },
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
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5e46ee25441b1b1def351c7f",
      event: fetchedEvent
    });

    const result = await booking.save();
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString()
    };
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;

    } catch (err) {
      throw err;
    }
  }
};
