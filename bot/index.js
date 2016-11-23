const Xur = require('./xur');
(function() {
    'use strict';

    module.exports = {
        init: function (controller, bot) {
            new Xur(controller, bot);
        }

    };
})();