# express-discover

[![npm](https://img.shields.io/npm/v/express-discover.svg)](https://www.npmjs.com/package/express-discover) [![David](https://img.shields.io/david/tyler-johnson/express-discover.svg)](https://david-dm.org/tyler-johnson/express-discover) [![Build Status](https://travis-ci.org/tyler-johnson/express-discover.svg?branch=master)](https://travis-ci.org/tyler-johnson/express-discover)

Allows connected Express applications to discover each other without configuration.

## Install

Install from NPM

```bash
npm install express-discover -S
```

And import into your project

```js
import registerService from "express-discover";
```

```js
const registerService = require("express-discover");
```

## Usage

The default exported method sets up an Express app to be used in a middleware network, such that each Express app is discoverable by name. The `registerService` method should be called on *all* Express applications that need to be discovered.

```js
const mainapp = express();
registerService(mainapp, "main");

const authapp = express();
registerService(authapp, "auth");
```

Once all the apps have been registered, they need to be connected. This done very simply by using the middleware. As long as all the middleware have a shared root Express app, they can discover one another, even if they are deeply buried in many other Express apps.

```js
// use just like you normally would
mainapp.use("/auth", authapp);

// now main and auth can find each other!
authapp.discover("main") === mainapp; // true
mainapp.discoverPath("auth") === "/auth"; // true
```

## API

#### `registerService( app, name [, backupPaths ] )`

The default exported function that setups an app to be discovered.

- `app` (Express App, *required*) - The application to make discoverable. Discovery API functions will be attached this app as well.
- `name` (String, *required*) - The name of the application. It is recommended to make this value unique. When discovering apps, the first app with the specified name is returned.
- `backupPaths` (Object) - An object of service names to string paths. This is used by `app.discoverPath()` when an app can't be found.

#### `app.discover( name )`

Returns the first discoverable app with `name`.

- `name` (String, *required*) - The name of the app you are attempting to discover. This should match what was given to `registerService()`.

#### `app.discoverPath( name [, params ] )`

Returns the full URL path to the first discoverable app with `name`. Since this uses `app.path()`, it has the [side effect of returning application mount path literals](http://expressjs.com/en/4x/api.html#app.path). To combat this issue, you can pass an object of params to values, to fill in Express path segments like `/:param`.

- `name` (String, *required*) - The name of the app you are attempting to get the URL for.  This should match what was given to `registerService()`.
- `params` (Object) - An object of URL parameters to fill in.
