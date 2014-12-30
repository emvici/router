emvici-router
=============

express/connect pluggable router middleware

## Installation

```bash
npm install --save emvici-router
```

## Usage

### Configuring middleware

You can simply create a router and plug it as a middleware using `.use` method.

#### Connect

```js
var connect = require( 'connect' ),
    router = require( 'emvici-router' )(),
    app = connect();

app.use( router );

```

#### Express

```js
var express = require( 'express' ),
    router = require( 'emvici-router' )(),
    app = express();

app.use( route );

```

### Route construction

```js

var router = require( 'emvici-router' )();

router.addRoute({ /* options */ })

```

#### Options

###### type

* Defaults to: 'stack'
* Allowed Inputs: 'stack', 'wizard'

###### url

This will determine, by filtering url, which requests this route will run.

* Required
* Allowed Inputs: `String`; `Regexp`; `Array` of `Strings` ; `Array` of previous allowed inputs
* Examples:
    * `'/'`
    * `'/test/lol'`
    * `/^\/users\/(test|testa)/$`
    * `[ '/test', '/test/index' ]`

###### stack

* Required when type is equal to `stack`
* Allowed Inputs: `Function`; `Array` of previous allowed inputs
* Examples:

```js
[
    function ( req, res ) {

        return Promise.cast( req )
            .then( doSomethingAsync );
    },

    function ( req, res, next ) {

        doSomethingAsync( req, function ( err ) {
            if ( err ) return next( err );

            // some logic

            next();
        });

    }
]
```

### Structure convention

We recomend you to place a file called `./router.js` so you can save current app
router and allow Controllers or other modules on your system to load it up and
use it accordely:

```js
// app.js
var connect = require( 'connect' );

var app = connect(),
    router = require( './router' );

app.use( router );
```


```js
// router.js
var router = module.exports = require( 'emvici-router' )({
  /* options */
  throw404: false
});

router.addRoutes( require( './controller/users' ) );
```

```js
// controller/users.js

var someSemiNeededMiddleware = function () {
  // ...
};

module.exports = [

    {
        url: [ '/users', '/users/index', '/users/list' ]
        method: 'get',
        stack: [
          someSemiNeededMiddleware,
          function ( req, res ) {
              // ...
          }
        ],
    },

    {
        url: [ '/users/add', '/users/create', '/users/register' ]
        method: 'post',
        stack: function ( req, res ) {
            // ...
        },
    }

];
```
