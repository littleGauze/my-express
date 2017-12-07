# my-express
express的简单实现
> 参照 `sunkuo/grow-to-express` 项目

# exsamples
```js
/**
 * Created on 2017/12/6.
 * @fileoverview 请填写简要的文件说明.
 * @author gauze (Firstname Lastname)
 */
const express = require('..');
const app = express();

app.listen(3000);

//全局中间件可用于用户登录验证等
app.use(function (req, res, next) {
    console.log('auth check');
    next(new Error('something wrong'));
});

//路由中间件
app.use('/name', function (req, res, next) {
    console.log('you will go next ');
    next();
});

//路由
app.get('/name', function (req, res, next) {
    req.name = 'nealli';
    next(new Error('got wrong'));
});

app.get('/name', function (req, res, next) {
    res.end(`you send GET at path /name: ${req.name}`);
});

//路由错误监听处理，四个参数为错误处理句柄
app.get('/name', function (err, req, res, next) {
    console.log(err);
    throw err;
});

app.get('/user/:id/:motto', function (req, res, next) {
    res.end(`user id is ${req.params.id} motto is ${req.params.motto}`);
});

//params参数监听
app.param('id', function (req, res, next, id, key) {
    console.log('id ', id, key);
    next();
}, function (req, res, next, id, key) {
    console.log('id2 ', id, key);
    next();
});

//params参数监听
app.param('motto', function (req, res, next, motto, key) {
    console.log('motto ', motto, key);
    next();
});

app.post('/name', function (req, res, next) {
    res.end('you send post at path /name');
});

//全局错误处理函数
app.use(function (err, req, res, next) {
    console.log('something wrong');
    throw err;
});


```
