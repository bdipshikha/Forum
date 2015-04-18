
//allow sqlite3
var sqlite3 = require('sqlite3').verbose();
//set database
var db = new sqlite3.Database('./forumdb/forum.db');


var SQL = "SELECT * FROM posts;";

// when user clicks delete bitton
// delete a category
// category is identified by a category id (which is coming from browser)
// find posts for that category, if they are no possts then delete

db.get("SELECT * FROM posts WHERE posts.catagory_id =2", function(err, posts) {

    if (posts.length === 0) {    
        console.log("no post for this catagory so deleting will work")
        db.run("DELETE FROM catagories WHERE id = 1", function(err) {
            if (err) {
                throw err;
            } 
        }); 
        console.log("its working!");
    } else {
        console.log("Can't delete a catagory with posts!");
    }
}); 
