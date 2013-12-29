module.exports = function TagsRoutes(app, database, templates, validations) {

  // SPECIFY DB COLLECTION
  var rootCollection = database.collection('postput');
  
  // SPECIFY COLLECTION FOR TEMPLATE FORMATTING
  var collection = 'tags';
  
  this.getCollection = function(req, res, next) {
    var errorTemplate = templates.errorTemplate('', req.protocol, req.host, app.basepath);
    var limit = req.query.limit || 5;
    var offset = req.query.offset || 0;
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : req.protocol + "://" + req.host + ":" + app.port + app.basepath };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : false, "value" : [] };
    var template = { "include" : false };
    
    rootCollection.find({ 'interfaceFields.tags' : req.params.tag }, {limit: limit, skip: offset, sort: [['modifiedDate',-1]], }).toArray(function(e, results){
      if (e) return next(e);
      // SEND 404 IF TAG DOES NOT EXIST
      if(!(results.length > 0)) {
        res.set('Content-Type', app.mediaType);
        res.statusCode = 404;
        errorTemplate.collection.error.message = 'Tag Not Found';
        return res.json(errorTemplate);
      }
      
      // FORMAT RESULT ARRAY FOR PRESENTATION
      var formattedItems = templates.collectionItemsArrayFromDb(results, collection, app.basepath);
      items.value = formattedItems;
      // INSERT FORMATTED RESULTS INTO FORMATTED WRAPPER FOR PRESENTATION
      var collectionObject = templates.collectionObject(collection, version, href, links, items, queries, template, limit, offset);
      
      if ((req.accepts(['html', 'json', app.mediaType]) == 'html')) {
        res.set('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.render('rootCollection', rootCollectionObject);
      }
    
      res.set('Content-Type', app.mediaType);  // COMMENT OUT FOR BROWSER TESTING, NEED TO REPLACE WITH LOGIC THAT OUTPUTS BASED ON ACCEPT HEADER
      res.statusCode = 200;
      return res.json(collectionObject);
    });
  }

  this.getTagsForOneApi = function(req, res, next) {
    var limit = req.query.limit || 5;
    var offset = req.query.offset || 0;
    var itemCollection = "itemTags";
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : req.protocol + "://" + req.host + ":" + app.port + app.basepath + req.params.id + '/tags' };
    var links = { "include" : false, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : false, "value" : [] };
    var template = { "include" : false };
    
    rootCollection.find({ '_id' : req.params.id }, {limit:10, sort: [['modifiedDate',-1]], }).toArray(function(e, results){
      if (e) return next();
      
      // FORMAT RESULT ARRAY FOR PRESENTATION
      var formattedItems = templates.collectionItemsArrayFromDb(results[0].interfaceFields.tags, itemCollection, app.basepath);
      items.value = formattedItems;
      // INSERT FORMATTED RESULTS INTO FORMATTED WRAPPER FOR PRESENTATION
      var collectionObject = templates.collectionObject(itemCollection, version, href, links, items, queries, template, limit, offset);
      
      if ((req.accepts(['html', 'json', app.mediaType]) == 'html')) {
        res.set('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.render('rootCollection', collectionObject);
      }
      
      res.set('Content-Type', app.mediaType);
      res.statusCode = 200;
      return res.json(collectionObject);
    });
  }
}