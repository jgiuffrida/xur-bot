const Xur = require('./xur');
const Advisors = require('./advisors');
const Manifest = require('./manifest');

(function() {
    'use strict';

    module.exports = {
        init: function (controller, bot) {
            // create a new manifest and get a reference to the sqlite db
            let manifest = new Manifest();
            manifest.setup().then( () => {
                console.log('manifest setup');
                let xur = new Xur(controller, bot, manifest);
                let advisors = new Advisors(manifest);
                advisors.init(controller, bot);
            });
        }
    };
})();