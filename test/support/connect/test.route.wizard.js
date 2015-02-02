module.exports = {
    url: '/register',
    type: 'wizard',
    steps: [
{
    title   : 'Terms and Conditions',
    name    : 'terms-and-conditions',

    prepare: function ( req, res, next ) {
        console.log('here i am');
        return true;
    },

    process: function ( req, res, next ) {
        req.body.tos = { accept: 1 };

        return !! req.body.tos.accept;
    }
}, {
    title: "Who are you?",
    name : "who-are-you",

    prepare: function ( req, res, next ) {
        return true;
    },

    process: function ( req, res, next ) {
        var p = req.body.process = {
            first_name: 'Casa',
            last_name: 'Nova',
            gender: 'F',
            birthday: '27/05/1986',
        };

        return !! ( r.first_name && r.last_name && r.gender && r.birthday );
    }
}, {
    title: "Internationalization",
    name : "internationalization",

    prepare: function ( req, res, next ) {
        var i = req.body.internationalization = {
            language_id: {
                43: 'Portuguese',
                8: 'English',
                12: 'Russian',
            }
        };

        req.data.language_id = i.language_id;
        return true;
    },

    process: function ( req, res, next ) {
        var i = req.body.internationalization = { language_id: 8 };

        return !! parseInt( i.language_id );
    }
}, {
    title: "Credentials",
    name : "credentials",

    prepare: function () {
        return true;
    },

    process: function ( req, res, next ) {
        var c = req.body.credentials = {
            password: 'youshallnotpass',
            security_answer: 'what is your pet name?',
            security_question: 'i like bacon!',
        };

        return !! ( c.password && c.security_answer && c.security_question );
    }
}, {
    title: "Congrats!!!",
    name : "congrats",

    prepare: function () {
        req.data.identity = req.body.identity;
        req.data.cred = req.body.cred;

        return true;
    },

    process: function ( req, res, next ) {
        var c = req.body.congratulations = { finish: 1 };

        return !! c.finish;
    }
}

    ]
};
