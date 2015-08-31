require('dotenv').load();
var Browser = require('zombie');
var request = require('request');
var fs = require('fs');

var urlLogin = 'http://www.sitac.it/wp-login.php?redirect_to=http%3A%2F%2Fwww.sitac.it%2Fwp-admin%2F&reauth=1';
var urlExport = 'http://www.sitac.it/wp-admin/export.php?download=true&content=all&cat=0&post_author=0&post_start_date=0&post_end_date=0&post_status=0&page_author=0&page_start_date=0&page_end_date=0&page_status=0&submit=Scarica+file+di+esportazione';
var user = process.env.USERNAME;
var pass = process.env.PASSWORD;

var browser = new Browser();

browser.visit(urlLogin, visitLoginPage);

function visitLoginPage (err) {
  if (err) {
    console.log(err);
    return;
  }
    
  browser
    .fill('#user_login', user)
    .fill('#user_pass', pass)

  browser.pressButton('#wp-submit', visitDashboardPage);
}

function visitDashboardPage (err) {
  if (err) {
    console.log(err);
    return;
  }

  var cookies = browser.cookies.select({domain: 'www.sitac.it'});

  var j = request.jar();
  browser.cookies.forEach(function (cookie) {
    j.setCookie(request.cookie(cookie.toString()), urlExport);
  });

  request({
    url:urlExport,
    jar: j})
  .on('end', function(response) {
    console.log('\n\n\tDONE :)\n\n');
    process.exit(0);
  })
  .pipe(fs.createWriteStream('./data/export.xml'));  
}

// require('dotenv').load();
// var jsdom = require("jsdom");
// var cookieJar = jsdom.createCookieJar();

// var user = process.env.user
// var passwd = process.env.password

// jsdom.env({
//   url: "http://www.sitac.it/wp-login.php?redirect_to=http%3A%2F%2Fwww.sitac.it%2Fwp-admin%2F&reauth=1",
//   scripts: ["http://code.jquery.com/jquery.js"],
//   done: function (err, window) {
//     var $ = window.$;

//     var input_user = $('#user_login');
//     var input_passwd = $('#user_pass');
//     var button_submit = $('#wp-submit');

//     input_user.value = user;
//     input_passwd.value = passwd;

//     button_submit.click();

//   }
// });




// var jsdom = require("jsdom");

// jsdom.env({
//     url: 'http://google.com',
//     done: function (err1, window1) {
//         //...

//         jsdom.env({
//             url: 'http://code.google.com',
//             cookieJar: cookieJar,
//             done: function (err2, window2) {
//                 //...
//             }
//         });
//     }
// });
