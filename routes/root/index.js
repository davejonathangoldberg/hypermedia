module.exports = function RootRoutes(app, database, templates, validations) {
  
  // SPECIFY DB COLLECTION
  var rootCollection = database.collection('postput');
  
  // SPECIFY COLLECTION FOR TEMPLATE FORMATTING
  var collection = 'root';
  
  // PRIVATE FUNCTIONS  
  var constructLinkObject = function(linkArray, href, rel, prompt, limit, offset){
    href = href || '';
    rel = rel || '';
    prompt = prompt || rel;
    limit = limit || 'na';
    offset = offset || 'na';
    var linkObject = {};
    
    if (rel == 'next') {
      if (!(limit == 'na' || offset == 'na')){
        var newOffset = (parseInt(limit) + parseInt(offset));
        href = href + '?limit=' + limit + '&offset=' + newOffset;
      }
    }
    if (rel == 'prev') {   
        var oldOffset = parseInt(offset) - parseInt(limit);
        
        if ((offset > 0) && (oldOffset > 0)){
          href = href + '?limit=' + limit + '&offset=' + oldOffset;
        }
        else if ((offset > 0) && (oldOffset <= 0)){
          href = href + "?limit=" + limit + "&offset=0";
        }
        else {
          console.log('no offset');
          return linkArray;
        }
      }

    linkArray.push({"href" : href, "rel" : rel, "prompt": prompt }); 
    return linkArray;
  }
  
  // PUBLIC FUNCTIONS
  this.getCollection = function(req, res, next){
    var limit = req.query.limit || 5;
    var offset = req.query.offset || 0;
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : req.protocol + "://" + req.host + ":" + app.port + app.basepath };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : true, "value" : [] };
    var template = { "include" : true };
    
    rootCollection.find({}, {limit: limit, skip: offset, sort: [['modifiedDate',-1]], }).toArray(function(e, results){
      if (e) return next(e);
      
      
      // FORMAT RESULT ARRAY FOR PRESENTATION
      var formattedRootItems = templates.collectionItemsArrayFromDb(results, collection, app.basepath);
      items.value = formattedRootItems;
      
      // ADD LINKS TO LINKS ARRAY
      links.value = constructLinkObject(links.value, href.value, 'next', 'Next ' + limit + ' Results', limit, offset);
      links.value = constructLinkObject(links.value, href.value, 'prev', 'Previous ' + limit + ' Results', limit, offset);
      links.value = constructLinkObject(links.value, href.value, 'profile', 'Profile');
      
      // INSERT FORMATTED RESULTS INTO FORMATTED WRAPPER FOR PRESENTATION
      var rootCollectionObject = templates.collectionObject(collection, version, href, links, items, queries, template);
      
      if ((req.accepts(['html', 'json', app.mediaType]) == 'html')) {
        res.set('Content-Type', 'text/html');
        res.statusCode = 200;
        res.render('rootCollection', rootCollectionObject);
        return '';
      }
      
      res.set('Content-Type', app.mediaType);  // COMMENT OUT FOR BROWSER TESTING, NEED TO REPLACE WITH LOGIC THAT OUTPUTS BASED ON ACCEPT HEADER
      res.statusCode = 200;
      res.json(rootCollectionObject);
      return '';
    });
  }
  
  this.getRawFieldsFromDb = function(req, res, next){
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : req.protocol + "://" + req.host + ":" + app.port + app.basepath };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : false, "value" : [] };
    var template = { "include" : true };
    rootCollection.find({}, {sort: [['modifiedDate',-1]], }).toArray(function(e, results){
      if (e) return next();
      
      items.value = results;
      var rootCollectionObject = templates.collectionObject(collection, version, href, links, items, queries, template, 'item', 'item');
      res.set('Content-Type', app.mediaType);
      res.statusCode = 200;
      return res.json(rootCollectionObject);
    });
  }
  
  this.getItem = function(req, res, next) {
    var errorTemplate = templates.errorTemplate('', req.protocol, req.host, app.basepath);
    var limit = 'item';
    var offset = 'item';
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : req.protocol + "://" + req.host + ":" + app.port + app.basepath };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : false, "value" : [] };
    var template = { "include" : false };
    
    rootCollection.find({ '_id' : req.params.id }, {limit:10, sort: [['modifiedDate',-1]], }).toArray(function(e, results){
      if (e) return next();
      if(!(results.length > 0)) {
        res.set('Content-Type', app.mediaType);
        res.statusCode = 404;
        errorTemplate.collection.error.message = 'Item Not Found';
        return res.json(errorTemplate);
      }
      // FORMAT RESULT ARRAY FOR PRESENTATION
      var formattedRootItems = templates.collectionItemsArrayFromDb(results, collection, app.basepath);
      items.value = formattedRootItems;
      
      // ADD LINKS TO LINKS ARRAY
      links.value = constructLinkObject(links.value, href.value, 'next', 'Next ' + limit + ' Results', limit, offset);
      links.value = constructLinkObject(links.value, href.value, 'prev', 'Previous ' + limit + ' Results', limit, offset);
      links.value = constructLinkObject(links.value, href.value, 'profile', 'Profile');
      
      // INSERT FORMATTED RESULTS INTO FORMATTED WRAPPER FOR PRESENTATION
      var rootCollectionObject = templates.collectionObject(collection, version, href, links, items, queries, template);
      
      if ((req.accepts(['html', 'json', app.mediaType]) == 'html')) {
        res.set('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.render('rootCollection', rootCollectionObject);
      }
      
      res.set('Content-Type', app.mediaType);
      res.statusCode = 200;
      return res.json(rootCollectionObject)
    });
  }

  this.createNewApiRecord = function(req, res, next) {
    var errorTemplate = templates.errorTemplate('', req.protocol, req.host, app.basepath);
    var operationType = 'POST';
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : req.protocol + "://" + req.host + ":" + app.port + app.basepath };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : false, "value" : [] };
    var template = { "include" : true };
    var rootCollectionNameFields = templates.collectionNameFields(collection);
    var rootApiItemFields = validations.validateRootItem(operationType, rootCollectionNameFields, req.body);
    
    // HANDLE POST ERROR
    if (rootApiItemFields.validationError) {
      res.set('Content-Type', app.mediaType);
      errorTemplate.collection.error.message = rootApiItemFields.message;
      return res.json(400, errorTemplate);
    }
    
    var rawIdUrl = validations.trimUrl(rootApiItemFields.interfaceFields.apiUrl);
    rootApiItemFields._id = rawIdUrl;
    rootApiItemFields.createdDate = new Date();
    
    // FORMAT DATA FOR RETURNING TO CLIENT AFTER SUCCESSFUL POST 
    var rootApiItemArray = []
    rootApiItemArray.push(rootApiItemFields);
    var rootCollectionItem = templates.collectionItemsArrayFromDb(rootApiItemArray, collection, app.basepath); 
      
    // ADD LINKS TO LINKS ARRAY - IF ANY
    
    items.value = rootCollectionItem;
    var rootCollectionItemWrapper = templates.collectionObject(collection, version, href, links, items, queries, template); 
    
    // INSERT VALID POST DATA AND SEND RESPONSE TO CLIENT
    rootCollection.insert(rootApiItemFields, {safe: true}, function(e, results){
      if (e) return next();
      res.set('Content-Type', app.mediaType);
      res.set('Location', rootApiItemFields.interfaceFields.href);
      res.statusCode = 201;
      return res.json(rootCollectionItemWrapper);
    });
    
  }

  this.updateApiRecord = function(req, res, next) {
    var errorTemplate = templates.errorTemplate("", req.protocol, req.host, app.basepath);
    var operationType = 'PUT';
    var version = { "include" : true, "value" : "1.0" };
    var href = { "include" : true, "value" : req.protocol + "://" + req.host + ":" + app.port + app.basepath };
    var links = { "include" : true, "value" : [] };
    var items = { "include" : true, "value" : [] };
    var queries = { "include" : false, "value" : [] };
    var template = { "include" : true };
    var rootCollectionNameFields = templates.collectionNameFields(collection);
    var rootApiItemFields = validations.validateRootItem(operationType, rootCollectionNameFields, req.body);
    var rootApiItemFieldsWithId = {};
    rootApiItemFieldsWithId.interfaceFields = rootApiItemFields.interfaceFields;
    rootApiItemFieldsWithId._id = req.params.id;
    
    // HANDLE POST ERROR
    if (rootApiItemFields.validationError) {
      res.set('Content-Type', app.mediaType);
      errorTemplate.collection.error.message = rootApiItemFields.message;
      return res.json(400, errorTemplate);
    }
    
    // FORMAT DATA FOR RETURNING TO CLIENT AFTER SUCCESSFUL POST 
    var rootApiItemArray = []
    rootApiItemArray.push(rootApiItemFields);
    var rootCollectionItem = templates.collectionItemsArrayFromDb(rootApiItemArray, collection, app.basepath);
      
    // ADD LINKS TO LINKS ARRAY
    
    items.value = rootCollectionItem;
    var rootCollectionItemWrapper = templates.collectionObject(collection, version, href, links, items, queries, template); 
    
    rootCollection.update({_id: req.params.id}, {$set:rootApiItemFields}, {upsert: true, safe:true, multi:false}, function(e, result){
      if (e) return next();
      if (result===1) {
        res.set('Content-Type', app.mediaType);
        res.set('Location', rootApiItemFields.interfaceFields.href);
        res.statusCode = 200;
        res.json(rootCollectionItemWrapper);
      } else next();
    })
  }

  this.deleteApiRecord = function(req, res, next) {
    rootCollection.remove({ '_id' : req.params.id }, function(e, result){
      if (e) return next();
      if (result===1) {
        res.statusCode = 204;
      } else next();
    });
  }

  this.createDuplicateApi = function(req, res){
    var errorMessage = "You tried to POST an API that already exists in the system. Please use PUT or submit a unique apiUrl.";
    var errorTemplate = templates.errorTemplate(errorMessage, req.protocol, req.host, app.basepath);
    res.set('Content-Type', app.mediaType);
    res.statusCode = 400;
    return res.json(400, errorTemplate);
  }
}