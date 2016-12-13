'use strict';
const Xur = require('./xur');
const Advisors = require('./advisors');
const Manifest = require('./manifest');
const UserInteractions = require('./user-interactions');
const process = require('process');

module.exports = {
    init: function (controller, bot) {
        let redis;
        // setup redis connection
        if(process.env.REDISTOGO_URL) {
            let rtg   = require('url').parse(process.env.REDISTOGO_URL);

            redis = require('redis').createClient(rtg.port, rtg.hostname);
            redis.auth(rtg.auth.split(':')[1]);
        }else{
            redis = require('redis').createClient();
        }
        // create a new manifest and get a reference to the sqlite db
        let manifest = new Manifest();
        manifest.setup().then( () => {
            console.log('manifest setup');
            let xur = new Xur(controller, bot, manifest);
            let advisors = new Advisors(manifest);
            advisors.init(controller, bot);
            let user = new UserInteractions(manifest, redis);
            user.init(controller, bot);

            controller.hears(['refresh manifest'], ['direct_message'], (bot, message) => {
                bot.reply('Refreshing destiny item db');
                manifest.setup().then( () => {
                    bot.reply(message, 'db refreshed');
                }).catch((err) => {
                    bot.reply(message, 'Something bad happened');
                });
            });
        });
    }
};
