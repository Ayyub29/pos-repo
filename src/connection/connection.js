var mysql = require('mysql');

var db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "12345678",
    database: "test"
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

const queryMYSQL = async (query) => {
    return new Promise((resolve, reject) => {
      return db.query(query.text, query.values, (err, result)=>{
        if(err) reject(err);
        resolve(result);
      })
    }).catch(error => er = {
      status: true,
      message: error.message
    });
  }

module.exports = { db, queryMYSQL };