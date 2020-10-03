const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

const seats = {};
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats[`${row[r]}-${s}`] = {
      price: 225,
      isBooked: false,
    };
  }
}
// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

const randomlyBookSeats = (num) => {
  const bookedSeats = {};

  while (num > 0) {
    const row = Math.floor(Math.random() * NUM_OF_ROWS);
    const seat = Math.floor(Math.random() * SEATS_PER_ROW);

    const seatId = `${getRowName(row)}-${seat + 1}`;

    bookedSeats[seatId] = true;

    num--;
  }

  return bookedSeats;
};
const bookedSeatsArray = randomlyBookSeats(30);

console.log("bookedSeatsArray", bookedSeatsArray);

Object.keys(bookedSeatsArray).forEach((key) => {
  seats[key].isBooked = true;
});

Object.values(seats).forEach((seat, index) => {
  let keysArray = Object.keys(seats);
  seat._id = keysArray[index];
});

console.log(seats);

const batchImport = async () => {
  const client = await MongoClient(MONGO_URI, options);
  try {
    await client.connect();

    const db = client.db("workshop6-2");
    const r = await db.collection("Seats").insertMany(Object.values(seats));

    console.log("success");
  } catch (err) {
    console.log(err.stack);
    console.log("error", err.message);
  }
  client.close();
};

batchImport();
