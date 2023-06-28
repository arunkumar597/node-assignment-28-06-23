Problem 1.
Make add Customer api for customer, assume admin is adding customer ..
use the input params validation, code commenting, logging and check for
duplicates where required.

source code 1.

// importing the express and path modules using require method to start a express server. 
const express = require("express");
const path = require("path");
const app = express(); //calling the express instance and storing it in 'app' variable.

const { open } = require("sqlite3"); // importing open module from sqlite3 which is used to connect to the sqlite database
const sqlite3 = require("sqlite");

const bcrypt = require("bcrypt"); // importing bcrypt module to encrypt and decrypt the password 

const dbPath = path.join(__dirname, "DATABASE FILE NAME"); // using join method in path combining the present working file path and the database file name.

let db = null;

const initializeServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database }); // using open method , creating a connection to the sqlite3 database. since batabase connection is an asynchronous operation we are using await keyword to complete the asynchronous operation. storing the connection object in a variable called 'db'.
    app.listen(3000, () => {
      console.log("Server is Up and Running in the Localhost");
    }); // starting the express server instance in the port 3000 using listen method.
  } catch (e) {
    console.log(`DB Error: ${e.message}`); // if any error occurs during the database connection the error comes to catch block and will be shown in the terminal.
    process.exit(1);
  }
};

initializeServer(); // calling the function to start the server and run.

// Register API
// using this API we are making a post request to register a customer.
app.post("/register/", async (request, response) => {
  const { phoneNumber, password } = request.body; // from request body , destructuring the object properties given by the customer
  const hashedPassword = await bcrypt.hash(request.body.password); // bcrypt.hash() method is used to encrypt the password.
  const sqlQuery = `SELECT * FROM customer WHERE phoneNumber = '${phoneNumber}';`;
  const dbUser = await db.get(sqlQuery); // db object has get method which is used to perform sqlquery against the database. *get method is used to return a single row from the table.* 
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        customer (phoneNumber, password) 
      VALUES 
        (
          '${phoneNumber}', 
          '${hashedPassword}', 
        )`; // using Insert command , storing the phone number and the hashed password(encrypted password) in the customer table.
    const dbResponse = await db.run(createUserQuery); // run method is used to insert or update or delete any row from the table. Here we are inserting a row in customers table.
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`); // if a new row is inserted successfully , sending a response using send method.
  } else {
    response.status = 400; // if a user alrerady exists , using status method setting the response status code to 400(which is a error from the client side)
    response.send("User already exists");
  }
});

// After the registration of the cusomer successfully. making a Login API.

// Login API
// using this API we are making a post request to login the customer and also checking the password stored in the database and the password given by the customer are same.
app.post("/login/", async (request, response) => {
  const { phoneNumber, password } = request.body; // from request body , destructuring the object properties given by the customer
  const sqlQuery = `SELECT * FROM customer WHERE phoneNumber = '${phoneNumber}';`;
  const dbUser = await db.get(sqlQuery); // db object has get method which is used to perform sqlquery against the database. *get method is used to return a single row from the table.* 
  if (dbUser === undefined) { 
    response.status(400);
    response.send("Invalid User"); // if a customer doesnt exists in the database , sending the response as invalid user.
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password); // bcrypt.compare() method is used to compare the password stored in the database and the password given by the customer are same or not.(return true if same or else returns false).
    if (isPasswordMatched === true) {
      response.status(200);
      response.send("Login Success !"); // if password is matched, sending response as login success message.
    } else {
      response.status(400);
      response.send("Invalid Password"); // if password is not matched, sending the response message as Invalid password.
    }
  }
});


Note: We can check whether a customer is logged in or not using jwt token method.


