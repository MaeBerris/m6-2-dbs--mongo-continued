"use strict";
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const assert = require("assert");

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

let lastBookingAttemptSucceeded = false;

const bookSeat = async (req, res) => {
  const { seatId, creditCard, expiration } = req.body;
  console.log("seatId", seatId);
  const client = await MongoClient(MONGO_URI, options);

  await client.connect();

  const db = client.db("workshop6-2");
  const foundItem = await db.collection("Seats").findOne({ _id: seatId });
  console.log("fundItem", foundItem);
  if (foundItem.isBooked) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }
  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }

  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;
  const newValue = { $set: { isBooked: true } };
  const r = await db.collection("Seats").updateOne({ _id: seatId }, newValue);

  assert.equal(1, r.matchedCount);
  assert.equal(1, r.modifiedCount);

  return res.status(200).json({
    status: 200,
    success: true,
  });
};

module.exports = { getSeats, bookSeat };
