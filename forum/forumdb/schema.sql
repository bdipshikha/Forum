DROP TABLE IF EXISTS catagories;
CREATE TABLE catagories (
id INTEGER PRIMARY KEY,
title TEXT,
body TEXT,
image TEXT,
Upvotes INTEGER,
Downvotes INTEGER
);



DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
id INTEGER PRIMARY KEY,
catagory_id INTEGER,
title TEXT,
body TEXT,
image TEXT,
Upvotes INTEGER,
Downvotes INTEGER
);




DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
id INTEGER PRIMARY KEY,
post_id INTEGER,
comment TEXT
);

