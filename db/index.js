var pg = require('pg');
var postgresUrl = 'postgres://yichao@localhost:5432/twitter';
var client = new pg.Client(postgresUrl);

client.connect();

module.exports = client;
