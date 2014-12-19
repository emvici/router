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

router.route({

    /* options */

})

```

#### Options

###### url

This will determine, by filtering url, which requests this route will run.

* Required
* Allowed Inputs: `String`; `Regexp` ; `Array` of previous allowed inputs
* Examples:
    * `'/'`
    * `'/test/lol'`
    * `/^\/users\/(test|testa)/$`
    * `[ '/test', '/test/index' ]`

###### steps

This should be a function or an array of functions that will run when this route
matches a request.

* Required
* Allowed Inputs:
* Examples:
    * ```js
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

###### type

* Default Value: 'simple', // Defaults to simple or wizard // if action is ( Array [] or String "" ) or ( Object {} )
* Allowed Inputs:




###### verb

* Default Value: 'POST', // Defaults always to All, can be: POST, GET, ALL // This prefix will be used on all action functions callers
* Allowed Inputs:




###### prefix

* Default Value: false, // Defaults to empty string
* Allowed Inputs:




###### view

* Default Value: false, // Defauts to Controller name +'/'+ action +'.html'
* Allowed Inputs:





### Structure convention

We recomend you to place a file called `./router.js` so you can save current app
router and allow Controllers or other modules on your system to load it up and
use it accordely:

```js
// router.js
module.exports = require( 'emvici-router' )();
```

```js
// controller/users/index.js

var router = require( '../../router' );


// Your route configurations

router.routes([

    {
        url: [ '/users', '/users/index', '/users/list' ]
        method: 'get',
        action: function ( req, res ) {
            // ...
        },
    },

    {
        url: [ '/users/add', '/users/create', '/users/register' ]
        method: 'post',
        action: function ( req, res ) {
            // ...
        },
    },

]);


```
