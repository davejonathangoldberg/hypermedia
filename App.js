// App.js
module.exports = function App() {
  var express = require('express');
  var fs = require('fs');
  var app = express();
  var port = process.env.PORT || 2199;
  
  app.version = "1.0";
  app.port = port;
  app.host = "api.ritc.io";
  app.basepath = '/';
  app.mediaType = 'application/vnd.collection+json';
  
  var Templates = require('./templates/templates.js');
  var templates = new Templates(app.basepath);
  var errorTemplate = templates.errorTemplate("Bad Input. Please check your syntax and try again.", "http", app.host);
  var logfile = fs.createWriteStream('./logfile.log', {flags: 'a'});
  
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  
  app.use(express.static(__dirname + '/public/'));
  app.use(express.logger({stream: logfile}));
  app.use(express.bodyParser());
  app.use(function(err, req, res, next){
    fs.writeFile('./requestlog.txt', req.get('Accept'));
    console.error(err.stack);
    res.set('Content-Type', app.mediaType);
    res.json(400, errorTemplate );
  });
  app.listen(port);
  console.log('Listening on port ' + port);
  return app;
};