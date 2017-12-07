/**
 * Created on 2017/12/6.
 * @fileoverview 请填写简要的文件说明.
 * @author gauze (Firstname Lastname)
 */
const Route = require('./route');
const Layer = require('./layer');
const methods = require('methods');
const parseUrl = require('parseurl');
const mixin = require('merge-descriptors');
const querystring = require('querystring');

const setPrototypeOf = Object.setPrototypeOf;

const proto = module.exports = function (options = {}) {
    function router (req, res, next) {
        router.handle(req, res, next);
    }

    mixin(router, options);
    setPrototypeOf(router, proto);
    router.stack = [];
    router.registered_route = {};
    router.params = {};

    return router;
};

proto.handle = function (req, res, next) {
    const self = this;
    const stack = this.stack;
    let idx = 0;
    const notFound = function () {
        res.statusCode = 404;
        res.end('<div>Not Found</div>');
    };

    next();

    function next (err) {
        const layerError = err;
        if (idx >= stack.length) {
            return setImmediate(notFound);
        }

        let path = getPathname(req);
        let layer, match, route;

        if (req.parentPath) {
            path = path.replace(req.parentPath, '')
        }

        while (!match && idx < stack.length) {
            layer = stack[idx++];
            match = matchLayer(layer, path);
            route = layer.route;

            if (!match || !route) {
                continue;
            }

            const method = req.method.toLowerCase();
            const hasMethod = route._handle_method(method);
            if (!hasMethod) {
                match = false;
            }
        }

        if (!match) {
            return notFound();
        }

        req.params = layer.params;

        //处理params
        self.process_params(layer, req, res, function () {
            if (layerError) {
                return layer.handle_error(layerError, req, res, next);
            }
            return layer.handle_request(req, res, next);
        });

    }
};

proto.param = function param (name, ...fn) {
    (this.params[name] = this.params[name] || []).push(...fn);
};

proto.route = function (path) {
    const pathName = querystring.escape(path);
    let route = this.registered_route[pathName];
    if (route) {
        return route;
    }

    route = new Route(path);
    const layer = new Layer(path, {}, route.dispatch.bind(route));

    layer.route = route;
    this.stack.push(layer);
    this.registered_route[pathName] = route;

    return route;
};

proto.use = function use (path, ...fn) {
    if (typeof path === 'function') {
        fn = [path, ...fn];
        path = '*';
    }
    for (let f of fn) {
        let parentPath;
        if (f.name === 'app') {
            parentPath = path;
        }

        let layer = new Layer(path, {
            sensitive: this.caseSensitive,
            strict: false,
            end: false,
            parentPath
        }, f);

        this.stack.push(layer);
    }
    return this;
};

proto.process_params = function processParams (layer, req, res, done) {
    const params = this.params;
    const keys = layer.keys;

    if (!keys || !keys.length) {
        return done();
    }

    let kIdx = 0;
    let cIdx = 0;
    let name;
    let key;
    let val;
    let paramCallbacks;

    function param () {
        if (keys.length <= kIdx) {
            return done();
        }

        //重置paramCallback的下标
        cIdx = 0;
        key = keys[kIdx++];
        name = key.name;
        val = req.params[name];
        paramCallbacks = params[name];

        if (!val || !paramCallbacks) {
            return param();
        }

        paramCallback();
    }

    function paramCallback () {
        const fn = paramCallbacks[cIdx++];

        if (!fn) return param();
            fn(req, res, paramCallback, val, name);
        try {

        } catch (err) {
            throw err;
        }
    }

    return param();
};

methods.forEach(function (method) {
    proto[method] = function (path, ...fn) {
        const route = this.route(path);
        route[method](...fn);
        return this;
    }
});

function getPathname (req) {
    try {
        return parseUrl(req).pathname;
    } catch (err) {
        return undefined;
    }
}

function matchLayer (layer, path) {
    try {
        return layer.match(path);
    } catch (err) {
        return err;
    }
}