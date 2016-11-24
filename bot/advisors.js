const request = require('request');
const process = require('process');
const _ = require('lodash');

class Advisors {
    constructor() {
        this.data = null;
        this.lastFetch = null;
    }

    init(controller, bot) {
        this.getData(true);

        controller.hears(['nightfall'], ['direct_mention','direct_message'], (bot, message) => {
            this.nightfall(this.data).then((nf) => {
                bot.reply(message, nf);
            })
        });

         controller.hears(['heroic strike'], ['direct_mention','direct_message'], (bot, message) => {
            this.heroicstrike(this.data).then((heroicstrike) => {
                bot.reply(message, heroicstrike);
            })
        });

        controller.hears(['daily mission'], ['direct_mention','direct_message'], (bot, message) => {
            this.dailymission(this.data).then((daily) => {
                bot.reply(message, daily);
            })
        });

        controller.hears(['daily crucible'], ['direct_mention','direct_message'], (bot, message) => {
            this.dailycrucible(this.data).then((daily) => {
                bot.reply(message, daily);
            })
        });
        controller.hears(['weekly crucible'], ['direct_mention','direct_message'], (bot, message) => {
            this.weeklycrucible(this.data).then((weeklycrucible) => {
                bot.reply(message, weeklycrucible);
            })
        });

        controller.hears(['bust it'], ['direct_mention','direct_message'], (bot, message) => {
            this.getData(true).then( () => {
                bot.reply(message, 'https://halloweenshindig.files.wordpress.com/2015/06/gb_bustin1.gif');
            });
        });
    }

    getData(bustCache) {
        if(bustCache || this.data == null) {
            return this.fetchData().then(
                (data) => {
                    return this.parse(data);
                }
            );
        }else{
            return this.parse(data);
        }
    }

    fetchActivity(id) {
        return new Promise( (resolve, reject) => {
            request.get(
                {
                    url: 'https://www.bungie.net/Platform/Destiny/Manifest/Activity/'+id,
                    headers: {
                        'X-API-key': process.env.DESTINY_API_KEY
                    }
                },
                (error, response, body) => {
                    if(!error && response.statusCode === 200) {
                        resolve(JSON.parse(body));
                    }else{
                        reject(error);
                    }
                }
            )
        });
    }

    fetchData() {
        let promise = new Promise( (resolve, reject) => {
            request.get(
                {
                    url: 'https://www.bungie.net/Platform/Destiny/Advisors/V2/',
                    headers: {
                        'X-API-key': process.env.DESTINY_API_KEY
                    }
                },
                (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        resolve(JSON.parse(body));
                    }else{
                        reject(error);
                    }
                }
            );
        });

        return promise;
    }

    parse(data) {
        let parsed = _.get(data, 'Response.data.activities', {});
        this.data = parsed;
        return parsed;
    }

    skullList(modifiers) {
        return _(_.get(modifiers, '[0].skulls', [])).map((skull) => {
            return '*'+skull.displayName+'*'+'\n'+skull.description+'\n\n';
        }).value().join(' ');
    }

    nightfall(data) {
        let id = _.get(data, 'nightfall.display.activityHash', '');
        let message = 'This weeks nightfall:\n\n';
        return this.fetchActivity(id).then(
            (rawactivity) => {
                let activity = _.get(rawactivity, 'Response.data.activity', {});
                message += '*'+_.get(activity, 'activityName', 'Unknown')+'*'+'\n\n';
                message += '*Modifiers*: \n'+this.skullList(_.get(data, 'nightfall.extended.skullCategories',[]));
                return message;
            }
        );
    }

    trials(data) {

    }

    heroicstrike(data) {
        let id = _.get(data, 'heroicstrike.display.activityHash', '');
        let message = 'This weeks heroic strike playlist:\n\n';
        return this.fetchActivity(id).then(
            (rawactivity) => {
                let activity = _.get(rawactivity, 'Response.data.activity', {});
                message += '*'+_.get(activity, 'activityName', 'Unknown')+'*'+'\n\n';
                message += '*Modifiers*: \n'+this.skullList(_.get(data, 'heroicstrike.extended.skullCategories',[]));
                return message;
            }
        );
    }

    dailymission(data) {
        let id = _.get(data, 'dailychapter.display.activityHash', '');
        let message = 'Today\'s daily mission:\n\n';
        return this.fetchActivity(id).then(
            (rawactivity) => {
                let activity = _.get(rawactivity, 'Response.data.activity', {});
                message += '*'+_.get(activity, 'activityName', 'Unknown')+'*'+'\n\n';
                return message;
            }
        );
    }

    dailycrucible(data) {
        let id = _.get(data, 'dailycrucible.display.activityHash', '');
        let message = 'Daily Crucible is: ';
        return this.fetchActivity(id).then(
            (rawactivity) => {
                let activity = _.get(rawactivity, 'Response.data.activity', {});
                message += '*'+_.get(activity, 'activityName', 'Unknown')+'*'+'\n\n';
                return message;
            }
        );
    }

    weeklycrucible(data) {
        let id = _.get(data, 'weeklycrucible.display.activityHash', '');
        let message = 'Weekly Crucible is: ';
        return this.fetchActivity(id).then(
            (rawactivity) => {
                let activity = _.get(rawactivity, 'Response.data.activity', {});
                message += '*'+_.get(activity, 'activityName', 'Unknown')+'*'+'\n\n';
                return message;
            }
        );
    }

    xur(data) {

    }

    poe(data) {

    }

    coe(data) {

    }
}

module.exports = Advisors;