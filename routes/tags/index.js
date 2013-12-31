module.exports = function TagsRoutes(app, database, templates, validations) {

  // SPECIFY DB COLLECTION
  var rootCollection = database.collection('postput');
  
  // SPECIFY COLLECTION FOR TEMPLATE FORMATTING
  var collection = 'tags';
  
  this.getCollection = function(req, res, next) {
    
    var baseHref = req.protocol + "://" + req.host + app.port + app.basepath;
    var errorTemplate = templates.errorTemplate('', req.protocol, req.host, app.basepath);
    var limit = req.query.limit || 5;
    var offset = req.query.offset || 0;
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : baseHref + 'tags' };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : true, "value" : [] };
    var template = { "include" : false };
    if (req.params.hasOwnProperty('tag')) {
      var tag = req.params.tag;
    }
    else if (req.query.hasOwnProperty('tag')){
      var tag = req.query.tag;
    } else {
      var tag = "";
    }
    
    
    rootCollection.find({ 'interfaceFields.tags' : tag }, {limit: limit, skip: offset, sort: [['modifiedDate',-1]], }).toArray(function(e, results){
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
      
      // ADD LINKS TO LINKS ARRAY
      links.value = templates.constructLinkObject(links.value, baseHref, 'api_list', 'All APIs');
      
      // ADD QUERIES TO QUERIES ARRAY
      queries.value = templates.constructQueryObject(queries.value, 'query_tags', baseHref, 'Search By Tag', [{"name" : "tag", "value" : ""}]);
      
      // INSERT FORMATTED RESULTS INTO FORMATTED WRAPPER FOR PRESENTATION
      var collectionObject = templates.collectionObject(collection, version, href, links, items, queries, template);
      
      if ((req.accepts(['html', 'json', app.mediaType]) == 'html')) {
        res.set('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.render('rootCollection', collectionObject);
      }
    
      res.set('Content-Type', app.mediaType);  // COMMENT OUT FOR BROWSER TESTING, NEED TO REPLACE WITH LOGIC THAT OUTPUTS BASED ON ACCEPT HEADER
      res.statusCode = 200;
      return res.json(collectionObject);
    });
  }

  this.getTagsForOneApi = function(req, res, next) {
    var encodedId = encodeURIComponent(req.params.id);
    var baseHref = req.protocol + "://" + req.host + app.port + app.basepath;
    var itemCollection = "itemTags";
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : baseHref + encodedId + '/tags' };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : true, "value" : [] };
    var template = { "include" : false };
    
    rootCollection.find({ '_id' : req.params.id }, {limit:10, sort: [['modifiedDate',-1]], }).toArray(function(e, results){
      if (e) return next();
      
      // FORMAT RESULT ARRAY FOR PRESENTATION
      var formattedItems = templates.collectionItemsArrayFromDb(results[0].interfaceFields.tags, itemCollection, app.basepath);
      items.value = formattedItems;
      // ADD LINKS TO LINKS ARRAY
      links.value = templates.constructLinkObject(links.value, baseHref, 'api_list', 'All APIs');
      links.value = templates.constructLinkObject(links.value, app.basepath + encodedId, 'item_view', 'View API');
      console.log('links.value: ' + JSON.stringify(links.value));
      // ADD QUERIES TO QUERIES ARRAY
      queries.value = templates.constructQueryObject(queries.value, 'query_tags', href.value, 'Search By Tag', [{"name" : "tag", "value" : ""}]);
      
      // INSERT FORMATTED RESULTS INTO FORMATTED WRAPPER FOR PRESENTATION
      var collectionObject = templates.collectionObject(itemCollection, version, href, links, items, queries, template);
      
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