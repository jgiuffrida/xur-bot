const process = require('process');

if (process.env.SLACK_TOKEN) {
    require('skellington')({
        slackToken: process.env.SLACK_TOKEN,
        plugins: [require('./bot/index')]  
    });
} else {
    process.exit(1);
}