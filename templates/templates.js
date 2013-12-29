module.exports = function Templates() {
  
  this.collectionDataFields = function(collection) {
    switch(collection){
    case "root":
      var collectionDataFields = require('./rootCollectionDataFields.json');
      return collectionDataFields;
    case "itemTags":
      var collectionDataFields = require('./tagsCollectionDataFields.json');
      return collectionDataFields;
    case "tags":
      var collectionDataFields = require('./rootCollectionDataFields.json');
      return collectionDataFields;
    default:
      var collectionDataFields = require('./rootCollectionDataFields.json');
      return collectionDataFields;
    }
  };
  
  this.collectionObject = function (collection, version, href, links, items, queries, template) {
    var collectionTemplate = {};
    collectionTemplate.collection = {};
    
    if (version.include) collectionTemplate.collection.version = version.value;
    if (href.include) collectionTemplate.collection.href = href.value;
    if (items.include) collectionTemplate.collection.items = items.value;
    if (links.include) collectionTemplate.collection.links = links.value; 
    if (queries.include) collectionTemplate.collection.queries = require('./rootCollectionQueriesArray.json'); // NEEDS TO CHANGE TO DYNAMICALLY ASSEMBLE QUERIES
    if (template.include) {
      collectionTemplate.collection.template = {};
      collectionTemplate.collection.template.data = this.collectionDataFields(collection);
    }

    return collectionTemplate; 
  };
  
  this.collectionNameFields = function(collection) {
    var collectionDataFields = this.collectionDataFields(collection);
    var collectionNameFields = new Array();
    for ( var arrayItem=0; arrayItem < collectionDataFields.length; arrayItem++ ) {
      collectionNameFields.push(collectionDataFields[arrayItem].name);
    }
    return collectionNameFields;
  };
  
  this.collectionItemsArrayFromDb = function(collectionItemsArray, collection, baseurl){
    collection = collection || "root";
    var formattedItems = [];
    for ( var i=0; i<collectionItemsArray.length; i++ ) {
      var item = collectionItemsArray[i];
      switch(collection){
        case "root":
          var formattedItem = this.rootCollectionItem(item, baseurl);
          formattedItems.push(formattedItem);
          break;
        case "itemTags":
          var formattedItem = this.tagsCollectionItem(item, baseurl);
          formattedItems.push(formattedItem);
          break;
        case "tags":
          var formattedItem = this.rootCollectionItem(item, baseurl);
          formattedItems.push(formattedItem);
          break;
        default:
          var formattedItem = this.rootCollectionItem(item, baseurl);
          formattedItems.push(formattedItem);
          break;
      }
      
    }
    return formattedItems;
  };
  
  this.rootCollectionItem = function (itemFields, baseurl) {
    var itemUrl = itemFields._id;
    var itemResourceUrl = baseurl + encodeURIComponent(itemUrl);
    
    return {
      "href" : itemResourceUrl,
      "data" : [
        {"name" : "apiName", "value" : itemFields.interfaceFields.apiName, "prompt" : "API Name" },
        {"name" : "mediaType", "value" : itemFields.interfaceFields.mediaType, "prompt" : "Media Type" },
        {"name" : "description", "value" : itemFields.interfaceFields.description, "prompt" : "Description" },
        {"name" : "tags", "value" : itemFields.interfaceFields.tags.toString(), "prompt" : "Tags, comma separated" },
        {"name" : "profiles", "value" : itemFields.interfaceFields.profiles, "prompt" : "Profiles for Applicaton Semantics" },
        {"name" : "contact", "value" : itemFields.interfaceFields.contact, "prompt": "Contact email address" }
      ],
      "links" : [
        {"rel" : "apiUrl", "href" : itemFields.interfaceFields.apiUrl}
      ]
    }
  }
  
  this.tagsCollectionItem = function (item, baseurl) {
    var itemResourceUrl = baseurl + 'tags/' + item;
    
    return {
      "href" : itemResourceUrl,
      "data" : [
        {"name" : "tag", "value" : item, "prompt" : "Tag" }
      ]
    };
  }
  
  this.errorTemplate = function(errorMessage, protocol, host, baseurl){
    return { "collection" :
      {
        "version" : "1.0",
        "href" : protocol + "://" + host + baseurl,
        "error" : {
          "message" : errorMessage
        }
      } 
    }
  }
  
};

