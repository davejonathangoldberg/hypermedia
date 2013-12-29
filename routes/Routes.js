// /routes/Routes.js
module.exports = function Routes(app, database, templates, validations) {

  // ROUTES INSTANTIATION
  var GlobalRoutes = require('./global');
  var RootRoutes = require('./root');
  var TagsRoutes = require('./tags');

  var globalRoutes = new GlobalRoutes(app, templates, validations);
  var rootRoutes = new RootRoutes(app, database, templates, validations);
  var tagsRoutes = new TagsRoutes(app, database, templates, validations);
  
  // GLOBAL ROUTES
  app.all('*', globalRoutes.logRequests); // LOG EVERY REQUEST HEADER
  app.all('*', globalRoutes.checkAcceptHeader); // CHECK ACCEPT HEADER FOR ACCEPTABLE CONTENT-TYPE, OTHERWISE 406
  app.post('*', globalRoutes.checkContentTypeHeader); // CHECK ACCEPT HEADER FOR ACCEPTABLE CONTENT-TYPE, OTHERWISE 406
  app.put('*', globalRoutes.checkContentTypeHeader); // CHECK ACCEPT HEADER FOR ACCEPTABLE CONTENT-TYPE, OTHERWISE 406
  app.del('*', globalRoutes.checkAuth);
  
  // ROOT COLLECTION ROUTES
  app.get(app.basepath, rootRoutes.getCollection); // RETRIEVE ROOT COLLECTION OF APIS
  app.get('/raw', rootRoutes.getRawFieldsFromDb); // ROUTE FOR TESTING THINGS OUT
  app.get(app.basepath + ':id', rootRoutes.getItem); // RETRIEVE INDIVIDUAL API
  app.post(app.basepath, rootRoutes.createNewApiRecord); // POST A NEW API
  app.put(app.basepath + ':id', rootRoutes.updateApiRecord); // UPDATE AN INDIVIDUAL API
  app.del(app.basepath + ':id', rootRoutes.deleteApiRecord); // DELETE AN API
  
  // TAGS COLLECTION ROUTES
  app.get(app.basepath + 'tags/:tag', tagsRoutes.getCollection); // RETRIEVE APIS FOR A GIVEN TAG
  app.get(app.basepath + ':id/tags', tagsRoutes.getTagsForOneApi); // RETRIEVE TAGS COLLECTION FOR INDIVIDUAL API
  
  // CATCH EVERYTHING ELSE AND RETURN A 400 BAD INPUT
  app.post(app.basepath, rootRoutes.createDuplicateApi); // RETURN ERROR IF CLIENT TRIES TO CREATE A DUPLICATE API
  app.all('*', globalRoutes.catchAll); // RETURN ERROR FOR ANYTHING THAT OTHERWISE HASN'T BEEN CAUGHT
  
}