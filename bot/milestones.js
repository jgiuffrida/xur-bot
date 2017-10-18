'use strict';

const fetch = require('./fetch');
const process = require('process');
const _ = require('lodash');

class Milestones {
    constructor() {
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

    init(controller, bot, manifest) {
        this.manifest = manifest;
        controller.hears(['milestones'], ['direct_mention', 'direct_message'], this.getAndReply(this.milestones.bind(this)));
    }

    getData(bustCache) {
        if(bustCache || this.data == null) {
            return fetch(null, null, 'https://www.bungie.net/Platform/Destiny2/Milestones').then(
                (data) => {
                    return this.parse(data);
                }
            );
        }else{
            return this.parse(data);
        }
    }

    parse(data) {
        let parsed = _.get(data, 'Response', {});
        this.data = _.keys(parsed);
        return this.data;
    }

    parseMilestones(milestones) {
        return _.map(milestones, (ms) => {
            return {
                name: _.get(ms, 'displayProperties.name', ''),
                description: _.get(ms, 'displayProperties.description', '')
            };
        });
    }

    milestones(data) {
        return this.manifest.queryMilestone(data)
            .then((milestones) => {
                return this.buildMsg(this.parseMilestones(milestones));
            })
            .catch((err) => {
                console.log('error errror', err);
            });
    }

    buildMsg(parsed) {
        let attachments = _.map(
                _.filter(parsed, 'name'),
                (ms) => {
                    return {
                        'title': ms.name,
                        'text': _.get(ms, 'description', ''),
                        'fallback': ms.name+' '+_.get(ms, 'description', '')
                    };
                }
        );

        return {
            'attachments': attachments 
        };
    }
}

module.exports = Milestones;
