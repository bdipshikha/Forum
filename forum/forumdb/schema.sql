DROP TABLE IF EXISTS catagories;
CREATE TABLE catagories (
id INTEGER PRIMARY KEY,
title TEXT,
body TEXT,
image TEXT,
votes INTEGER
);



DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
id INTEGER PRIMARY KEY,
catagory_id INTEGER
author_id INTEGER,
title TEXT,
body TEXT,
image TEXT,
votes INTEGER
);


DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
id INTEGER PRIMARY KEY,
comment TEXT,
post_id INTEGER
);

DROP TABLE IF EXISTS subscribers;
CREATE TABLE subscribers (
id INTEGER PRIMARY KEY,
name TEXT,
email TEXT
);

DROP TABLE IF EXISTS authors;
CREATE TABLE authors (
id INTEGER PRIMARY KEY,
name TEXT,
image TEXT
);