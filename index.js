// Generated by CoffeeScript 1.3.3
var $, cache, ctx, hogan, read, render, render_layout, render_partials,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = {};

__extends($, require('fs'));

__extends($, require('util'));

__extends($, require('path'));

hogan = require('hogan.js');

cache = {};

ctx = {};

read = function(path, options, fn) {
  var str;
  str = cache[path];
  if (options.cache && str) {
    return fn(null, str);
  }
  return $.readFile(path, 'utf8', function(err, str) {
    if (err) {
      return fn(err);
    }
    if (options.cache) {
      cache[path] = str;
    }
    return fn(null, str);
  });
};

render_partials = function(partials, opt, fn) {
  var count, name, path, result;
  count = 1;
  result = {};
  for (name in partials) {
    path = partials[name];
    if (typeof path !== 'string') {
      continue;
    }
    if (!$.extname(path)) {
      path += ctx.ext;
    }
    path = ctx.lookup(path);
    count++;
    read(path, opt, (function(name, path) {
      return function(err, str) {
        if (!count) {
          return;
        }
        if (err) {
          count = 0;
          fn(err);
        }
        result[name] = str;
        if (!--count) {
          return fn(null, result);
        }
      };
    })(name, path));
  }
  if (--count) {
    return fn(null, result);
  }
};

render_layout = function(path, opt, fn) {
  if (!path) {
    return fn(null, false);
  }
  if (!$.extname(path)) {
    path += ctx.ext;
  }
  path = ctx.lookup(path);
  if (!path) {
    return fn(null, false);
  }
  return read(path, opt, function(err, str) {
    if (err) {
      return fn(err);
    }
    return fn(null, str);
  });
};

render = function(path, opt, fn) {
  var partials;
  ctx = this;
  partials = opt.settings.partials || {};
  if (opt.partials) {
    partials = __extends(partials, opt.partials);
  }
  return render_partials(partials, opt, function(err, partials) {
    if (err) {
      return fn(err);
    }
    return render_layout(opt.layout || opt.settings.layout, opt, function(err, layout) {
      return read(path, opt, function(err, str) {
        var tmpl;
        if (err) {
          return fn(err);
        }
        try {
          tmpl = layout ? (partials["yield"] = str, hogan.compile(layout, opt)) : hogan.compile(str, opt);
          return fn(null, tmpl.render(opt.locals, partials));
        } catch (err) {
          return fn(err);
        }
      });
    });
  });
};

module.exports = render;
