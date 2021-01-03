// export as node module
var qs = require('querystring');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
var $ = require('jquery');

// parse string from user search
exports.parseReceivedData = function(req, res, cb) {
  var body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => body += chunk);
  req.on('end', () => {
    var data = qs.parse(body);
    //var query = data.replace(' ', '+');
    cb(data.query, req, res);
  });

}
// parse html from song list requests
exports.parseSongHtml = function(data) {
  console.log('Parsing search list html...');

  // get document
  const doc = (new JSDOM(data)).window.document.documentElement;

  var list = [];

  // extract elements from list
  try {
    // get list of track results
    let children = doc.getElementsByClassName('list bordered-list')[0].childNodes;

    for(var i = 0; i < children.length; i++){
      if (children[i].className === 'listEntry trackEntry'){
        let details = children[i].children[1];
        list.push({
          'title': details.childNodes[1].firstChild.data,
          'artist': details.childNodes[3].firstElementChild.firstChild.data,
          'href': 'https://whosampled.com' + details.firstElementChild.href
        });
      }
    }
  } catch (error) {
    // be graceful in case something breaks with the site
    res.write('Error extracting data from site.');
    res.statusCode = 500;
    res.end();
    console.error(error);
  }
  console.log('Done.');
  return list;
}

// parse html from sample list requests
exports.parseSamplesFromHtml = function(song) {
  console.log('Parsing samples from html at ' + song.href);
}
