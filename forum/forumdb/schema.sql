DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
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
category_id INTEGER,
title TEXT,
body TEXT,
image TEXT,
Upvotes INTEGER,
Downvotes INTEGER,
date TEXT
);




DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
id INTEGER PRIMARY KEY,
post_id INTEGER,
comment TEXT
);

