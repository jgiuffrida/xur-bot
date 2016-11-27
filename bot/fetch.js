const _ = require('lodash');
const request = require('request');

const fetch = function(id, type, url) {
    let promise = new Promise( (resolve, reject) => {
            url = url || 'https://www.bungie.net/Platform/Destiny/Manifest/'+_.capitalize(type)+'/'+id;
            request.get(
                {
                    url: url,
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
};

fetch.curryType = function(type) {
    return (id) => {
        return fetch(id, type);
    };
};

module.exports = fetch;