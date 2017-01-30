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
