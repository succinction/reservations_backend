// Using GraphQL, create an Express app that simulates a basic reservations system.
// usage: npm run start
//
const bookingData = require("./lib/bookingData");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();

app.use(bodyParser.json());

// Add headers for CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// simulate a database
const bookingsDB = bookingData.arrayOfObjects;

// graphql implementation
app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
            type Booking {
                _id: String!
                name: String!
                hotel: String!
                arrivalDate: String!
                departureDate: String!
            }

            input BookingInput {
                name: String!
                hotel: String!
                arrivalDate: String!
                departureDate: String!                
            }

            input BookingIdInput {
                id: Int!
            }

            type RootQuery {
                bookings: [Booking!]!
                booking(idInput: BookingIdInput!): Booking!
            }

            type RootMutation {
                createBooking(bookingInput: BookingInput): Booking
            }

            schema {
                query:RootQuery
                mutation:RootMutation
            }
        `),
    rootValue: {
      bookings: () => {
        return bookingsDB;
      },
      booking: ({ idInput }) => {
        const index = bookingsDB.findIndex(record => {
          return record._id === idInput.id;
        });
        return bookingsDB[index];
      },
      createBooking: ({ bookingInput }) => {
        const booking = {
          _id: bookingsDB.length + 1,
          name: bookingInput.name,
          hotel: bookingInput.hotel,
          arrivalDate: bookingInput.arrivalDate,
          departureDate: bookingInput.departureDate
        };
        bookingsDB.push(booking);
        return booking;
      }
    },
    graphiql: process.env.NODE_ENV === "development"
  })
);

app.get("/", function(req, res) {
  res.send("<h1>Home<h1>");
});

// REST implementations
app.get("/reservations", (req, res) => {
  res.send(bookingsDB);
});

app.get("/reservations/:id", (req, res) => {
  const index = bookingsDB.findIndex(record => {
    return record._id.toString() === req.params.id;
  });
  res.send(bookingsDB[index]);
});

app.post("/reservation", (req, res) => {
  const booking = {
    _id: bookingsDB.length + 1,
    name: req.body.name || "[name]",
    hotel: req.body.hotel || "[hotel]",
    arrivalDate: req.body.arrivalDate || "[date arrive]",
    departureDate: req.body.departureDate || "[date depart]"
  };
  bookingsDB.push(booking);
  res.send(booking);
});

app.listen(5000);
