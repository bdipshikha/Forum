//app requirements
//express
var express = require('express')
var app = express();

//templating stuff
var ejs = require("ejs")
app.set("view engine", "ejs")
//body parser
var bodyParser = require('body-parser')
//tell app which method to use when parsing
app.use(bodyParser.urlencoded({extended: false}))

//method override setup
var methodOverride = require('method-Override')
//tell app which override method to use
app.use(methodOverride('_method'))

//allow sqlite3
var sqlite3 = require('sqlite3').verbose();
//set database
var db = new sqlite3.Database('./forumdb/forum.db');
var markdown = require( "markdown" ).markdown;

app.get('/', function(req, res){
    res.redirect('/forums')
});

// to get all the catagories
app.get('/forums', function(req, res) { // all posts, blogs
    db.all("SELECT * FROM categories;", function(err, data) { // db for database not the name of database
        if (err) {
            throw (err)
        }  else {
            var forum = data;
                //console.log(forum)
            }
            res.render('index.ejs', {forum: forum});    
        });
});

// *************** added new code for search ******************

// app.post('/index', function(req, res){
//  var search = req.query.search;
//  if (search === catagories.title) {
//      db.get("SELECT search FROM catagories;", function(catagories, posts) {  
//      });
//  }   else if (search === posts.title) {
//      db.get('SELECT search FROM posts;', function(catagories, posts) {   
//      });
//  }   res.render('index.ejs', {catagories: catagories, posts: posts})
// });
// *************************** new code end ************************

// to get single catagory
app.get('/forum/:id', function(req, res){
    var id = req.params.id;
    db.get("SELECT * FROM categories WHERE id = ?", id, function(err, thisCategory){
        var category_row = thisCategory;
        console.log(category_row);
        var category_id = req.params.id
        //if(req.query.offset === undefined) { req.query.offset = 0; }
        var SQL = "SELECT posts.id, posts.title, strftime('%s',date) - strftime('%s','now') " +
                  "FROM posts INNER JOIN categories ON categories.id = posts.category_id  " +
                  "WHERE strftime('%s',date) - strftime('%s','2015-04-01') > 0 and category_id = ? LIMIT 3";

                  // strftime('%s',date) - strftime('%s','2015-04-01') > 0 and 

        console.log(SQL);
        db.all(SQL, thisCategory.id, function(err, posts){
            console.log(err);
            var post_row = posts;
            console.log("=================== start posts =======");
            console.log(post_row);
            console.log("=================== end posts =========");
    
            res.render('show-category.ejs', {'category': category_row, 'posts': posts })
        });     
    });
});


// for new category
app.get('/categories/new', function(req, res){
    res.render('new-category.ejs')
});

app.post('/categories', function(req, res){

    console.log('Trying to create categories');
    console.log(req.body)
    //get info from req.body, make new post
    db.run("INSERT INTO categories (title, body, image, Upvotes, Downvotes) VALUES (?, ?, ?, 0, 0)",  
        req.body.title, req.body.body, req.body.image, req.body.Upvotes, req.body.Downvotes, function(err) {
        if (err) {
            throw err;
        } else {
            console.log("Successfully inserted into categories despite bad syntac");
        }
    });
    //go to forum so we can see our new catagory
    res.redirect('/forums')
});

app.get('/forum/:id/edit', function(req, res){
    var id = req.params.id
    db.get("SELECT * FROM categories WHERE id = ?", id, function(err, thisCategory) {
        if (err) {
            throw err
        } else {
            res.render("edit-category.ejs", {thisCategory: thisCategory})
        }
    });
});
app.put('/forum/:id', function(req, res){
    console.log("put");
    //make changes to appropriate post
    db.run("UPDATE categories SET title = ?, body = ?, image = ?  WHERE id = ?", req.body.title, req.body.content, req.body.image, req.params.id, function(err) {
        if (err) {
            throw err
        } // console.log(res)
    })
    //redirect to this indivudual category page to see changes
    res.redirect('/forum/' + req.params.id)// needs to be blog not blogs since only one post
});

app.post('/forum/:id/upvote', function(req, res){
    //console.log("put");
    db.run("UPDATE categories SET Upvotes = 1 + Upvotes WHERE id = ?",  req.params.id, function(err) {
        if (err) {
            throw err;
        }  
        console.log("---  inside upvote ---");
        console.log(req.body);
    })
  
    res.redirect('/forum/' + req.params.id)
});

app.post('/forum/:id/downvote', function(req, res){
    //console.log("put");
    db.run("UPDATE categories SET Downvotes = Downvotes -1 WHERE id = ?",  req.params.id, function(err) {
        if (err) {
            throw err;
        }  
        //console.log("---  inside upvote ---");
        console.log(req.body);
    })
   
    res.redirect('/forum/' + req.params.id)
});

app.delete("/forum/:id", function(req, res) {
db.get("SELECT * FROM posts WHERE posts.category_id = ?", req.params.id, function(err, posts) {
    if(err) {
        throw err;
    }
    if (posts === undefined) {    
        console.log("no post for this category so deleting will work")
        db.run("DELETE FROM categories WHERE id = ?", req.params.id, function(err) {
            if (err) {
                throw err;
            } 
        }); 
        console.log("its working!");
    } else {
        console.log("Can't delete a category with posts!");
    }
});
    res.redirect('/forums')
});

// to get single post in catagory

app.get('/post/:id', function(req, res){
    var id = req.params.id
    db.get("SELECT * FROM posts WHERE id = ?", id, function(err, thisPost){
        var post_row = thisPost;
        post_row.body = markdown.toHTML(post_row.body);
        console.log(post_row);
        db.all("SELECT * FROM comments WHERE post_id = ?", id, function(err, comments) {
            res.render('show-post.ejs', {post: post_row, comments: comments })
        });
    });     
});

// for new post
app.get('/category/:categoryid/posts/new', function(req, res){
    var cid = req.params.categoryid;
    res.render('new-post.ejs', {'category_id': cid})
});

app.post('/category/:catid/post/savenewpost', function(req, res){
    var catid = req.params.catid;
    console.log(req.body)
    //get info from req.body, make new post
    db.run("INSERT INTO posts (category_id, title, body, image, Upvotes, Downvotes, date) " 
            + "VALUES (?, ?, ?, ?, 0, 0, ?)",  
            catid, req.body.title, req.body.body, req.body.image, req.body.date, function(err) {
        if (err) {
            console.log("error in inserting");
            throw err;
        } else {
            console.log("no error");
        }
        res.redirect('/forum/'+catid);
    });
    //go to forum so we can see our new catagory

});
app.get('/post/:id/edit', function(req, res){
    var id = req.params.id
    db.get("SELECT * FROM posts WHERE id = ?", id, function(err, thisPost) {
        if (err) {
            throw err
        } else {
            res.render("edit-post.ejs", {thisPost: thisPost})
        }
    });
});

app.put('/post/:id/update', function(req, res){
    //console.log("put");
    //var catid = req.params.catid;
    //make changes to appropriate post
    db.run("UPDATE posts SET  title = ?, body = ?, image = ?, date = ? WHERE id = ?",  req.body.title, 
        req.body.content, req.body.image, req.body.date, req.params.id, function(err) {
        if (err) {
            throw err
        } // console.log(res)
    })
    //redirect to this blog page to see changes
    res.redirect('/post/' + req.params.id)// needs to be blog not blogs since only one post
});

app.post('/post/:id/upvote', function(req, res){
    //console.log("put");
    db.run("UPDATE posts SET Upvotes = 1 + Upvotes WHERE id = ?",  req.params.id, function(err) {
        if (err) {
            throw err;
        }  
        console.log("---  inside upvote ---");
        console.log(req.params.id);
    })
    //redirect to this blog page to see changes
    res.redirect('/post/' + req.params.id)// needs to be blog not blogs since only one post
});

app.post('/post/:id/downvote', function(req, res){
    //console.log("put");
    db.run("UPDATE posts SET Downvotes = Downvotes -1 WHERE id = ?",  req.params.id, function(err) {
        if (err) {
            throw err;
        }  
        //console.log("---  inside upvote ---");
        console.log(req.body);
    })
    res.redirect('/post/' + req.params.id)
});
app.post ('/post/:id/comment', function(req, res) {

        db.run("INSERT INTO comments (post_id, comment) VALUES (?, ?)", req.params.id, req.body.comment, function(err) {
        if (err) {
            console.log("error in interesting");
            throw err;
        } else {
            console.log("********** comment is gooodd *******************");
        }
        res.redirect('/post/' + req.params.id)
    });
})

app.delete("/post/:id", function(req, res){
    db.run("DELETE FROM posts WHERE id = ?", req.params.id, function(err) {
        if (err) {
            throw err
        }
    })
    //go to forum to see change
    res.redirect('/forums')
});
app.listen('3000')
console.log("Listing to port 3000")
