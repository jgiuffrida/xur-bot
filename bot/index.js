(function() {
    'use strict';

    module.exports = {
        init: function (controller, bot) {
            controller.hears(/where('s|s)? (is )?xur\??/, ['direct_message','direct_mention','mention'], () => {
                bot.reply('I don\'t know, probably in the reef? Yes, try there.');
            });
        }

    };
})();