// Database.js
module.exports = function Database(configuration) {
  var mongoskin = require('mongoskin');
  var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  configuration.host;
  
  var db = mongoskin.db(mongoUri, {database:configuration.database,safe:configuration.safe});
  return db;
};