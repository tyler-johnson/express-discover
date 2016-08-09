function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function formatPath(path, params={}) {
  if (typeof path !== "string") {
    return "";
  }

  return path.replace(/:(\w+)(\?)?/g, function (m, param, optional) {
    if (!optional && !has(params, param)) {
      return m;
    }

    return params[param];
  });
}

function registerService(parent, app) {
  // don't setup until there is a parent
  if (!parent) {
    app.once("mount", (p) => registerService(p, app));
  }

  // if the parent isn't a service, check its parent instead
  else if (!parent.serviceName) {
    if (parent.parent) registerService(parent.parent, app);
    else parent.once("mount", (p) => registerService(p, app));
  }

  // add this app to parent services
  else {
    parent.services[app.serviceName] = app;
  }
}

export default function(app, name, backupPaths={}) {
  if (app.serviceName) {
    throw new Error("This express app has already been configured as a service.");
  }

  app.serviceName = name;
  app.services = {};
  registerService(app.parent, app);

  app._findService = function(name) {
    // look for service by name directly
    const child = this.discoverChild(name);
    if (child != null) return child;

    // look through all children
    return this.findInChildren((child) => {
      return child._findService(name);
    });
  };

  app._findServicePath = function(name) {
    // look for service by name directly
    const child = this.discoverChild(name);
    if (child != null) return child.path();

    // look in backup paths
    if (has(backupPaths, name)) {
      return backupPaths[name];
    }

    // look through all children
    return this.findInChildren((child) => {
      return child._findServicePath(name);
    });
  };

  app.discoverChild = function(name) {
    if (has(this.services, name)) {
      return this.services[name];
    }
  };

  app.findInChildren = function(fn) {
    for (let n in this.services) {
      if (!has(this.services, n)) continue;
      const res = fn.call(this, this.services[n], n, this.services);
      if (res != null) return res;
    }
  };

  app.rootService = function() {
    let a = this.parent;
    let rootapp = this;

    while (a) {
      if (a.serviceName != null) rootapp = a;
      a = a.parent;
    }

    return rootapp;
  };

  app.discover = function(name) {
    // only the root application can return services
    const service = this.rootService();

    // return root app if the name matches
    if (service.serviceName === name) {
      return service;
    }

    // look in the entire tree for a service by name
    return service._findService(name);
  };

  app.discoverPath = function(name, params) {
    let path;

    // only the root application can return services
    const service = this.rootService();

    // return root app if the name matches
    if (service.serviceName === name) {
      path = service.path();
    }

    // look in the entire tree for a service by name
    else {
      path = service._findServicePath(name);
    }

    return path != null ? formatPath(path, params) : null;
  };

  return app;
}
