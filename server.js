var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appSecret: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);

// bot.add('/', function (session) {

    //respond with user's message
//    session.send( 'Hi, my name is BliBlaBlo\n I am here to help you learn french \n Let me know if you need any \n replay, transcription or translation \n Have fun ;-) \n' + session.message.text);
//});

// Make it slightly more intelligent
bot.add('/', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);

    }
]);

bot.add('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi, I am here to help you learn french \n Let me know if you need any \n replay, transcription or translation \n What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.text(session, 'What is your native language?');
    },
        function (session, results) {
        session.userData.nativelanguage = results.response;
        session.endDialog();
    }
]);

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
