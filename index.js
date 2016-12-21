require('dotenv').load();
var cron = require('cron');
var async = require('async');

///

var Backupper = require('./lib/index.js');

var urls_sitac = [
  {
    filename: 'wp-export.xml',
    url: 'http://www.sitac.it/wp-admin/export.php?download=true&content=all&cat=0&post_author=0&post_start_date=0&post_end_date=0&post_status=0&page_author=0&page_start_date=0&page_end_date=0&page_status=0&submit=Scarica+file+di+esportazione',
    desc: 'site content'
  }, {
    filename: 'inspira-options.json',
    url: 'http://www.sitac.it?feed=redux_options_theme_option&secret=dbd2cc0714365cdc87b4dbdf41a91250',
    desc: 'inspira options'
  }
];

var options_sitac = {
  domain: 'www.sitac.it',
  // path: '~/backups/crarl.it/',
  path: './data/',
  urls: urls_sitac,
  login: {
    url: 'http://www.sitac.it/wp-login.php?redirect_to=http%3A%2F%2Fwww.sitac.it%2Fwp-admin%2F&reauth=1',
    username: process.env.USERNAME,
    password: process.env.SITAC_PASSWORD
  },
  rsync: {
    url: 'sitac.it',
    username: process.env.SSH_USERNAME, // id_rsa.pub of the source host must be present in host .ssh/authorized_keys
    source: '/var/lib/docker/vfs/dir/cc6cc5ea79df5edc31f9f7047cb81613b4c57677645087f1c0d7a4721ba335b0/' // wp-content path
    // source: '/home/admin/www/'
  }
};

var urls_crarl = [
  {
    filename: 'wp-export.xml',
    url: 'http://www.crarl.it/wp-admin/export.php?download=true&content=all&cat=0&post_author=0&post_start_date=0&post_end_date=0&post_status=0&page_author=0&page_start_date=0&page_end_date=0&page_status=0&submit=Scarica+file+di+esportazione',
    desc: 'site content'
  }, {
    filename: 'inspira-options.json',
    url: 'http://www.crarl.it?feed=redux_options_theme_option&secret=dbd2cc0714365cdc87b4dbdf41a91250',
    desc: 'inspira options'
  }
];

var options_crarl = {
  domain: 'www.crarl.it',
  // path: '~/backups/sitac.it/',
  path: './data/',
  urls: urls_crarl,
  login: {
    url: 'http://www.crarl.it/wp-login.php?redirect_to=http%3A%2F%2Fwww.crarl.it%2Fwp-admin%2F&reauth=1',
    username: process.env.USERNAME,
    password: process.env.CRARL_PASSWORD
  },
  rsync: {
    url: 'crarl.it',
    username: process.env.SSH_USERNAME, // id_rsa.pub of the source host must be present in host .ssh/authorized_keys
    source: '/var/lib/docker/vfs/dir/94a686878887b8413090a58067c7d8cde5760df539f0fb1804b0a70b7cbf1e91/'  // wp-content path
    // source: '/home/admin/www/'
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
};

var backup_sitac = function (done) {
  var sitac_b = new Backupper(options_sitac);
  // sitac_b.runFoultTolerant(done);
  sitac_b.runFilesFoultTolerant(done);
};

var backup_crarl = function (done) {
  var crarl_b = new Backupper(options_crarl);
  // crarl_b.runFoultTolerant(done);
  crarl_b.runFilesFoultTolerant(done);
};



backup_sitac(end);

// async.waterfall([
//   backup_sitac,
//   backup_crarl
// ], end);

// var CronJob = require('cron').CronJob;
// var sitac_job = new CronJob({
//   cronTime: '00 30 23 * * 7',
//   onTick: backup_sitac,
//   start: false,
//   timeZone: "Europe/Rome"
// });
// job.start();

// var CronJob = require('cron').CronJob;
// var sitac_job = new CronJob({
//   cronTime: '00 45 23 * * 7',
//   onTick: backup_crarl,
//   start: false,
//   timeZone: "Europe/Rome"
// });
// job.start();



/** REV SLIDER SAVING CONFIG **/

// , {
//     filename: 'rev-slider.zip',
//     url: 'http://www.sitac.it/wp-admin/admin-ajax.php?action=revslider_ajax_action&client_action=export_slider&dummy=false&nonce=03be557911&sliderid=1',
//     qs: {
//       'action': 'revslider_ajax_action',
//       'client_action': 'export_slider',
//       'dummy': false,
//       'nonce': 'c8b0f30cd7',
//       'sliderid': 1
//     },
//     headers: {
//       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//       'Accept-Encoding': 'gzip, deflate, sdch',
//       'Upgrade-Insecure-Requests': 1,
//       'Referer': 'http://www.sitac.it/wp-admin/admin.php?page=revslider'
//     },
//     desc: 'revolutionary slider'
//   }
