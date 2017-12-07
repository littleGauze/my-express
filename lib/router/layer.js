/**
 * Created on 2017/12/6.
 * @fileoverview 请填写简要的文件说明.
 * @author gauze (Firstname Lastname)
 */
const pathRegexp = require('path-to-regexp');

module.exports = Layer;

function Layer(path, options, fn) {
    const opts = options || {};
    this.handle = fn;
    this.name = fn.name || '<anonymous>';
    this.parentPath = opts.parentPath || '';
    this.regexp = pathRegexp(path, this.keys = [], opts);
    this.regexp.fast_star = path === '*';
    this.regexp.fast_slash = path === '/';
    this.params = {};
    this.path = '';
}

Layer.prototype.handle_request = function (req, res, next) {
    const fn = this.handle;
    req.parentPath = (req.parentPath || '') + this.parentPath;

    if (fn.length > 3) {
        return next();
    }

    try {
        fn(req, res, next);
    } catch (err) {
        throw err;
    }
};

Layer.prototype.handle_error = function (error, req, res, next) {
    const fn = this.handle;
    if (fn.length !== 4) {
        return next(error);
    }

    try {
        fn(error, req, res, next);
    } catch (err) {
        res.statusCode = 500;
        res.end('internal server error.');

        console.log(console.trace());
    }
};

Layer.prototype.match = function match (path) {
    if (path) {
        if (this.regexp.fast_star || this.regexp.fast_slash) {
            return true;
        }

        let match = this.regexp.exec(path);
        if (!match) {
            return false;
        }

        this.path = match[0];
        const params = this.params;

        const props = match.slice(1);
        const keys = this.keys;
        for (let [idx, val] of props.entries()) {
            let key = keys[idx];
            if (key && val) {
                params[key.name] = val;
            }
        }

        return true;
    }
};