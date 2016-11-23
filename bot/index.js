(function() {
    'use strict';

    module.exports = {
        init: function (controller, bot) {
            controller.hears(/where('s|s)? (is )?xur\??/, () => {
                bot.reply('I don\'t know, probably in the reef? Yes, try there.');
            });
        }

    };
})();