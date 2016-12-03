'use strict';

const moment = require('moment');
const fetch = require('./fetch');
const _ = require('lodash');

const classTypes = ['Titan', 'Hunter', 'Warlock'];

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
                    if (!_.isEmpty(data.items)) {
                        let itemLookup = _.keyBy(data.items, 'itemHash');
                        let attachments = _.map(
                            _.filter(
                                data.categories, 
                                (cat) => cat.categoryTitle !== 'Curios' && cat.categoryTitle !== 'Material Exchange'
                            ),
                            (category) => {
                                let catAttachment = [{
                                    fallback: category.categoryTitle,
                                    title: category.categoryTitle,
                                    color: 'danger'
                                }];

                                return _.concat(catAttachment, _.map(category.saleItems, (itemObj) => {
                                    let item = itemLookup[itemObj.item.itemHash];
                                    if(item) {
                                        return {
                                            fallback: item.itemName,
                                            title: item.itemName,
                                            text: this.buildItemText(category, item)
                                        };
                                    }else{
                                        return;
                                    }
                                }))
                            }
                        );
                        res({ attachments: _.flatten(attachments)});
                    } else {
                        res('I\'m not currently around, check back friday');
                    }
                });
        });
    }

    buildItemText(category, item) {
        if(category.categoryTitle === 'Weapon Ornaments') {
            return _.first(item.itemDescription.split('\n'));
        } else if(category.categoryTitle === 'Exotic Gear') {
            if(classTypes[item.classType]) {
                return classTypes[item.classType] + ' ' + item.itemTypeName;
            }else{
                return item.itemTypeName;
            }
        } else {
            return '';
        }
    }

    getData() {
        return fetch(null, null, 'https://www.bungie.net/Platform/Destiny/Advisors/Xur');
    }

    parseData(data) {
        return new Promise((resolve, reject) => {
            let parsed = {
                categories: _.get(data, 'Response.data.saleItemCategories', [])
            };

            let items = _.map(parsed.categories, (category) => {
                return _.map(_.get(category, 'saleItems', []), (saleItem) => {
                    return saleItem.item.itemHash;
                });
            });

            this.manifest.queryItem(_.flatten(items)).then((items) => {
                parsed.items = items;
                resolve(parsed);
            });
        });
    }



}

module.exports = Xur;