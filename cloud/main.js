/*
 * Cloud code for the NEMP MapSharing
 *
 * Cloud code for "nemp-mapsharing" connected to the "nemp_mapsharing" MongoLab DB deployed on Heroku
 * Git repo: 				https://github.com/grassland-curing-cfa/NempMapSharing
 * Initial checkin date:	30/01/2017
 * Follow-up check date:	
 */

var _ = require('underscore');
var moment = require('moment');

var APP_ID = process.env.APP_ID;
var MASTER_KEY = process.env.MASTER_KEY;
var SERVER_URL = process.env.SERVER_URL;
var APP_NAME = process.env.APP_NAME;

var MG_DOMAIN = process.env.MG_DOMAIN;
var MG_KEY = process.env.MG_KEY;

var CFA_NEMP_EMAIL = process.env.EMAIL_ADDR_CFA_NEMP;

Parse.Cloud.define('hello', function(request, response) {
  response.success("Hello world from " + APP_NAME);
});

/**
 * Removes the associated MpaSharing map file uploaded before the "MAPSHARING_MAP" row is deleted
 */
Parse.Cloud.beforeDelete("MAPSHARING_MAP", function(request, response) {
	// Checks if "MapSharingFile" has a value
	if (request.object.has("MapSharingFile")) {

	    var file = request.object.get("MapSharingFile");
	    var fileName = file.name();
	    console.log(file.name());
	    Parse.Cloud.httpRequest({
	    	method: 'DELETE',
	        url: SERVER_URL + "/files/" + fileName,
	        headers: {
	        	"X-Parse-Application-Id": APP_ID,
	        	"X-Parse-Master-Key" : MASTER_KEY
	        },
	        success: function(httpResponse) {
	        	console.log('Deleted the file associated with the MAPSHARING_MAP record successfully.');
	        	response.success();
	        },
	        error: function(httpResponse) {
	        	console.error('Delete failed with response code ' + httpResponse.status + ':' + httpResponse.text);
	        	response.error()
	        }
	    });
	} else {
		console.log('MAPSHARING_MAP object to be deleted does not have an associated MapSharingFile (File). No MapSharingFile to be deleted.');
		response.success();
	}
});