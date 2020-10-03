"use strict";
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);

  await client.connect();

  const db = client.db("workshop6-2");

  const data = await db.collection("Seats").find().toArray();

  let seats = {};

  data.forEach((seat) => {
    seats[seat._id] = seat;
  });

  if (data.length === 0) {
    res.status(404).json({ message: "could not find required data" });
  } else {
    res.json({
      seats: seats,
      numOfRows: 8,
      seatsPerRow: 12,
    });
  }
  client.close();
};

module.exports = { getSeats };
