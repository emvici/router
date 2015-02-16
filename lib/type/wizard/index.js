var Route = require( '../../route' ),
    Path = require( '../../path' ),
    Branch = require( './branch' ),
    Store = require( './store' ),
    Util = require( 'findhit-util' ),
    Stack = require( 'stack-queue' ),
    RouteError = require( '../../error' ),
    Promise = require( 'bluebird' ),

    debug = require( 'debug' )( 'emvici-router:route:type:wizard' );

// -----------------------------------------------------------------------------

function WizardRoute () {
    throw new Error([

        "You can't use WizardRoute directly to construct a new WizardRoute.",
        "Please use WizardRoute.construct method instead"

    ].join(" "));
};

// Export WizardRoute
module.exports = WizardRoute;

// Extend WizardRoute prototype from Route prototype
WizardRoute.prototype = Object.create( Route.prototype );

/* class methods */

WizardRoute.construct = function ( ConstructedRoute ) {
    var options = ConstructedRoute.options;
    options.__proto__ = WizardRoute.construct.defaultOptions;

    ConstructedRoute.methods = [ 'GET', 'POST', 'OPTIONS' ];

    ConstructedRoute.basePath = options.url[0];
    ConstructedRoute.branches = [];
    ConstructedRoute.steps = [];

    ConstructedRoute.root = new Branch( ConstructedRoute, null, 'root', options.steps );

    Util.Array.each( options.url, function ( url ) {
        ConstructedRoute.paths.push(
            new Path( url + '/:step(' + ConstructedRoute.steps.map(function ( step ) { return step.id }).join('|') + ')?' )
        );
    });
debug('ConstructedRoute initialized');
    ConstructedRoute.initialized = new Stack().queue(
        Util.is.Array( options.initialized ) && options.initialized ||
        Util.is.Function( options.initialized ) && [ options.initialized ] ||
        []
    );

    ConstructedRoute.reseted = new Stack().queue(
        Util.is.Array( options.reseted ) && options.reseted ||
        Util.is.Function( options.reseted ) && [ options.reseted ] ||
        []
    );

    ConstructedRoute.cancelled = new Stack().queue(
        Util.is.Array( options.cancelled ) && options.cancelled ||
        Util.is.Function( options.cancelled ) && [ options.cancelled ] ||
        []
    );

    ConstructedRoute.completed = new Stack().queue(
        Util.is.Array( options.completed ) && options.completed ||
        Util.is.Function( options.completed ) && [ options.completed ] ||
        []
    );

    if( [ 'function', 'boolean' ].indexOf( typeof options.strictNavigation ) === -1 ) {
        throw new TypeError( "strictNavigation should be a function or boolean" );
    }

    ConstructedRoute.strictNavigation =
        typeof options.strictNavigation == 'boolean' && Util.Function.return( options.strictNavigation ) ||
        options.strictNavigation;

    return ConstructedRoute;
};

WizardRoute.construct.defaultOptions = {

    __proto__: Route.construct.defaultOptions,
    type: 'wizard',

    // TODO:
    // Think about implementation of this feature
    /**
     * The WizardRoute will redirect to the "expected step" after a step has been successfully
     * completed if autoAdvance is true. If false, the WizardRoute will redirect to
     * the next step in the root branch. (This is helpful for returning a user to
     * the expected step after editing a previous step w/o them having to navigate through
     * each step in between.)
     *
     * @var boolean
     */
    //autoAdvance: true,

    /**
     * Option to automatically reset if the wizard does not follow "normal"
     * operation. (ie. manual url changing, navigation away and returning, etc.)
     * Set this to false if you want the Wizard to return to the "expected step"
     * after invalid navigation.
     *
     * @var boolean
     */
    autoReset: true,

    /**
     * List of steps, in order, that are to be included in the wizard.
     *		basic example: $steps = array('contact', 'payment', 'confirm');
     *
     * The $steps array can also contain nested steps arrays of the same format but must be wrapped by a branch group.
     * 		plot-branched example: $steps = array('job_application', array('degree' => array('college', 'degree_type'), 'nodegree' => 'experience'), 'confirm');
     *
     * The 'branchnames' (ie 'degree', 'nodegree') are arbitrary but used as selectors for the branch() and unbranch() methods. Branches
     * can point to either another steps array or a single step. The first branch in a group that hasn't been skipped (see branch())
     * is included by default (if $defaultBranch = true).
     *
     * @var array
     */
    steps: {},

    /**
     * Url to be redirected to after the wizard has been completed.
     * `completed` stack is called directly before redirection.
     *
     * @var mixed
     */
    completedUrl: '/',

    /**
     * Stack of functions to be run once a wizard is completed
     *
     * @var mixed
     */
    completed: undefined,

    /**
     * Url to be redirected to after the wizard has been completed.
     * `reseted` stack is called directly before redirection.
     *
     * @var mixed
     */
    resetedUrl: undefined,

    /**
     * Stack of functions to be run once a wizard is reseted
     *
     * @var mixed
     */
    reseted: undefined,

    /**
     * Url to be redirected to after 'Cancel' submit button has been pressed by user.
     *
     * @var mixed
     */
    cancelledUrl: '/',

    /**
     * Stack of functions to be run once a wizard is cancelled
     *
     * @var mixed
     */
    cancelled: undefined,

    /**
     * Should have a function that will run ( currentStep, expectedStep, route )
     * arguments. It should eval and return true if you want to strict navigation
     * on this case to prefered step.
     *
     * You could also specify a boolean that will be converted into a function
     * that will return always true or false.
     *
     * Defaults to true.
     *
     * @var mixed
     */
    strictNavigation: true,

};

/* instance methods */

WizardRoute.prototype.dispatch = function () {

    var req = this.req,
        res = this.res,
        next = this.nextRoute;

    // Load store into this route
    this.store = new Store( this );

    // Generate available steps into this.steps
    this.generateAvailableSteps();
    this.generateAvailableBranches();

    // Guess requested step
    this.requestedStep =
        this.constructor.steps[ this.params.step ] ||
        null;

    // Guess which step we are
    this.currentStep =
        this.store.current && this.constructor.steps[ this.store.current ] ||
        null;

    // Guess in which step we should be
    this.expectedStep =
        this.currentStep ||

        // If there aren't processed steps, it should be the first one
        this.store.processedSteps.length === 0 && this.steps[ 0 ] ||

        // Otherwise, it should be the next step after the last processed
        this.steps[
            this.steps.indexOf(
                this.constructor.steps[
                    this.store.processedSteps[
                        this.store.processedSteps.length - 1
                    ]
                ]
            ) + 1
        ];

    // Run stages
    return Promise.cast().bind( this )
    .then(function () {
        debug( 'expected', this.expectedStep && this.expectedStep.name );
        debug( 'requested', this.requestedStep && this.requestedStep.name );
        debug( 'current', this.currentStep && this.currentStep.name );
    })
    .then(function () { if( this._shouldSkip() ) return;

        debug( "checking if we should strict navigation" );

        if(
            // We have a currentStep
            this.requestedStep &&

            // Current step is different from expected step
            this.requestedStep !== this.expectedStep &&

            // And strictNavigation told us to strict it
            this.constructor.strictNavigation(
                this.requestedStep,
                this.expectedStep,
                this
            )
        ) {
            this.currentStep = this.expectedStep;

            // Redirect to expected step
            res.redirect( this.expectedStep.url );
        } else {
            // Otherwise use requestedStep
            this.currentStep = this.requestedStep;
        }

    })
    .then(function () { if( this._shouldSkip() ) return;

        debug( "check if we should initialize wizard" );

        if(
            ( ! this.requestedStep || this.requestedStep === this.steps[0] ) ||
            ! this.currentStep
        ) {
            this.currentStep = this.requestedStep = this.steps[0];
        }
    })
    .then(function () { if( this._shouldSkip() ) return;

        debug( "check for bad requests" );

        if(
            ! this.requestedStep
        ) {

            if( this.constructor.options.autoReset ) {
                return this.reset();
            }

            throw new RouteError.BadRequest([
                "Steps should match when not in strict mode.",
                "To disable this error, please enable autoReset option."
            ].join( " " ));

        }

    })
    // Detect if it is Canceled
    .then(function () { if( this._shouldSkip() ) return;

        debug( "canceled detection stage" );

        if(
            req.param &&
            (
                typeof req.param( 'Cancel' ) != 'undefined' ||
                typeof req.param( 'cancel' ) != 'undefined'
            )
        ) {
            return this.cancel();
        }

    })
    // Detect if it is Reseted
    .then(function () { if( this._shouldSkip() ) return;

        debug( "reseted detection stage" );

        if(
            req.param &&
            (
                typeof req.param( 'Reset' ) != 'undefined' ||
                typeof req.param( 'reset' ) != 'undefined'
            )
        ) {
            return this.reset();
        }

    })
    // Check if it should Initialize store
    // @todo initialize store code
    .then(function () { if( this._shouldSkip() ) return;

        debug( "initialize detection stage: store" );

        if( ! this.store.initialized ) {
            this.store.initialized = true;
        }

    })
    // Run Code needed for the routes to work
    .then(function () { if( this._shouldSkip() ) return;

        debug( "initialize detection stage: initialize step" );

        if ( this.constructor.initialized ) {
            return this.constructor.initialized.dispatch( req, res );
        }

    })
    // Check if it should run step.process stack
    .then(function () { if( this._shouldSkip() ) return;

        debug( "step.process detection stage" );

        if( req.method == 'POST' ) {
            debug( "running step.process" );
            return this.currentStep.process
            .dispatch( req, res )
            .bind( this )
            .then(function () {

                this.process( this.currentStep.name );

                // Alterar o step a processar
                this.currentStep = this.nextStep();

                if( ! this.currentStep ) {

                    debug( "completing wizard" );

                    return this.complete();

                } else {

                    res.redirect( this.currentStep.url );

                }

            }, function ( err ) {
                // Apanhar o erro para correr o prepare
                debug( "step.process resulted into an error...", err && err.stack || err );
                this.processError = err;
            });
        }

    })
    // Calculate progress
    .then(function () { if( this._shouldSkip() ) return;

        debug( "progress calculation stage" );

        this.progress = ( this.steps.indexOf( this.currentStep ) + 1 ) / this.steps.length;

    })
    // Run step.prepare stack
    .then(function () { if( this._shouldSkip() ) return;

        debug( "step.prepare stage" );

        return this.currentStep.prepare.dispatch( req, res );

    })
    .then(function () {
        if( this._shouldSkip && ! res.finished ) {
            res.finished;
        }
    })
    .then(function () {

        debug( "saving current step on store: %s", this.currentStep && this.currentStep.id || 'none' );

        // save step on store
        this.store.current = this.currentStep && this.currentStep.id || undefined;

        return new Promise(function ( fulfill, reject ) {
            req.session.save(function ( err ) {
                if( err ) {
                    reject( err );
                    return;
                }
                fulfill();
            })
        });

    });
};

WizardRoute.prototype._shouldSkip = function() {
    debug( "should skip is %s", ( !! this.res._header ) + '' );
    return this.res._header;
};

WizardRoute.prototype._currentStepIndex = function() {
    if( ! this.currentStep ) {
        return false;
    }

    var i = this.steps.indexOf( this.currentStep );

    if( i === -1 ) {
        throw new Error( "It seems that you shouldn't be on this step" );
    }

    return i;
};

WizardRoute.prototype.prevStep = function() {
    var i = this._currentStepIndex() - 1;
    return this.steps[ i ];
};

WizardRoute.prototype.nextStep = function() {
    var i = this._currentStepIndex() + 1;
    return this.steps[ i ];
};

WizardRoute.prototype.complete = function() {
    var options = this.router.options;

    debug( 'completing wizard' );

    var completedUrl = options.completedUrl ||
        '/';


    return Promise.cast().bind( this )
    .then(function () {
        return this.constructor.completed.dispatch( this.req, this.res );
    })
    .then(function () {
        this.store.destroy();
    })
    .then(function () {
        debug( 'complete redirecting' );
        this.res.redirect( completedUrl );
    });
};

WizardRoute.prototype.reset = function() {
    var options = this.router.options;

    debug( 'resetting wizard' );

    var resetedUrl = options.resetedUrl ||
        this.steps[0].url;

    return Promise.cast().bind( this )
    .then(function () {
        return this.constructor.reseted.dispatch( this.req, this.res );
    })
    .then(function () {
        this.store.destroy();
    })
    .then(function () {
        debug( 'reset redirecting' );
        this.res.redirect( resetedUrl );
    });
};

WizardRoute.prototype.cancel = function() {
    var options = this.router.options;

    debug( 'canceling wizard' );

    var cancelledUrl = options.cancelledUrl ||
        '/';

    return Promise.cast().bind( this )
    .then(function () {
        return this.constructor.cancelled.dispatch( this.req, this.res );
    })
    .then(function () {
        this.store.destroy();
    })
    .then(function () {
        debug( 'cancel redirecting' );
        this.res.redirect( cancelledUrl );
    });
};

WizardRoute.prototype.generateAvailableSteps = function() {
    this.steps = Util.Array.filter( this.constructor.steps, function ( step ) {
        return step.branch.id === 'root' || this.store.branched( step.branch.name );
    }, this );
};

WizardRoute.prototype.generateAvailableBranches = function() {
    this.branches = Util.Array.filter( this.constructor.branches, function ( branch ) {
        return this.store.branched( branch.name );
    }, this );
};

WizardRoute.prototype.branched = function ( branch ) {
    return this.store.branched( branch );
};

WizardRoute.prototype.branch = function ( branch ) {
    var wasSuccessful = this.store.branch( branch );

    if( wasSuccessful ) {
        this.generateAvailableSteps();
        this.generateAvailableBranches();
    }

    return wasSuccessful;
};

WizardRoute.prototype.unbranch = function ( branch ) {
    var wasSuccessful = this.store.unbranch( branch );

    if( wasSuccessful ) {
        this.generateAvailableSteps();
        this.generateAvailableBranches();
    }

    return wasSuccessful;
};

WizardRoute.prototype.processed = function ( step ) {
    return this.store.processed( step );
};

WizardRoute.prototype.process = function ( step ) {
    var wasSuccessful = this.store.process( step );

    if( wasSuccessful ) {
        this.generateAvailableSteps();
        this.generateAvailableBranches();
    }

    return wasSuccessful;
};

WizardRoute.prototype.unprocess = function ( step ) {
    var wasSuccessful = this.store.unprocess( step );

    if( wasSuccessful ) {
        this.generateAvailableSteps();
        this.generateAvailableBranches();
    }

    return wasSuccessful;
};

var validateStep = function( step ){
    if( !Util.is.String(step) || Util.is.String(step) && step.length < 3 )
        throw new TypeError( 'you have to supply a valid step name' );
    return true;
};

WizardRoute.prototype.updateStepData = function ( step, data ) {

    validateStep( step );

    var stepData = this.store.get( step ) || {};
    for( var d in data ){
        stepData[d] = data[d];
    }

    this.store.set( step, stepData );
    debug( 'saved data on store with key %s', step );

    return stepData;

};

WizardRoute.prototype.clearStepData = function ( step ) {

    validateStep( step );

    debug( 'removed data from store with key %s', step );
    this.store.clear( step );

    return true;

};

WizardRoute.prototype.getStepData = function ( step ) {

    debug( 'get step data', step );

    validateStep( step );

    var stepData = this.store.get( step );

    return stepData;

};
