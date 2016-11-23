'use strict';

const moment = require('moment');

class Xur {
    constructor(controller, bot) {
        controller.hears(['where are you?'], ['direct_message','direct_mention','mention'], (bot, message) => {
            this.getLocation().then( (txt) => {
                bot.reply(message, txt);
            });
        });
    }

    getLocation() {
        // Calculate when it is right now
        // if it's in the range we care about make a call to destiny to get the vendors
        return new Promise( (res, rej) => {
            let dayOfWeek = moment().day();
            if (dayOfWeek > 5 || dayOfWeek === 0) { // This needs to be more granular, check hours, xur is in the tower fri 9a - sun 9a
                // it's the freakin' weekend baby i'm about to have me some xur
                return res('He\'s probably in the reef?');
            } else {
                return res('He\'s not currently around, check back friday'); 
            }

        });
    }

}

module.exports = Xur;