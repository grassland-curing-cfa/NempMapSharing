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

//Send an email for NEMP MapSharing product to the State Control Team mail list.
Parse.Cloud.define("sendMapSharingEmailToUsers", function(request, response) {
	var rawStrToday = request.params.dateString;	// in the format of "%d_%m_%Y"
	var strToday = rawStrToday.replace(/_/g, '/');
	
	var queryMapSharingClass = new Parse.Query("MAPSHARING_MAP");
	queryMapSharingClass.descending("createdAt");
	queryMapSharingClass.find().then(function(results) {
		// results is array of MAPSHARING_MAP records
		// We only care about the most recent one
		var latestUploaded = results[0];
		var uploadedUrl = latestUploaded.get("MapSharingFileUrl");
		
		console.log("The most recent MapSharing map uploaded file Url: " + uploadedUrl)
		
		// use Mailgun to send email
		var mailgun = require('mailgun-js')({apiKey: MG_KEY, domain: MG_DOMAIN});
		
		var htmlString = 
					'<!DOCTYPE html><html>' + 
					'<head>' + 
					'<title>MapSharing product</title>' + 
					'<style>' + 
					'p, li {margin:0cm; margin-bottom:.0001pt; font-size:11.0pt; font-family:"Calibri","sans-serif";}' + 
					'</style>' + 
					'</head>' + 
					'<body>' + 
					//'<p>Hello %recipient%,</p>' + 
					'<p>Hello All,</p>' + 
					'<br>' + 
					'<p>The MapSharing map has been updated ' + strToday + '. To view the report, please click the link <a href="' + uploadedUrl + '" target="_top">here</a>.</p>' + 
					'<br>' + 
					'<p>Please note: If the report does not display properly in your web browser, please save it to your desktop and view directly using Acrobat Reader.</p>' + 
					'<br>' + 
					'<p>Kind Regards,</p>' + 
					'<p>The NEMP Grassland Curing Team</p>' + 
					'<br>' + 
					'<table><tr><td width="25%"><img src="http://www.cfa.vic.gov.au/img/logo.png" width="64" height="64" alt="CFA_LOGO" /></td>' + 
					'<td><p style="color:#C00000; font-weight: bold;">NEMP Grassland Curing Team</p><p>CFA HQ - Fire & Emergency Management</p><p>8 Lakeside Drive, Burwood East, Victoria 3151</p>' + 
					'<p>E: <a href="mailto:' + CFA_NEMP_EMAIL + '" target="_top">' + CFA_NEMP_EMAIL + '</a></p></td></tr></table>' + 
					'<br>' + 
					'<p><i>Note: This email has been automatically generated. Please do not reply to this email.</i></p>' + 
					'</body>' + 
					'</html>';
		
		var result = null;
		
		//
		var data = {
			to: "a.chen@cfa.vic.gov.au",
			//cc: CFA_NEMP_EMAIL,
			from: CFA_NEMP_EMAIL,
			subject: "Grassland Curing Map Sharing - " + strToday,
			text: "",
			html: htmlString
		};

		mailgun.messages().send(data, function (error, body) {
			if (error) {
				console.log(error);
				result = {
					"result": false,
					"details": error
				};
				response.error(result);
			} else {
				console.log(body);
				result = {
					"result": true,
					"details": JSON.stringify(body)
				};
				response.success(result);
			}
		});
	}, function(error) {
	    response.error("MAPSHARING_MAP table lookup failed");
	});
});