
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


app.get('/', function(req, res){
	res.redirect('/forums')
});

// to get all the catagories
app.get('/forums', function(req, res) { // all posts, blogs
	db.all("SELECT * FROM catagories;", function(err, data) { // db for database not the name of database
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
// 	var search = req.query.search;
// 	if (search === catagories.title) {
// 		db.get("SELECT search FROM catagories;", function(catagories, posts) {	
// 		});
// 	}	else if (search === posts.title) {
// 		db.get('SELECT search FROM posts;', function(catagories, posts) {	
// 		});
// 	}	res.render('index.ejs', {catagories: catagories, posts: posts})
// });
// *************************** new code end ************************

// to get single catagory
app.get('/forum/:id', function(req, res){
	var id = req.params.id;
	db.get("SELECT * FROM catagories WHERE id = ?", id, function(err, thisCatagory){
		var catagory_row = thisCatagory;
		console.log(catagory_row);
		var catagory_id = req.params.id
		db.all("SELECT posts.id, posts.title FROM posts INNER JOIN catagories ON catagories.id = posts.catagory_id WHERE catagory_id = ?", thisCatagory.id,  function(err, posts){
			var post_row = posts;
			console.log("=================== start posts =======");
			console.log(post_row);
			console.log("=================== end posts =========");
	
			res.render('show-catagory.ejs', {'catagory': catagory_row, 'posts': posts })
		});		
	});
});


// for new catagory
app.get('/catagories/new', function(req, res){
	res.render('new-catagory.ejs')
});

app.post('/catagories', function(req, res){
	console.log(req.body)
    //get info from req.body, make new post
    db.run("INSERT INTO catagories (title, body, image, Upvotes, Downvotes) VALUES (?, ?, ?, 0, 0)",  req.body.title, req.body.body, req.body.image, req.body.Upvotes, req.body.Downvotes, function(err) {
    	if (err) {
    		throw err;
    	}
    });
    //go to forum so we can see our new catagory
    res.redirect('/forums')
});

app.get('/forum/:id/edit', function(req, res){
	var id = req.params.id
	db.get("SELECT * FROM catagories WHERE id = ?", id, function(err, thisCatagory) {
		if (err) {
			throw err
		} else {
			res.render("edit-catagory.ejs", {thisCatagory: thisCatagory})
		}
	});
});
app.put('/forum/:id', function(req, res){
	console.log("put");
    //make changes to appropriate post
    db.run("UPDATE catagories SET title = ?, body = ?, image = ?, Upvotes = ?, Downvotes = ? WHERE id = ?", req.body.title, req.body.content, req.body.image, req.body.Upvotes, req.body.Downvotes, req.params.id, function(err) {
    	if (err) {
    		throw err
        } // console.log(res)
    })
    //redirect to this indivudual catagory page to see changes
    res.redirect('/forum/' + req.params.id)// needs to be blog not blogs since only one post
});

app.post('/forum/:id/upvote', function(req, res){
	//console.log("put");
    db.run("UPDATE catagories SET Upvotes = 1 + Upvotes WHERE id = ?",  req.params.id, function(err) {
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
    db.run("UPDATE catagories SET Downvotes = Downvotes -1 WHERE id = ?",  req.params.id, function(err) {
    	if (err) {
    		throw err;
        }  
        //console.log("---  inside upvote ---");
        console.log(req.body);
    })
    //redirect to this blog page to see changes
    res.redirect('/forum/' + req.params.id)// needs to be blog not blogs since only one post
});

app.delete("/forum/:id", function(req,res){
	db.run("DELETE FROM catagories WHERE id = ?", req.params.id, function(err) {
		if (err) {
			throw err
		}
	})
    //go to forum to see change
    res.redirect('/forums')
});

// to get single post in catagory

app.get('/post/:id', function(req, res){
	var id = req.params.id
	db.get("SELECT * FROM posts WHERE id = ?", id, function(err, thisPost){
		var post_row = thisPost;
		console.log(post_row);
		res.render('show-post.ejs', {post: post_row })
	});		
});

// for new post
app.get('/catagory/:catagoryid/posts/new', function(req, res){
	var cid = req.params.catagoryid;
	res.render('new-post.ejs', {'catagory_id': cid})
});

app.post('/catagory/:catid/post/savenewpost', function(req, res){
	var catid = req.params.catid;
	console.log(req.body)
    //get info from req.body, make new post
    db.run("INSERT INTO posts (catagory_id, title, body, image, Upvotes, Downvotes) VALUES (?, ?, ?, ?, ?, ?)",  catid, req.body.title, req.body.body, req.body.image, req.body.Upvotes, req.body.Downvotes, function(err) {
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
    db.run("UPDATE posts SET  title = ?, body = ?, image = ?, Upvotes = ?, Downvotes = ? WHERE id = ?",  req.body.title, req.body.content, req.body.image, req.body.Upvotes, req.body.Downvotes, req.params.id, function(err) {
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
        console.log(req.body);
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
    //redirect to this blog page to see changes
    res.redirect('/post/' + req.params.id)// needs to be blog not blogs since only one post
});


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



