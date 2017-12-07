/**
 * Created on 2017/12/6.
 * @fileoverview 请填写简要的文件说明.
 * @author gauze (Firstname Lastname)
 */
const express = require('..');
const app = express();
const admin = express();
const member = express();

app.listen(3000);

app.use('/admin', admin);

admin.use('/member', member);

//localhost:3000/admin/member/one
member.get('/one', function (req, res, next) {
    res.end('subapp member GET /one');
});

//localhost:3000/admin/ma
admin.get('/ma', function (req, res, next) {
    res.end('you send GET at path /admin/ma');
}).post('/insert', function (req, res, next) {
    res.end('you send POST at path /admin/insert');
});

app.use(function (req, res, next) {
    console.log('auth check');
    next();
});

app.use('/name', function (req, res, next) {
    console.log('you will go next ');
    next();
});

app.get('/name', function (req, res, next) {
    req.name = 'nealli';
    next();
});

app.get('/name', function (req, res, next) {
    res.end(`you send GET at path /name: ${req.name}`);
});

app.get('/name', function (err, req, res, next) {
    console.log(err);
    throw err;
});

app.get('/user/:id/:motto', function (req, res, next) {
    res.end(`user id is ${req.params.id} motto is ${req.params.motto}`);
});

app.param('id', function (req, res, next, id, key) {
    console.log('id ', id, key);
    next();
}, function (req, res, next, id, key) {
    console.log('id2 ', id, key);
    next();
});

app.param('motto', function (req, res, next, motto, key) {
    console.log('motto ', motto, key);
    next();
});

app.post('/name', function (req, res, next) {
    res.end('you send post at path /name');
});

app.use(function (err, req, res, next) {
    console.log('something wrong');
    throw err;
});
