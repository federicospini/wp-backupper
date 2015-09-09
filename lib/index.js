var DEBUG = true;

var Browser = require('zombie');
var request = require('request');
var fs = require('fs');
var join = require('path').join;
var async = require('async');
var curry = require('curry');
var mkdirp = require('mkdirp');
var retry = require('retry');


/* constructor */

var B = module.exports = function (options) {
  this.urls = options.urls;
  this.login = options.login;
  this.path = join(options.path, getDateString());
  this.browser = new Browser();
};

B.prototype.run = function (done) {
  DEBUG && console.log('- run');
  async.waterfall([
    curry.to(2, mkdirp)(this.path),
    function (made, next) { setImmediate(next); },
    this._signin.bind(this),
    this._handleCookies.bind(this),
    this._download.bind(this)
  ], done);
};

B.prototype._signin = function (next) {
  DEBUG && console.log('- _signin');
  async.waterfall([
    this._visitURL(this.login.url),
    this._fillTheForm.bind(this)
  ], next);
};

B.prototype._visitURL = function (url) {
  DEBUG && console.log('- _visitURL: ' + url);
  return function (next) {
    this.browser.visit(url, next);
  }.bind(this);
};

B.prototype._fillTheForm = function (next) {
  DEBUG && console.log('- _fillTheForm');
  this.browser.fill('#user_login', this.login.username);
  this.browser.fill('#user_pass', this.login.password);
  this.browser.pressButton('#wp-submit', next);
};

B.prototype._handleCookies = function (next) {
  DEBUG && console.log('- _handleCookies');
  this.cookies = this.browser.cookies.select({domain: this.domain});
  this.cookieJar = request.jar();
  setImmediate(next);
};

B.prototype._download = function (next) {
  DEBUG && console.log('- _download');
  async.eachSeries(this.urls, this._processURL.bind(this), next);
};


B.prototype._processURL = function (obj, next) {
  DEBUG && console.log('- _processURL');
  async.waterfall([
    this._bakeCookies(obj.url),
    this._sendRequest(obj)
  ], next);
};

B.prototype._bakeCookies = function (url) {
  return function (next) {
    DEBUG && console.log('- _bakeCookies');
    this.browser.cookies.forEach(function (cookie) {
      this.cookieJar.setCookie(request.cookie(cookie.toString()), url);
    }, this);
    setImmediate(next);
  }.bind(this);
};

B.prototype._sendRequest = function (obj) {
  return function (next) {
    DEBUG && console.log('- _sendRequest');
    var filepath = join(this.path, obj.filename);
    request({
      url: obj.url,
      jar: this.cookieJar})
    .on('end', next)
    .pipe(fs.createWriteStream(filepath));  
  }.bind(this);
};


/** simple module utils **/

var getDateString = function () {
  var date = new Date();
  var month = date.getUTCMonth() + 1; //months from 1-12
  var day = date.getUTCDate();
  var year = date.getUTCFullYear();

  month = month.length === 2 ? month : '0' + month;
  day = day.length === 2 ? day : '0' + day;

  return year + "-" + month + "-" + day;
};

var getFuncName = function (fun) {
  var name = fun.toString();
  name = name.substr('function '.length);
  name = name.substr(0, name.indexOf('('));
  return name;
};
