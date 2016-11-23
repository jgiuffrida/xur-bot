const Xur = require('./xur');
(function() {
    'use strict';

    module.exports = {
        init: function (controller, bot) {
            let xur = new Xur(controller, bot);
        }

    };
})();