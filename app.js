const express = require("express");
const bodyParser = require("body-parser");
const graphQLHttp = require("express-graphql");
const mongoose = require("mongoose");
const isAuth = require('./middleware/is-auth');

require("dotenv").config();

const graphiqlSchema = require('./graphql/schema/index');
const graphiqlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use(
  "/graphql",
  graphQLHttp({
    schema: graphiqlSchema,
    rootValue: graphiqlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clustergraphql-1fbal.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
