// server.js: composition root
var App = require("./App.js");
var Database = require("./Database.js");
var Routes = require("./routes/Routes.js");
var dbConfig = require("./dbconfig.json");

// TEMPLATES AND VALIDATIONS
var Templates = require('./templates/templates.js'); // TEMPLATES FOR DATA OUTPUT
var Validations = require ('./validations/validations.js'); // VALIDATION MODULE FOR INPUT DATA

var validations = new Validations();
var templates = new Templates();

var app = new App();
var database = new Database(dbConfig);
var routes = new Routes(app, database, templates, validations);
