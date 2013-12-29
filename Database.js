// Database.js
module.exports = function Database(configuration) {
  var mongoskin = require('mongoskin');
  var db = mongoskin.db(configuration.host, {database:configuration.database,safe:configuration.safe});
  return db;
};