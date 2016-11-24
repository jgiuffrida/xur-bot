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

    }

    dailymission(data) {

    }

    dailycrucible(data) {

    }

    weeklycrucible(data) {

    }

    xur(data) {

    }

    poe(data) {

    }

    coe(data) {

    }
}

module.exports = Advisors;