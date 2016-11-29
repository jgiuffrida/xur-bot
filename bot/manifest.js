"use strict";

const sqlite = require('sqlite3');
const process = require('process');
const http = require('http');
const fs = require('fs');
const request = require('request');
const fetch = require('./fetch');
const _ = require('lodash');
const unzip = require('unzip');

class Manifest {
    constructor() {
        this.db = null;
        this.filename = '';
    }

    fetchDbUrl() {
        return fetch(null, null, 'https://www.bungie.net/Platform/Destiny/Manifest')
            .then((res) => {
                let path = _.get(res, 'Response.mobileWorldContentPaths.en', '');
                this.filename = _.last(_.split(path, '/'));
                console.log(this.filename, path);
                return path;
            })
            .catch((err) => {
                console.log('Error fetching manifest', err);
            });
    }

    fetchData() {
        return this.fetchDbUrl().then((dburl) => {
            return new Promise((resolve, reject) => {
                // let file = ;
                console.log('requesting');
                request.get('https://www.bungie.net' + dburl)
                    .on('error', (err) => {
                        console.log('some error', err);
                        reject();
                    })
                    .pipe(fs.createWriteStream('./bot/assets.content'))
                    .on('finish', () => {
                        resolve();
                    });
            });
        });
    }

    unzip() {
        return new Promise((resolve, reject) => {
            console.log('unpacking');
            fs.createReadStream('./bot/assets.content')
                .on('error', (err) => {
                    console.log('error unzipping', err);
                    reject(err);
                })
                .pipe(unzip.Extract({ path: './bot/db' }))
                .on('finish', () => {
                    console.log('finishing');
                    resolve();
                });

        });
    }

    setup() {
        return this.fetchData()
            .then(this.unzip)
            .then(() => {
                return new Promise((resolve, reject) => {
                    console.log('resolved!', './bot/db/' + this.filename);
                    this.db = new sqlite.Database('./bot/db/' + this.filename)
                        .on('open', () => {
                            console.log('db opened');
                            resolve();
                        })
                        .on('error', (err) => {
                            console.log('error!');
                            reject(err);
                        });
                });
            });
    }

    queryItem(itemHashes) {
        itemHashes = _.isArray(itemHashes) ? itemHashes : [itemHashes];
        let convertedHashes = _.map(itemHashes, hash => hash-4294967296);
        itemHashes = _.concat(itemHashes, convertedHashes);

        let whereclause = itemHashes.join(' OR id = ');
        let sql = 'SELECT * from DestinyInventoryItemDefinition WHERE id = '+whereclause;
        return new Promise((resolve, reject) => {

            this.db.all(sql, [], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(_.map(results,(result) => {
                        return JSON.parse(result.json);
                    }));
                }
            });
        });
    }
}

module.exports = Manifest;
