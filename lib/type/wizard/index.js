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
     * If true, the user will not be allowed to edit previously completed steps. They will be
     * "locked down" to the current step.
     *
     * @var boolean
     */
    lockdown: false,

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

    // Guess which step we are
    this.currentStep =
        this.store.current && this.constructor.steps[ this.store.current ] ||
        null;

    // Run stages
    return Promise.cast().bind( this )
    .then(function () {

        debug( "validation stage" );

        // Add validation for autoReset option
        if(
            // If we couldn't do auto reset
            ! this.constructor.options.autoReset &&
            // And
            (
                // WE cant get step
                ! this.params.step ||
                // Or current step or first step's name isnt equal to step requested
                ( this.currentStep || this.steps[0] ).name != this.params.step
            )
        ) {
            throw new RouteError.BadRequest([
                "Steps should match when not in strict mode.",
                "To disable this error, please enable autoReset option."
            ].join( " " ));
        } else {

            if( this.currentStep && this.steps.indexOf( this.currentStep ) !== -1 ) {
                return;
            }

            if( ! this.currentStep && this.steps[0].name == this.params.step ) {
                this.currentStep = this.steps[0];
                return;
            }

            return this.reset();
        }

    })
    // Detect if it is Canceled
    .then(function () { if( this._shouldSkip() ) return;

        debug( "canceled detection stage" );

        if(
            this.req.param &&
            (
                typeof this.req.param( 'Cancel' ) != 'undefined' ||
                typeof this.req.param( 'cancel' ) != 'undefined'
            )
        ) {
            return this.cancel();
        }

    })
    // Detect if it is Reseted
    .then(function () { if( this._shouldSkip() ) return;

        debug( "reseted detection stage" );

        if(
            this.req.param &&
            (
                typeof this.req.param( 'Reset' ) != 'undefined' ||
                typeof this.req.param( 'reset' ) != 'undefined'
            )
        ) {
            return this.reset();
        }

    })
    // Check if it should run Initialize stack
    .then(function () { if( this._shouldSkip() ) return;

        debug( "initialize detection stage" );

        if( ! this.store.initialized ) {
            this.store.initialized = true;

            if ( this.router.initialized ) {
                return this.router.initialized.dispatch( this.req, this.res );
            }
        }

    })
    // Check if it should run step.process stack
    .then(function () { if( this._shouldSkip() ) return;

        debug( "step.process detection stage" );

        if( this.req.method === 'POST' ) {
            return this.currentStep.process
            .dispatch( this.req, this.res )
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

                if( Util.is.Error( err ) ) {
                    debug( "step.process resulted into an error...", err.stack );
                }

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

        return this.currentStep.prepare.dispatch( this.req, this.res );

    })
    .then(function () {

        // save step on store
        // if it exists
        if( this.currentStep ) {
            this.store.current = this.currentStep.id;

            return new Promise(function ( fulfill, reject ) {
                req.session.save(function ( err ) {
                    if( err ) {
                        reject( err );
                        return;
                    }
                    fulfill();
                })
            });
        }

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
