// Database.js
module.exports = function Database(configuration) {
  var mongoskin = require('mongoskin');
  var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  configuration.host + configuration.database;
  
  
  var db = mongoskin.db(mongoUri, {safe:configuration.safe});
  return db;
};