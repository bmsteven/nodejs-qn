const express = require("express")
const mysql = require("mysql2")
// const bodyParser = require("body-parser")

const app = express()

// mysql connect
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  // database: "score_system", // uncomment after creating database
})

db.connect((err) => {
  if (err) throw err
  console.log("Database connected...")
})

// app.use(bodyParser.json({ limit: "100mb" }))
// app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }))

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>")
})

// run this route only once
app.get("/create_db", (req, res) => {
  let sql = "CREATE database score_system"
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      res.send(results)
    })
  } catch (err) {
    console.log(err)
  }
})

// run this route only once
app.get("/create_candidates_table", (req, res) => {
  let sql =
    "create table candidates(id int auto_increment Primary key not null, first_name varchar(36) not null, last_name varchar(36))"
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      res.send(results)
    })
  } catch (err) {
    console.log(err)
  }
})

// run this route only once
app.get("/create_scores_table", (req, res) => {
  let sql =
    "create table scores(id int auto_increment Primary key not null, candidate_id int not null, first_round int, second_round int, third_round int, FOREIGN KEY (candidate_id) REFERENCES candidates(id))"
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      res.send(results)
    })
  } catch (err) {
    console.log(err)
  }
})

app.listen(PORT, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log(`Server running on port ${PORT}`)
  }
})
