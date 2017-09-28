"use strict";

const fetch = require('./fetch');
const process = require('process');
const _ = require('lodash');

class Advisors {
    constructor() {
        this.fetchActivity = fetch.curryType('Activity');
        this.fetchItem = fetch.curryType('InventoryItem');
    }
    
    getAndReply(fn) {
        return (bot, message) => {
            return this.getData(true)
                .then((data) => fn(data))
                .then((txt) => {
                    bot.reply(message, txt);
                });
        };
    }

    init(controller, bot) {
        controller.hears(['nightfall'], ['direct_mention','direct_message'], this.getAndReply(this.nightfall.bind(this)));
        controller.hears(['heroic strike', 'weekly heroic'], ['direct_mention','direct_message'], this.getAndReply(this.heroicstrike.bind(this)));
        controller.hears(['daily mission'], ['direct_mention','direct_message'], this.getAndReply(this.dailymission.bind(this)));
        controller.hears(['daily crucible'], ['direct_mention','direct_message'], this.getAndReply(this.dailycrucible.bind(this)));
        controller.hears(['weekly crucible'], ['direct_mention','direct_message'], this.getAndReply(this.weeklycrucible.bind(this)));
        controller.hears(['poe', 'prison of elders'], ['direct_mention','direct_message'], this.getAndReply(this.poe.bind(this)));
        controller.hears(['coe', 'elder challenge', 'challenge of the elders'], ['direct_mention','direct_message'], this.getAndReply(this.coe.bind(this)));
        controller.hears(['trials', 'trails'], ['direct_mention', 'direct_message'], this.getAndReply(this.trials.bind(this)));
    }

    getData(bustCache) {
        if(bustCache || this.data == null) {
            return fetch(null, null, 'https://www.bungie.net/Platform/Destiny2/Advisors/V2/').then(
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
        return new Promise((resolve, reject) => {
            let attachments = [{
                pretext: 'This week\'s trials:',
                title: 'Map',
                text: _.get(data, 'trials.display.flavor', 'Unknown'),
                fallback: 'This week\'s trials map: *'+_.get(data, 'trials.display.flavor', 'Unknown')+'*'
            }];
            let bountyPromises = _.map(_.get(data, 'trials.bountyHashes', []), this.fetchItem.bind(this));

            Promise.all(bountyPromises).then((bounties) => {
               resolve({
                    attachments: _.concat(attachments, [{
                        title: 'Bounties',
                        text: _.map(bounties, (bounty) => {
                            let b = _.get(bounty, 'Response.data.inventoryItem');
                            return b.itemName+'\n'+b.itemDescription;
                        }).join('\n\n'),
                        fallback: 'There are some bounties'
                    }])
               });
            });
        });
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
