module.exports = {
    url: '/auth/register',
    type: 'wizard',
    autoReset: true,
    steps: [
        {
            type: 'step',
            title: 'Terms and Conditions',
            name: 'tos',

            prepare: function ( req, res, next ) {
                res.response += 'tos';

                next();
            },

            process: function ( req, res, next ) {
                next();
            }
        },
        {
            type: 'step',
            title: "Who are you?",
            name : "who-are-you",

            prepare: function ( req, res, next ) {
                res.response += 'who-are-you';

                next();
            },

            process: function ( req, res, next ) {
                next();
            }
        },
        {
            type: 'step',
            title: "Internationalization",
            name : "i18n",

            prepare: function ( req, res, next ) {
                res.response += 'i18n';

                next();
            },

            process: function ( req, res, next ) {
                next();
            }
        },
        {
            type: 'step',
            title: "Credentials",
            name : "credentials",

            prepare: function ( req, res, next ) {
                res.response += 'credentials';

                next();
            },

            process: function ( req, res, next ) {
                next();
            }
        },
        {
            type: 'step',
            title: "Congrats!!!",
            name : "congrats",

            prepare: function ( req, res, next ) {
                res.response += 'congrats';

                next();
            },

            process: function ( req, res, next ) {
                next();
            }
        }

    ]
};
