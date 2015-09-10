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
var methodOverride = require('method-override')
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

// to get all the categories
app.get('/forums', function(req, res) { 
    db.all("SELECT * FROM categories ORDER BY Upvotes DESC;", function(err, data) { // db for database not the name of database
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

app.post('/search-result', function(req, res){
 var search = req.body.search;
    var searchSQL = "SELECT * FROM posts WHERE title LIKE '%"+search+"%' OR body LIKE '%"+search+"%' ORDER BY Upvotes DESC LIMIT 9";
    db.all(searchSQL, function(err, data) {  
        console.log(searchSQL);
        console.log(data);
        var post = data;
        if (err) {
            console.log("hi");
            throw err;
        } 
        res.render('search-result.ejs', {posts: post, search: search});    
    
    });

});

// *************************** new code end ************************

// to get single category which will display all the post beloging to the category
app.get('/forum/:id/page/:pageno', function(req, res){
    var id = req.params.id;
    var pageno = req.params.pageno;
    db.get("SELECT * FROM categories WHERE id = ?", id, function(err, thisCategory){
        var category_row = thisCategory;
        category_row.body = markdown.toHTML(category_row.body);
        console.log(category_row);
        var category_id = req.params.id

        var SQL = "SELECT posts.id, posts.title FROM posts INNER JOIN categories ON categories.id = posts.category_id WHERE category_id = ?;"

/////////////////////////////****************/////////////////////////////////////////
    // to remove expired posts from the database call, use the following "var SQL" command which includes
    // strftime clause 

        // var SQL = "SELECT posts.id, posts.title, strftime('%s',date) - strftime('%s','now') " +
        // "FROM posts INNER JOIN categories ON categories.id = posts.category_id  " +
        // "WHERE strftime('%s',date) - strftime('%s','2015-04-01') > 0 and category_id = ?";
//////////////////////////////////////////////////////////*****************///////////////////////////////
            console.log(SQL);
                db.all(SQL, thisCategory.id, function(err, posts){
                    var page = [];
                    var startPage = (req.params.pageno - 1) * 10; // pagesize = 10 since 10 posts per page
                    var endPage = startPage + 9 // (pagesize (10) - 1 = 9 )
                    for (var i = startPage; i <= endPage && i < posts.length; i++) {
                        page[i-startPage] = posts[i];                
                    }
            var post_row = posts;

            res.render('show-category.ejs', {'category': category_row, 'posts': page })
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
//get info from req.body, make new category
    db.run("INSERT INTO categories (title, body, image, Upvotes, Downvotes) VALUES (?, ?, ?, 0, 0)",  
    req.body.title, req.body.body, req.body.image, req.body.Upvotes, req.body.Downvotes, function(err) {
        if (err) {
            throw err;
        } else {
            console.log("Successfully inserted into categories despite bad syntac");
        }
    });
//go to forum so we can see our new category
res.redirect('/forums')
});

// to edit a category
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
app.put('/forum/:id/page/1', function(req, res){
    console.log("put");
//make changes to specific category
    db.run("UPDATE categories SET title = ?, body = ?, image = ?  WHERE id = ?", req.body.title, req.body.content, req.body.image, req.params.id, function(err) {
        if (err) {
            throw err
        } // console.log(res)
    });
//redirect to this indivudual category page to see changes
    res.redirect('/forum/' + req.params.id + "/page/1")// needs to be forum not forums since only one post
});

app.post('/forum/:id/upvote', function(req, res){
//console.log("put");
    db.run("UPDATE categories SET Upvotes = 1 + Upvotes WHERE id = ?",  req.params.id, function(err) {
        if (err) {
            throw err;
        }  
        console.log("---  inside upvote ---");
        console.log(req.body);
    });
    res.redirect('/forum/' + req.params.id + "/page/1")
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
    res.redirect('/forum/' + req.params.id + "/page/1")
});;

// to delete a category
app.delete("/forum/:id", function(req, res) {
    db.get("SELECT * FROM posts WHERE posts.category_id = ?", req.params.id, function(err, posts) {
        if(err) {
            throw err;
        }
        // to make sure a category which contains post can't be deleted
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

// to get single post in a category

app.get('/post/:id', function(req, res){
    var id = req.params.id
    db.get("SELECT * FROM posts WHERE id = ?", id, function(err, thisPost){
        var post_row = thisPost;
        post_row.body = markdown.toHTML(post_row.body);
        console.log(post_row);
        // to get all the comments belonging to the post
        db.all("SELECT * FROM comments WHERE post_id = ?", id, function(err, comments) {
            res.render('show-post.ejs', {post: post_row, comments: comments })
        });
    });     
});

// to create a new post
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
            console.log("error in interesting");
            throw err;
        } else {
            console.log("no error");
        }
        res.redirect('/forum/'+catid+'/page/1');
    });
//go to individual category so we can see our new post title

});

// to edit a post
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

// to update  the values after editing a post
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
//redirect to post page to see changes
    res.redirect('/post/' + req.params.id)// needs to be post not posts since only one post
});

// to incorporate upvote
app.post('/post/:id/upvote', function(req, res){
//console.log("put");
    db.run("UPDATE posts SET Upvotes = 1 + Upvotes WHERE id = ?",  req.params.id, function(err) {
        if (err) {
            throw err;
        }  
        console.log("---  inside upvote ---");
        console.log(req.params.id);
    })
//redirect to this post page to see changes
    res.redirect('/post/' + req.params.id)// needs to be post not posts since only one post
});

// incorporate downvote
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

// to leave a commnet to a post
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
});


// to delete a post
app.delete("/post/:id", function(req, res){
    db.run("DELETE FROM posts WHERE id = ?", req.params.id, function(err) {
        if (err) {
            throw err;
        }
    })

    res.redirect('/forums')
});

app.listen('3000')
console.log("Listing to port 3000")
