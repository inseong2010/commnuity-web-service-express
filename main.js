var express = require("express");
var app = express();
const fs = require("fs");
var path = require('path');
var sanitizehtml = require('sanitize-html');
var compression = require('compression');
var template = require('./lib/template');
const PORT = 80;

app.use(express.static('public'));
app.use(express.urlencoded({ extends: false}));
app.use(compression());
app.get('*', (req, res, next) => {
    fs.readdir('./data', (err, filelist) => {
        req.list = filelist;
        next();
    });
});

app.get('/', (req, res) => {
    var title = 'welcome';
    var description = 'hello';
    var list = template.LIST(req.list);
    var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);
    res.send(html);
});

app.get('/page/:pageId', (req, res, next) => {
    var filteredhack = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredhack}`, 'utf8', function(err, description) {
        if (err) {
            next(err);
        } else {
        var title = req.params.pageId;
        var sanitizedTitle = sanitizehtml(title);
        var sanitizedDescription = sanitizehtml(description);
        var list = template.LIST(req.list);
        var html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`, 
        `<a href="/create">create</a>
            <a href="/update/${sanitizedTitle}">update</a> 
            <form action="/delete" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
            </form>
            `);
        res.send(html);
        };
    });
});

app.get('/create', (req, res) => {
var title = 'new page';
var list = template.LIST(req.list);
var html = template.HTML(title, list, `
    <form action="/create" method="post">
    <p><input type="text" name="title" placeholder="title"class="title"></p>
    <p>
        <textarea name="description" placeholder="description" class="desc"></textarea>
    </p>
    <p>
        <input type="submit">
    </p>
    </form>
`, '');
res.send(html);
});

app.post('/create', (req, res) => {
    var post = req.body;
    var title = post.title;
    var description = post.description
    fs.writeFile(`data/${title}`, description, (err) => {
        if (err) throw err;
        else {
            res.redirect(`/page/${title}`);
        };
    });
});

app.get('/update/:pageId', (req, res) => {
    var filteredhack = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredhack}`, 'utf8', function(err, description) {
    var list = template.LIST(req.list);
    var title = req.params.pageId;
    var html = template.HTML(title, list, 
    `
    <form action="/update" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title"class="title" value="${title}"></p>
        <p>
            <textarea name="description" placeholder="description" class="desc">${description}</textarea>
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `, `<a href="/create">create</a> <a href="/update/${title}">update</a>`);
        res.send(html);
    });
});

app.post('/update', (req, res) => {
    var post = req.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(err) {
        if (err) {
            console.log('ERROR:' + err);
            throw err;
        }
        fs.writeFile(`data/${title}`, description, (err) => {
            if (err) throw err;
            else {
                res.redirect(`/page/${title}`);
            };
        });
    });
});

app.post('/delete', (req, res) => {
    var post = req.body;
    var id = post.id;
    var filteredhack = path.parse(id).base;
    fs.unlink(`data/${filteredhack}`, function(err){
        res.redirect('/');
    });
});

app.use((req, res, next) => {
    res.status(404).send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            body {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <p>Page Not found</p>
    </body>
    </html>
    `);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            body {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <p>Something broke</p>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(PORT)
});









/* var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template');
var path = require('path');
var sanitizehtml = require('sanitize-html');

var app = http.createServer(function(request,response) {
    var QueryData = url.parse(request.url, true).query;
    var uri = url.parse(request.url, true).pathname;

    if (uri === '/') {
        if (QueryData.page === undefined) {
        } else {
    } else if (uri === '/create') {
    } else if (uri === '/create_process') {
    } else if (uri === '/update') {
    } else if (uri === '/update_process') {
    } else if (uri === '/delete_process') {
     } else {
        response.writeHead(404);
        response.end(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                body {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <p>Not found</p>
        </body>
        </html>
        `);
    }
});
app.listen(3000); */