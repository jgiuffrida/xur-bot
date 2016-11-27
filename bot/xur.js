'use strict';

const moment = require('moment');
const fetch = require('./fetch');
const _ = require('lodash');

class Xur {
    constructor(controller, bot, manifest) {
        controller.hears([/where are you\??/, /what you selling?\??/], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
            this.info().then((txt) => {
                bot.reply(message, txt);
            });
        });

        controller.hears([/is that all\??/], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
            bot.reply(message, '*YES*');
        });
        this.manifest = manifest;
    }

    info() {
        // Calculate when it is right now
        // if it's in the range we care about make a call to destiny to get the vendors
        return new Promise((res, rej) => {
            return this.getData()
                .then(this.parseData.bind(this))
                .then((data) => {
                    console.log('data',data);
                    if (!_.isEmpty(data.items)) {
                        let message = 'I\'ve got:\n\n';
                        message += data.items.join(', ');
                        console.log('message', message);
                        res(message);
                    } else {
                        res('I\'m not currently around, check back friday');
                    }
                });
        });
    }

    getData() {
        return fetch(null, null, 'https://www.bungie.net/Platform/Destiny/Advisors/Xur');
    }

    parseData(data) {
        return new Promise((resolve, reject) => {
            let parsed = {};

            let items = _.map(_.get(data, 'Response.data.saleItemCategories',[]), (category) => {
                return _.map(_.get(category, 'saleItems', []), (saleItem) => {
                    return saleItem.item.itemHash;
                });
            });

            this.manifest.queryItem(_.flatten(items)).then((items) => {
                parsed.items = _.map(items, 'itemName');
                console.log(parsed);
                resolve(parsed);
            });
        });
    }



}

module.exports = Xur;