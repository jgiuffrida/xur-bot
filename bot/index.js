const Xur = require('./xur');
const Advisors = require('./advisors');
(function() {
    'use strict';

    module.exports = {
        init: function (controller, bot) {
            let xur = new Xur(controller, bot);
            let advisors = new Advisors();
            advisors.init(controller, bot);
        }

    };
})();