"use strict";

const fetch = require('./fetch');
const process = require('process');
const _ = require('lodash');

class Advisors {
    constructor() {
        this.data = null;
        this.lastFetch = null;

        this.fetchActivity = fetch.curryType('Activity');
    }

    init(controller, bot) {
        this.getData(true);

        controller.hears(['nightfall'], ['direct_mention','direct_message'], (bot, message) => {
            this.nightfall(this.data).then((nf) => {
                bot.reply(message, nf);
            })
        });

         controller.hears(['heroic strike', 'weekly heroic'], ['direct_mention','direct_message'], (bot, message) => {
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

        controller.hears(['poe', 'prison of elders'], ['direct_mention','direct_message'], (bot, message) => {
            this.poe(this.data).then((poe) => {
                bot.reply(message, poe);
            })
        });

        controller.hears(['coe', 'elder challenge', 'challenge of the elders'], ['direct_mention','direct_message'], (bot, message) => {
            this.coe(this.data).then((coe) => {
                bot.reply(message, coe);
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
            return fetch(null, null, 'https://www.bungie.net/Platform/Destiny/Advisors/V2/').then(
                (data) => {
                    return this.parse(data);
                }
            );
        }else{
            return this.parse(data);
        }
    }

    parse(data) {
        let parsed = _.get(data, 'Response.data.activities', {});
        this.data = parsed;
        return parsed;
    }

    skullList(modifiers) {
        return _.map(_.get(modifiers, '[0].skulls', []), (skull) => {
            return {
                fallback: '*'+skull.displayName+'*'+'\n'+skull.description+'\n\n',
                title: skull.displayName,
                text: skull.description,
                color: 'danger'
                // thumb_url: 'https://www.bungie.net'+skull.icon
            };
        });
    }

    nightfall(data) {
        let id = _.get(data, 'nightfall.display.activityHash', '');
        return this.fetchActivity(id).then(
            (rawactivity) => {
                let activity = _.get(rawactivity, 'Response.data.activity', {});
                let attachments = _.concat(
                    [{
                        'title': 'Strike',
                        'text': _.get(activity, 'activityName', 'Unknown'),
                        'fallback': 'Strike'+_.get(activity, 'activityName', 'Unknown')
                    }],
                    this.skullList(_.get(data, 'nightfall.extended.skullCategories',[]))
                );
                return {
                    'attachments': attachments
                };
            }
        );
    }

    trials(data) {

    }

    heroicstrike(data) {
        let id = _.get(data, 'heroicstrike.display.activityHash', '');
        let message = '';
        return this.fetchActivity(id).then(
            (rawactivity) => {
                let activity = _.get(rawactivity, 'Response.data.activity', {});
                message += 'This week\'s weekly heroic is: *'+_.get(activity, 'activityName', 'Unknown')+'*'+'\n\n';
                return {
                    'text': message,
                    'attachments': this.skullList(_.get(data, 'heroicstrike.extended.skullCategories',[]))
                };
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
      let id = _.get(data, 'prisonofelders.display.activityHash', '');
      let message = 'Prison of Elders is: ';
      return this.fetchActivity(id).then(
          (rawactivity) => {
              let activity = _.get(rawactivity, 'Response.data.activity', {});
              message += '*'+_.get(activity, 'activityName', 'Unknown')+'*'+'\n\n';
              return message;
          }
      );
    }

    coe(data) {
      let id = _.get(data, 'elderchallenge.display.activityHash', '');
      return this.fetchActivity(id).then(
          (rawactivity) => {
              let activity = _.get(rawactivity, 'Response.data.activity', {});
              let attachments = _.concat(
                  [
                    {'title': 'Challenge of the Elders', 'fallback': 'Challenge of the Elders'}
                  ],
                  this.skullList(_.get(data, 'elderchallenge.extended.skullCategories',[]))
              );
              return {
                  'attachments': attachments
              };
          }
      );
    }
}

module.exports = Advisors;
