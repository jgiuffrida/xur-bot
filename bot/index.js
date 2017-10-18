const Xur = require('./xur');
const Manifest = require('./manifest');
const Milestones = require('./milestones');

(function() {
    'use strict';

    module.exports = {
        init: function (controller, bot) {
            // create a new manifest and get a reference to the sqlite db
            let manifest = new Manifest();
            manifest.setup().then( () => {
                console.log('manifest setup');
                //let xur = new Xur(controller, bot, manifest);
                let milestones = new Milestones(manifest);
                milestones.init(controller, bot, manifest);

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
})();
