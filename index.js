const express = require("express")
const mysql = require("mysql2")
const bodyParser = require("body-parser")

const app = express()

// mysql connect
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "score_system", // uncomment after creating database
})

db.connect((err) => {
  if (err) throw err
  console.log("Database connected...")
})

// reading the data sent in the api
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>")
})

// run this route only once to create a database
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

// run this route only once to create candidates table
app.get("/create_candidates_table", (req, res) => {
  let sql =
    "create table candidates(id int auto_increment Primary key not null, name varchar(36) not null, email varchar(100) not null)"
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      res.send(results)
    })
  } catch (err) {
    console.log(err)
  }
})

// updates candidates table
app.get("/update-candidates-table", (req, res) => {
  let sql = `alter table candidates add column name varchar(36) not null, add column email varchar(100) not null, drop column first_name, drop column last_name`
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      res.send(results)
    })
  } catch (err) {
    console.log(err)
  }
})

// run this route only once to create test scores table
app.get("/create_scores_table", (req, res) => {
  let sql =
    "create table scores(id int auto_increment Primary key not null, candidate_id int not null, first_round int, second_round int, third_round int, average_score int, FOREIGN KEY (candidate_id) REFERENCES candidates(id))"
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      res.send(results)
    })
  } catch (err) {
    console.log(err)
  }
})

// updating table scores to add average score
app.get("/update_score_table", (req, res) => {
  let sql = `alter table scores modify column average_score decimal(4,2)`
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      res.send(results)
    })
  } catch (err) {
    console.log(err)
  }
})

app.post("/api/add-candidate", (req, res) => {
  let { name, email } = req.body
  let error = {}
  let sql = `INSERT into candidates values (uuid(), '${name}', '${email}')`

  try {
    if (name.trim().length === 0)
      error.name = "Please add candidate's first name"
    if (email.trim().length === 0)
      error.email = "Please add candidate's last name"
    if (Object.keys(error).length > 0) {
      res.send(error)
    } else {
      db.query(sql, (err, results) => {
        if (err) console.log(err)
        let getCandidate = `SELECT * from candidates where id = '${results.insertId}'`
        db.query(getCandidate, (err, data) => {
          if (err) console.log(err)
          res.send({
            msg: "Item created successfully",
            candidate: data[0],
          })
        })
      })
    }
  } catch (err) {
    console.log(err)
    error.err = err
  }
})

// api to update candidate details
app.post("/api/update-candidate/:userId", (req, res) => {
  let { name, email } = req.body
  let id = req.params.userId
  let sql = `update candidates set name = '${name}', email = '${email}' where id = '${id}'`
  try {
    db.query(sql, (err, data) => {
      if (err) throw err
      res.send({
        msg: "candidate updated successful",
      })
    })
  } catch (err) {
    console.log(err)
  }
})

// get all candidates add pageSize for number of items to fetch and page for page number like this
// /api/get-candidates?pageSize=12&page=2
app.get("/api/get-candidates?:pageSizepage", (req, res) => {
  let pageSize
  let page
  let pageCount
  let total = 0
  page = parseInt(req.query?.page ? req.query.page : 1)
  pageSize = parseInt(req.query?.pageSize ? req.query.pageSize : 3)
  let sql = `SELECT count(*) as count from candidates`
  let sql2 = `SELECT * from candidates order by id desc limit ${
    page === 1 ? 0 : (page - 1) * pageSize
  },${pageSize}`
  try {
    db.query(sql, (err, results) => {
      if (err) console.log(err)
      total = results[0].count
      pageCount = Math.ceil(total / pageSize)
      db.query(sql2, (err, data) => {
        if (err) console.log(err)
        res.send({
          data,
          pager: {
            pageSize,
            page,
            nextPage: `/api/get-candidates?page=${parseInt(page) + 1}`,
            pageCount,
            total,
          },
        })
      })
    })
  } catch (err) {
    console.log(err)
  }
})

// add scores
app.post("/api/add-score/:userId", (req, res) => {
  let { first_round, second_round, third_round } = req.body
  let average_score = Math.round(
    (parseInt(first_round) + parseInt(second_round) + parseInt(third_round)) / 3
  )
  let error = {}
  let userCheck = `select * from scores where candidate_id = '${req.params.userId}'`
  let sql = `INSERT into scores values (uuid(), '${
    req.params.userId
  }', '${parseInt(first_round)}', '${parseInt(second_round)}', '${parseInt(
    third_round
  )}', '${average_score}')`
  let updateScores = `update scores set first_round = '${parseInt(
    first_round
  )}', second_round='${parseInt(second_round)}', third_round = '${parseInt(
    third_round
  )}', average_score = '${average_score}' where candidate_id = '${
    req.params.userId
  }'`
  try {
    if (!first_round || first_round?.length === 0)
      error.first_round = "Please add this value"
    if (!third_round || third_round?.length === 0)
      error.third_round = "Please add this value"
    if (!second_round || second_round?.length === 0)
      error.second_round = "Please add this value"
    if (Object.keys(error).length > 0) res.send(error)
    db.query(userCheck, (err, result) => {
      if (err) console.log(err)
      if (result.length === 0) {
        db.query(sql, (err, data) => {
          if (err) console.log(err)
          res.send({
            msg: "Item created successfully",
            score: {
              first_round,
              second_round,
              third_round,
              average_score,
            },
          })
        })
      }
      db.query(updateScores, (err, data) => {
        if (err) console.log(err)
        res.send({
          msg: "Item updated successfully",
          score: {
            first_round,
            second_round,
            third_round,
            average_score,
          },
        })
      })
    })
  } catch (err) {
    console.log(err)
  }
})

// get the maximum scores
app.get("/api/get-max-scores", (req, res) => {
  let sql = `select *, MAX(average_score) as max from scores inner join candidates on candidates.id=scores.candidate_id`
  try {
    db.query(sql, (err, data) => {
      if (err) console.log(err)
      res.send(data)
    })
  } catch (err) {
    console.log(err)
  }
})

// get all scores add pageSize for number of items to fetch and page for page number like this
// /api/get-scores?pageSize=12&page=2
app.get("/api/get-scores?:pageSizepage", (req, res) => {
  let pageSize
  let page
  let pageCount
  let total = 0
  page = parseInt(req.query?.page ? req.query.page : 1)
  pageSize = parseInt(req.query?.pageSize ? req.query.pageSize : 3)
  let counter = `SELECT count(*) as count from scores`
  let sql = `select * from scores  inner join candidates on candidates.id=scores.candidate_id limit ${
    page === 1 ? 0 : (page - 1) * pageSize
  },${pageSize}`
  try {
    db.query(counter, (err, results) => {
      if (err) console.log(err)
      total = results[0].count
      pageCount = Math.ceil(total / pageSize)
      db.query(sql, (err, data) => {
        if (err) console.log(err)
        res.send({
          data,
          pager: {
            pageSize,
            page,
            nextPage: `/api/get-scores?page=${parseInt(page) + 1}`,
            pageCount,
            total,
          },
        })
      })
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
