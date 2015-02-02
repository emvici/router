## Roadmap
- Examples:
    - User register wizard-based
    - Replacement of express-router by emvici-router on an express app
- Share generated route as context for stacks

## 0.0.8
- Added a short-circuit feature for router.
- Added `strictNavigation` option to replace `lockdown` feature on WizardRoutes.
- Multiple fixes on wizard routes

## 0.0.7
- Not defined variable fix

## 0.0.6
- Minor wizard fixes

## 0.0.5
- Minor wizard fixes

## 0.0.4
- `next()` should always exit router on stack end, unless we specify 'route'.
    Example: `next( 'route' )`

## 0.0.3
- Fixed bug into `router.addRoutes` because of a mispelling variable reference
- Set `emvici_router` name to middleware function for debug proposes
- `Router.dispatch[next]` should only try to find another route if a string
'route' is specified!

## 0.0.2
- Add stacks per param, similar to `.param` API provided by [express](https://github.com/visionmedia/express)
- Changed name of each Class to `function.name` for better debugs


## 0.0.1
- Stack-based route full support
- Wizard-based route basic support
