module.exports = function GlobalRoutes(app, templates, validations) {

  this.logRequests = function(req, res, next){
    var fs = require('fs');
    var logFile = fs.createWriteStream('log.txt', {
      flags: "a"
    });
    logFile.write('\nRequest Headers: ' + JSON.stringify(req.headers));
    next();
  }
  
  this.checkAcceptHeader = function(req, res, next){
    var errorTemplate = templates.errorTemplate('', req.protocol, req.host, app.basepath);
    if (!req.accepts(['application/vnd.collection+json', 'json', 'html'])) {
      res.set('Content-Type', app.mediaType);
      res.statusCode = 406;
      errorTemplate.collection.error.message = 'Please re-submit request with an Accept header value of application/vnd.collection+json or application/json';
      return res.json(errorTemplate);
    }
    next();
  }
  
  this.checkContentTypeHeader = function(req, res, next){
    var errorTemplate = templates.errorTemplate('', req.protocol, req.host, app.basepath);
    if (!(req.is('application/vnd.collection+json') || req.is('json'))) {
      res.set('Content-Type', app.mediaType);
      res.statusCode = 406;
      errorTemplate.collection.error.message = 'Please re-submit request with a Content-Type header value of application/vnd.collection+json or application/json';
      return res.json(errorTemplate);
    }
    next();
  }
  
  this.checkAuth = function(req, res, next){
    var errorTemplate = templates.errorTemplate('', req.protocol, req.host, app.basepath);
    if (!(req.get('x-my-auth') == "drdn" )) {
      res.set('Content-Type', app.mediaType);
      res.statusCode = 403;
      errorTemplate.collection.error.message = 'You are not authorized to perform that action.';
      return res.json(errorTemplate);
    }
    next();
  }
  
  this.catchAll = function(req, res){
    var errorMessage = "Invalid or Unsupported Request. Please check your input and try again.";
    var errorTemplate = templates.errorTemplate(errorMessage, req.protocol, req.host, app.basepath);
    res.set('Content-Type', app.mediaType);
    res.statusCode = 400;
    res.json(400, errorTemplate);
  }
  
}