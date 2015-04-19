
//allow sqlite3
var sqlite3 = require('sqlite3').verbose();
//set database
var db = new sqlite3.Database('./forumdb/forum.db');


db.run("INSERT INTO posts (catagory_id, title, body, image, Upvotes, Downvotes, date) VALUES (?, ?, ?, ?, 0, 0, ?)",
  1, 'mytitle', 'body', 'image', 'date', function(err) {
    if (err) {
        console.log("error in inserting");
        throw err;
    } else {
        console.log("no error");
    }
    //res.redirect('/forum/'+catid);
});


