require('dotenv').load();
// var Browser = require('zombie');
// var request = require('request');
// var fs = require('fs');
// var async = require('async');

// var urlLogin = 'http://www.sitac.it/wp-login.php?redirect_to=http%3A%2F%2Fwww.sitac.it%2Fwp-admin%2F&reauth=1';
// var urlExport = 'http://www.sitac.it/wp-admin/export.php?download=true&content=all&cat=0&post_author=0&post_start_date=0&post_end_date=0&post_status=0&page_author=0&page_start_date=0&page_end_date=0&page_status=0&submit=Scarica+file+di+esportazione';
// var urlInspira = 'http://www.sitac.it?feed=redux_options_theme_option&secret=dbd2cc0714365cdc87b4dbdf41a91250'
// var urlSlider = 'http://www.sitac.it/wp-admin/admin-ajax.php?action=revslider_ajax_action&client_action=export_slider&dummy=false&nonce=448d26a050&sliderid=1'
// var user = process.env.USERNAME;
// var pass = process.env.PASSWORD;

// var browser = new Browser();

// browser.visit(urlLogin, login);

// function login (err) {
//   if (err) {
//     console.log(err);
//     return;
//   }
    
//   browser
//     .fill('#user_login', user)
//     .fill('#user_pass', pass)

//   browser.pressButton('#wp-submit', handleCookies);
// }

// function handleCookies (err) {
//   if (err) {
//     console.log(err);
//     return;
//   }

//   var cookies = browser.cookies.select({domain: 'www.sitac.it'});
//   var cookieJar = request.jar();

//   saveURL(urlExport, cookies, cookieJar, './data/export.xml', function (resp) {
//     console.log('\n\n\tDONE :)\n\n');
//     process.exit(0);
//   });


//   // request({
//   //   url:urlExport,
//   //   jar: j})
//   // .on('end', function(response) {
//   //   console.log('\n\n\tDONE :)\n\n');
//   //   process.exit(0);
//   // })
//   // .pipe(fs.createWriteStream('./data/export.xml'));  

  
// }

// function saveURL(url, cookies, cookieJar, filepath, done) {
//   bakeCookies(cookies, cookieJar);
//   sendRequest(url, cookieJar, filepath, done);
// }

// function bakeCookies (cookies, cookieJar) {
//   browser.cookies.forEach(function (cookie) {
//     cookieJar.setCookie(request.cookie(cookie.toString()), urlExport);
//   });
// }

// function sendRequest (url, cookieJar, filepath, done) {
//   request({
//     url:url,
//     jar: cookieJar})
//   .on('end', done)
//   .pipe(fs.createWriteStream(filepath));  
// }

// function getDate () {
//   var date = new Date();
//   var month = date.getUTCMonth() + 1; //months from 1-12
//   var day = date.getUTCDate();
//   var year = date.getUTCFullYear();

//   month = month.length === 2 ? month : '0' + month;
//   day = day.length === 2 ? day : '0' + day;

//   return year + "-" + month + "-" + day;
// }


///

var Backupper = require('./lib/index.js');

var urls = [{
  filename: 'wp-export.xml',
  url: 'http://www.sitac.it/wp-admin/export.php?download=true&content=all&cat=0&post_author=0&post_start_date=0&post_end_date=0&post_status=0&page_author=0&page_start_date=0&page_end_date=0&page_status=0&submit=Scarica+file+di+esportazione',
  desc: 'site content'
}, {
  filename: 'inspira-options.json',
  url: 'http://www.sitac.it?feed=redux_options_theme_option&secret=dbd2cc0714365cdc87b4dbdf41a91250',
  desc: 'inspira options'
}, {
  filename: 'rev-slider.zip',
  url: 'http://www.sitac.it/wp-admin/admin-ajax.php?action=revslider_ajax_action&client_action=export_slider&dummy=false&nonce=448d26a050&sliderid=1',
  desc: 'revolutionary slider'
}];

var options = {
  domain: 'www.sitac.it',
  path: './data/',
  urls: urls,
  login: {
    url: 'http://www.sitac.it/wp-login.php?redirect_to=http%3A%2F%2Fwww.sitac.it%2Fwp-admin%2F&reauth=1',
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  }
};

var end = function (err) {
  if (err) {
    console.error('Something went wrong');
    console.log(err);
    process.exit(1);
  }

  console.log('Everything is fine ;)');
  process.exit(0);
}

var b = new Backupper(options);
// b.run(end);
b.runFoultTolerant(end);


