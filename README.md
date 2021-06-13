# nodejs-qn

Use `expressjs` with `mongodb or mysql` for this. You need design database tables yourself based on the question.  
 a) We have two entities `candidate` and `test_score`.  
 b) candidate has properties name, email address.  
 c) Every candidate has to give 3 tests like `first_round`, `second_round` , `third_round` and scoring for every test is done out of 10.

Now using `expressjs`, only need to create api to do the following.  
 a) Insert a candidate into database.  
 b) Assign score for a candidate based on the test.  
 c) Api to get highest scoring candidate and average scores per round for all candidates.

To run this app, clone the repo and run,  
`npm install`  
`# and then run`  
`npm run dev`  
`# or`  
`npm start`

Open the app on `localhost:5000`

NB: Make sure you have MySQL database running

Dependencies used are  
`express` and  
`mysql2`

To create database run `http://localhost:5000/create-db` then uncomment the database in mysql credentials section

To create candidates table run `http://localhost:5000/create_candidates_table`

To create scores table run `http://localhost:5000/create_scores_table`
