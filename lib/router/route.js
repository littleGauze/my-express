/**
 * Created on 2017/12/6.
 * @fileoverview 请填写简要的文件说明.
 * @author gauze (Firstname Lastname)
 */
const flatten = require('array-flatten');
const methods = require('methods');
const Layer = require('./layer');

module.exports = Route;

function Route (path) {
    this.path = path;
    this.stack = {};
    this.methods = {};
}

Route.prototype._handle_method = function (method) {
    const name = method.toLowerCase();

    return Boolean(this.methods[name]);
};

Route.prototype.dispatch = function (req, res) {
    const method = req.method.toLowerCase();
    const verb = this.stack[method];
    verb.idx = 0;

    if (!this._handle_method(method)) return;

    next();

    function next (err) {
        const layer = verb.handlers[verb.idx++];

        if (!layer) return;

        if (err === 'route') {
            return next();
        }

        if (err) {
            return layer.handle_error(err, req, res, next);
        }
        layer.handle_request(req, res, next);
    }
};

methods.forEach(function (method) {
    Route.prototype[method] = function (...args) {
        const handles = flatten(args);
        this.stack[method] = this.stack[method] || {idx: 0, handlers: []};

        for (let handle of handles) {
            const layer = new Layer('/', {}, handle);
            layer.method = method;
            this.stack[method].handlers.push(layer);
        }

        this.methods[method] = true;
    }
});