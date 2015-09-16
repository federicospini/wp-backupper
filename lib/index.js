var DEBUG = true;

var Browser = require('zombie');
var request = require('request');
var fs = require('fs');
var join = require('path').join;
var async = require('async');
var curry = require('curry');
var mkdirp = require('mkdirp');
var retry = require('retry');
var Rsync = require('rsync');
var util = require('util');


/* constructor */

var B = module.exports = function (options) {
  var dateString = getDateString();
  this.domain = options.domain;
  this.path = join(options.path, dateString, this.domain);

  // zombie params
  this.urls = options.urls;
  this.login = options.login;
  this.savingPath = join(this.path, 'exported-files');
  this.browser = new Browser();

  // rsync params
  this.rsync = options.rsync;
  this.source = util.format('%s@%s:%s', 
    this.rsync.username, 
    this.rsync.url, 
    this.rsync.source
  );
  this.destination = join(this.path, 'data');
};

B.prototype.runFoultTolerant = function (done) {
  async.waterfall([
    this.runFiles.bind(this),
    this.runWPContent.bind(this)
  ], done);
};

B.prototype.run = function (done) {
  async.waterfall([
    this.runFiles.bind(this),
    this.runWPContent.bind(this)
  ], done);
};

B.prototype.runWPContentFoultTolerant = function (done) {
  DEBUG && console.log('- runWPContentFoultTolerant');
  var operation = retry.operation();
  var that = this;
 
  operation.attempt(function(currentAttempt) {
    that.runWPContent(function (err) {
      done(err ? operation.mainError() : null);
    });
  });
};

B.prototype.runWPContent = function (done) {
  DEBUG && console.log('- runWPContent');
  var rsync = Rsync.build({
    source: this.source,
    destination: this.destination,
    flags: 'avz',
    shell: 'ssh'
  });

  mkdirp(this.destination, function (err, made) {
    if (err) {
      setImmediate(done, err);
      return;
    }

    rsync.execute(function(error, stdout, stderr) {
      setImmediate(done, error);
    });
  });
};

B.prototype.runFilesFoultTolerant = function (done) {
  DEBUG && console.log('- runFilesFoultTolerant');
  var operation = retry.operation();
  var that = this;
 
  operation.attempt(function(currentAttempt) {
    that.runFiles(function (err) {
      done(err ? operation.mainError() : null);
    });
  });
};

B.prototype.runFiles = function (done) {
  DEBUG && console.log('- runFiles');
  async.waterfall([
    curry.to(2, mkdirp)(this.savingPath),
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
    var filepath = join(this.savingPath, obj.filename);
    var jar = this.cookieJar;
    var r = request({
      url: obj.url,
      jar: jar,
      headers: obj.headers,
      qs: obj.qs
    });
    r.on('end', next)
    r.pipe(fs.createWriteStream(filepath));  
  }.bind(this);
};


/** simple module utils **/

var getDateString = function () {
  var date = new Date();
  var month = '' + (date.getUTCMonth() + 1); //months from 1-12
  var day = '' + date.getUTCDate();
  var year = '' + date.getUTCFullYear();

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
