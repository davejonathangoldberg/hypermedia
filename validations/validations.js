module.exports = function Validations() {
  var url = require('url');
  var check = require('validator').check;
  var sanitize = require('validator').sanitize;
  
  this.trimUrl = function (rawUrl) {
    var rawUrlObject = url.parse(rawUrl);
    var cleanUrl = rawUrlObject.host + rawUrlObject.path;
    cleanUrl = sanitize(cleanUrl).rtrim('%2F');
    return cleanUrl;
  }
  
  this.parseTags = function (tagsString) {
    var tagArray = tagsString.split(',');
    return tagArray;
  }
  
  this.validateRootItem = function (operationType, rootCollectionNameFields, itemFields) {
    var rootCollectionNameList = rootCollectionNameFields.toString();
    // VALIDATE STRUCTURE OF POST OR PUT BODY
    if((!itemFields.hasOwnProperty("template")) || (!itemFields.template.hasOwnProperty("data"))) {
      console.log('Client did not send a body with a template object or data object.');
      return {  "validationError" : true,
                "message" : "Error - You did not submit a properly structured template. Please submit again using the complete template. The template object includes 'template' as the top level field. The value of the 'template' field is another object that contains a 'data' field. The value of the data field is an array of objects detailing the accepted fields.",
                "interfaceFields"  : ""
             };
      
    }
    if (!(itemFields.template.data instanceof Array)) {
      console.log('Client did not send a body with a data array in the data object.');
      return {  "validationError" : true,
                "message" : "Error - You did not submit a properly structured template. Please submit again using the complete template. The template object includes 'template' as the top level field. The value of the 'template' field is another object that contains a 'data' field. The value of the data field is an array of objects detailing the accepted fields.",
                "interfaceFields"  : ""
             };
    }
    var itemDataFields = itemFields.template.data;
    var dataFieldNames = [];
    var itemDataFieldsObject = {};
    
    // ITERATE THROUGH DATA OBJECTS
    for ( var i=0; i<itemDataFields.length; i++ ) {
      var dataObject = itemDataFields[i];
      
      // DON'T ALLOW FIELDS THAT AREN'T DEFINED IN THE TEMPLATE
      if((!dataObject.hasOwnProperty("name")) || (!dataObject.hasOwnProperty("value"))) {
        console.log('Data object does not have a name or value field.');
        return {  "validationError" : true,
                  "message" : "Error - You did not submit a properly structured template. Please submit again using the complete template. The template object includes 'template' as the top level field. The value of the 'template' field is another object that contains a 'data' field. The value of the data field is an array of objects detailing the accepted fields.",
                  "interfaceFields"  : ""
               };
      }
      dataFieldNames.push(dataObject.name);
      
      if (rootCollectionNameFields.indexOf(dataObject.name) < 0) {
        return {  "validationError" : true,
                  "message" : "You tried to submit " + dataField.name + ". Attributes of an API are limited to " + rootCollectionNameList + ".",
                  "interfaceFields" : ""
               };
      }
      
      // VALIDATE INPUT FIELDS -- USE FOR BOTH INSERT AND UPDATE
      if(dataObject.name == 'apiUrl') {
        try {
          check(dataObject.value).isUrl();
        } catch (e) {
          console.log(e.message); 
          return {  "validationError" : true,
                    "message" : "Invalid URL supplied in apiUrl field.",
                    "interfaceFields" : ""
                 };
        }
      }
      if(dataObject.name == 'mediaType') {
        try {
          check(dataObject.value).len(5).notEmpty();
        } catch (e) {
          console.log(e.message);
          console.log("Name: " + dataObject.name + " Value: " + dataObject.value);
          return {  "validationError" : true,
                    "message" : "MediaType length must be greater than 5 characters.",
                    "interfaceFields" : ""
                 };
        }
      }
      
      if((dataObject.name == 'apiName') && (dataObject.value != '')) {
        try {
          check(dataObject.value).notNull();
        } catch (e) {
          console.log(e.message);
          console.log("Name: " + dataObject.name + " Value: " + dataObject.value);
          return {  "validationError" : true,
                    "message" : "Please check your input and re-submit.",
                    "interfaceFields" : ""
                 };
        }
      }
      
      if((dataObject.name == 'contact') && (dataObject.value != '')) {
        try {
          check(dataObject.value).notNull().isEmail();
        } catch (e) {
          console.log(e.message);
          console.log("Name: " + dataObject.name + " Value: " + dataObject.value);
          return {  "validationError" : true,
                    "message" : "You submitted an invalid email address.",
                    "interfaceFields" : ""
                 };
        }
      }
      
      if((dataObject.name == 'tags')) {
        try {
        }
        catch (e) {
          console.log(e.message);
          console.log("Name: " + dataObject.name + " Value: " + dataObject.value);
          return {  "validationError" : true,
                    "message" : "Tags should not be null.",
                    "interfaceFields" : ""
                 };
        }
        var tagsArray = dataObject.value;
        dataObject.value = [];
        dataObject.value = tagsArray.split(',');
      }
      
      // MAP TO SINGLE OBJECT
      itemDataFieldsObject[dataObject.name] = dataObject.value;
    }// END ITERATION THROUGH DATA OBJECTS
    
    // MAKE SURE THAT REQUIRED FIELDS WERE SUBMITTED -- ONLY FOR INSERT OPERATIONS, NOT UPDATE
    for ( var i=0; i<rootCollectionNameFields.length; i++ ) {
      if(dataFieldNames.indexOf(rootCollectionNameFields[i]) < 0) {
        return {  "validationError" : true,
                  "message" : "Error - You did not submit all elements of the template data array (" + rootCollectionNameList + "). Please submit again using the complete template.",
                  "interfaceFields"  : ""
               };
      }
    }
    
    // IF VALIDATIONS PASS, SEND BACK DATA FOR INSERTION INTO DB
    return {  "validationError" : false,
              "message" : "",
              "modifiedDate" : new Date(),
              "interfaceFields" : itemDataFieldsObject
           };
  
  }
  
  
  this.validateRootItemFromForm = function (operationType, rootCollectionNameFields, itemFields) {
    var rootCollectionNameList = rootCollectionNameFields.toString();
    
    // VALIDATE STRUCTURE OF POST BODY
    var dataFieldNames = [];
    var itemDataFieldsObject = {};
    
    // ITERATE THROUGH DATA OBJECTS
    for ( var field in itemFields ) {
    
      dataFieldNames.push(field);  
      // DON'T ALLOW FIELDS THAT AREN'T DEFINED IN THE TEMPLATE
      if (rootCollectionNameFields.indexOf(field) < 0) {
        return {  "validationError" : true,
                  "message" : "You tried to submit " + field + ". Attributes of an API are limited to " + rootCollectionNameList + ".",
                  "interfaceFields" : ""
               };
      }
      
      // VALIDATE INPUT FIELDS -- USE FOR BOTH INSERT AND UPDATE
      if( field == 'apiUrl' ) {
        try {
          check(itemFields[field]).isUrl();
        } catch (e) {
          console.log(e.message); 
          return {  "validationError" : true,
                    "message" : "Invalid URL supplied in apiUrl field.",
                    "interfaceFields" : ""
                 };
        }
      }
      if( field == 'mediaType' ) {
        try {
          check(itemFields[field]).len(5).notEmpty();
        } catch (e) {
          console.log(e.message);
          console.log("Name: " + dataObject.name + " Value: " + dataObject.value);
          return {  "validationError" : true,
                    "message" : "MediaType length must be greater than 5 characters.",
                    "interfaceFields" : ""
                 };
        }
      }
      
      if(( field == 'apiName') && ( itemFields[field] != '')) {
        try {
          check(itemFields[field]).notNull();
        } catch (e) {
          console.log(e.message);
          console.log("Name: " + field + " Value: " + itemFields[field]);
          return {  "validationError" : true,
                    "message" : "Please check your input and re-submit.",
                    "interfaceFields" : ""
                 };
        }
      }
      
      if(( field == 'contact') && ( itemFields[field] != '')) {
        try {
          check(itemFields[field]).notNull().isEmail();
        } catch (e) {
          console.log(e.message);
          console.log("Name: " + field + " Value: " + itemFields[field]);
          return {  "validationError" : true,
                    "message" : "You submitted an invalid email address.",
                    "interfaceFields" : ""
                 };
        }
      }
      
      if((field == 'tags')) {
        try {
        }
        catch (e) {
          console.log(e.message);
          console.log("Name: " + field + " Value: " + itemFields[field]);
          return {  "validationError" : true,
                    "message" : "Tags should not be null.",
                    "interfaceFields" : ""
                 };
        }
        var tagsArray = itemFields[field];
        tagsArray = tagsArray.split(',');
        for ( var i=0; i<tagsArray.length; i++ ) {
          tagsArray[i] = sanitize(tagsArray[i]).trim();
        }
        itemFields[field] = [];
        itemFields[field] = tagsArray;
      }
      
      // MAP TO SINGLE OBJECT
      itemDataFieldsObject[field] = itemFields[field];
    }// END ITERATION THROUGH DATA OBJECTS
    
    // MAKE SURE THAT REQUIRED FIELDS WERE SUBMITTED -- ONLY FOR INSERT OPERATIONS, NOT UPDATE
    for ( var i=0; i<rootCollectionNameFields.length; i++ ) {
      if(dataFieldNames.indexOf(rootCollectionNameFields[i]) < 0) {
        return {  "validationError" : true,
                  "message" : "Error - You did not submit all elements of the template data array (" + rootCollectionNameList + "). Please submit again using the complete template.",
                  "interfaceFields"  : ""
               };
      }
    }
    
    // IF VALIDATIONS PASS, SEND BACK DATA FOR INSERTION INTO DB
    return {  "validationError" : false,
              "message" : "",
              "modifiedDate" : new Date(),
              "interfaceFields" : itemDataFieldsObject
           };
  
  }
  
}

