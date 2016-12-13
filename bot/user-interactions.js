'use strict';

class UserInteractions {
    constructor(manifest, store) {
        this.manifest = manifest;
        this.store = store;
    }

    init(controller, bot) {
        controller.hears(['set gamertag'], ['direct_message'], (bot, message) => {
            
        });

    }
}

module.exports = UserInteractions;
