import cors from "cors";
import express from "express";
import mysql from "mysql2";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "TaylorSwift@1989",
  database: "flight",
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Login failed: " + err.stack);
      res.status(500).send("Login failed");
      return;
    } else {
      if (result.length > 0) {
        return res.json(result);
      } else {
        console.log("Invalid Credentials");
        res.status(401).send("Invalid credentials");
      }
    }
  });
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error("Registration failed: " + err.stack);
      res.status(500).send("Registration failed");
      return;
    }
    console.log("User registered successfully");
    res.status(200).send("User registered successfully");
  });
});

app.post("/flights", (req, res) => {
  const origin = req.body.origin;
  const dest = req.body.destination;
  const count = req.body.passengersCount

  const sqlQuery =
    "SELECT * FROM flight WHERE LOWER(origin) = LOWER(?) AND LOWER(dest) = LOWER(?) AND seat >= ?";

  db.query(sqlQuery, [origin, dest, count], (err, results) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).send("Error fetching flights");
    } else {
      console.log(results);
      res.json(results);
    }
  });
});

app.post("/book/:flightId", (req, res) => {
  const value = req.body.passengersCount;
  const { flightId } = req.params;
  console.log(req)

  const selectQuery = "SELECT seat FROM flight WHERE id = ?";

  db.query(selectQuery, [flightId], (selectErr, selectResults) => {
    if (selectErr) {
      console.error("Error fetching current seat count:", selectErr);
      return res.status(500).send("Error fetching current seat count");
    }

    if (selectResults.length === 0) {
      return res.status(404).send("Flight not found");
    }

    const currentSeatCount = selectResults[0].seat;

    const updateQuery = "UPDATE flight SET seat = GREATEST(?, 0) WHERE id = ?";

    db.query(
      updateQuery,
      [currentSeatCount - value, flightId],
      (updateErr, updateResults) => {
        if (updateErr) {
          console.error("Error updating available seats:", updateErr);
          return res.status(500).send("Error updating available seats");
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).send("Flight not found");
        }

        return res.status(200).send("Booking successful");
      }
    );
  });
});

app.get("/getflights", (req, res) => {
  const query = "SELECT * FROM flight";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching flights for admin:", err);
      res.status(500).send("Error fetching flights for admin");
    } else {
      console.log(results);
      res.json(results);
    }
  });
});

app.listen("5000", () => {
  console.log("API Working !");
});
