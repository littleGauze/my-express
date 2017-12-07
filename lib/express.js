/**
 * Created on 2017/12/6.
 * @fileoverview 请填写简要的文件说明.
 * @author gauze (Firstname Lastname)
 */
const http = require('http');
const mixin = require('merge-descriptors');
const methods = require('methods');
const Router = require('./router');

module.exports = function createServer() {
    const app = function (req, res) {
        app.handle(req, res);
    };

    mixin(app, proto, false);
    app.init();

    return app;
};

const proto = Object.create(null);

proto.init = function () {
    this._router = new Router({});
};

proto.listen = function (...args) {
    const server = http.createServer(this);

    return server.listen(...args);
};

proto.use = function (...arg) {
    this._router.use(...arg);
    return this;
};

proto.param = function (...arg) {
    this._router.param(...arg);
    return this;
};

proto.handle = function (...args) {
    this._router.handle(...args);
};

methods.forEach(function (method) {
    proto[method] = function (...args) {
        this._router[method](...args);
        return this;
    };
});

