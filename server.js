var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appSecret: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);


// Install First Run middleware and dialog
bot.use(function (session, next) {
    if (!session.userData.firstRun) {
        session.userData.firstRun = true;
        session.beginDialog('/firstRun');
    } else {
        next();
    }
});

bot.add('/firstRun', [
    function (session) {
        session.send( 'Hi, my name is BliBlaBlo\n I am here to help you learn french \n Let me know if you need any \n replay, transcription or translation \n Have fun ;-) \n');
        builder.Prompts.text(session, "Hello... What's your mother tong?");
    },
    function (session, results) {
        // We'll save the prompts result and return control to main through
        // a call to replaceDialog(). We need to use replaceDialog() because
        // we intercepted the original call to main and we want to remove the
        // /firstRun dialog from the callstack. If we called endDialog() here
        // the conversation would end since the /firstRun dialog is the only
        // dialog on the stack.
        session.userData.mothertong = results.response;
        session.replaceDialog('/');
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
