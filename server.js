var http = require('http');
// our custom parser module
var parser = require('./parser');
var ax = require('axios');

var server = http.createServer( function(req, res) {
  switch(req.url) {
    case '/':
      parser.parseReceivedData(req, res, handleSearchRequest)
  }
});

// handle search requests from user
function handleSearchRequest(query, req, res){
  res.setHeader('Content-Type', 'text/plain');
  if (query === undefined) {
    res.write('Bad content request');
    res.statusCode = 400;
    res.end();
  };

  /*
    build search request to www.whosampled.com in format of search page
    ex: https://whosampled.com/search/?q=asdf (asdf is our query)
    send request and get html from page as result
    if page not found or bad request throw error
    parse html
    return song list from parsing
  */
  let template = 'https://whosampled.com/search/?q=';
  let url = template += query;
  var songList;

  ax.get(url)
    .then(function(response) {
      // parse data
      if(response.status === 200) {
        // parse data
        songList = parser.parseSongHtml(response.data);
      } else {
        res.write('Bad response from website');
        res.end(response.status);
      }
      // make sure we catch any random internal errors
      if (songList === undefined) {
        console.log('songList not written properly.');
        res.write('Internal server error.');
        res.end();
      } else {
        handleSearchResults(req, res, songList);
      }
    })
    .catch(function(error) {
      res.write('Error while trying to query website');
      console.error(error);
      res.statusCode = 500;
      res.end();
    });

}

function handleSearchResults(req, res, list){
  if(list.length === 0){
    res.write('No results found.');
    res.statusCode = 200;
    res.end();
  }
  // if list.size > 1 post song list from search result to user
  else if (list.size > 1){
    res.write('Multiple search results found.');
    askForSelection(songList);
  } else {
    //getSampleData(songList[0].href);
    console.log(list);
    res.statusCode = 200;
    res.end(list);
  }
}
/*
  format song list into a string (or paste)
  send response to user with string
  ask for number and wait for response (start timer)
    on user response:
      cancel(): send done response and go back to listening
      timeout(): ^
      response(): make sure response is valid (number > 0 and < list.size)
*/
function askForSelection(list){

}
// get samples from a chosen song
/*
  if a chosen song exists, get that index or the first song in the list
  build http request with that song as the key
  if bad response or notFound throw error;
  send request, get html as result
  parse samples from html
  return list of samples
*/
function getSampleData(req, res, song){

}
// post samples from song to user
/*
  build sample data into a string
  return string to user in response
*/

server.listen(3000);
