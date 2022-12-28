var mysql = require('mysql');

var db = mysql.createPool({
    host: "109.106.252.121",
    user: "u1578470_dev",
    password: "semangat45",
    database: "u1578470_kasiraja"
});

// db.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
// });

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