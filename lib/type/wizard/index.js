var Route = require( '../../route' ),
    Path = require( '../../path' ),
    Branch = require( './branch' ),
    Control = require( './control' ),
    Util = require( 'findhit-util' ),

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

    ConstructedRoute.branches = [];
    ConstructedRoute.steps = [];

    ConstructedRoute.root = new Branch( ConstructedRoute, null, 'root', options.steps );

    Util.Array.each( options.url, function ( url ) {
        // TODO: we might need to strip last slash

        ConstructedRoute.paths.push(
            new Path( url + '/:step(' + ConstructedRoute.steps.map(function ( step ) { return step.id }).join('|') + ')?' )
        );
    });

    return ConstructedRoute;
};

WizardRoute.construct.defaultOptions = {

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
    autoReset: false,

    /**
     * If no process stack exists for the current step, the WizardRoute will automatically
     * validate the model data against the models included in the controller's uses array.
     *
     * @var boolean
     */
    autoValidate: false,

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
     * `onComplete` stack is called directly before redirection.
     *
     * @var mixed
     */
    completeUrl: '/',

    /**
     * Stack of functions to be run once a wizard is completed
     *
     * @var mixed
     */
    onComplete: undefined,

    /**
     * Url to be redirected to after 'Cancel' submit button has been pressed by user.
     *
     * @var mixed
     */
    cancelUrl: '/',

    /**
     * Stack of functions to be run once a wizard is canceled
     *
     * @var mixed
     */
    onCancel: undefined,

    /**
     * Url to be redirected to after 'Draft' submit button has been pressed by user.
     *
     * @var mixed
     */
    draftUrl: '/',

    /**
     * Stack of functions to be run once a wizard is drafted
     *
     * @var mixed
     */
    onDraft: undefined,

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

    // If req doesn't have a session, this route type should NOT work, throw Error!
    if( ! req[ this.options.reqSessionKey ] ) {
        throw new TypeError([
            "emvici-router/lib/type/wizard needs some kind of session.",
            "You should use some session middleware before `.use` emvici-router.",
            "In case you have one and it doesn't place it at `req.session`, please",
            "specify in which key it sits by giving `reqSessionKey` option to",
            "emvici-router constructor options.",

            "Example: `var router = require( 'emvici-router' )({ reqSessionKey: 'YOLO' })`"
        ].join( " " ));
    }

    // Load control into this route
    this.control = new Control( this );

    // Guess which step we are
    // Run step stack

};

WizardRoute.prototype.branch = function ( branch ) {

};

WizardRoute.prototype.unbranch = function ( branch ) {

};

WizardRoute.prototype.createSession = function () {

};
