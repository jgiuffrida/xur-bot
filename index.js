const process = require('process');
const skellington = require('skellington');

if (process.env.SLACK_TOKEN) {
    skellington({
        slackToken: process.env.SLACK_TOKEN,
        plugins: [require('./bot/index'), require('pizza-calculator/bot')],
        debug: false
    });

    require
} else {
    process.exit(1);
}

skellington({
    slackToken: process.env.CCJS_TOKEN,
    plugins: [require('pizza-calculator/bot')],
    debug: false
});
