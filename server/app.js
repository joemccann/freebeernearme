var express = require('express')
, util = require('util')
, request = require('request')
, cluster = require('cluster')
, debug = false


var app = module.exports = express.createServer();

// App Configuration
app.configure(function(){
  app.use('/', express.bodyParser());
  app.use('/', express.methodOverride());
  app.use(express.static(__dirname + '/codebase'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var manifest = {
  uri:{
    twitter: "http://search.twitter.com/search.json?q={query}&rpp=80&geocode={lat},{long},10mi"
  }
}

function createGeoTweetUri(q,lat,lon)
{
  return manifest.uri.twitter
          .replace('{query}', escape(q) )
          .replace('{lat}', lat )
          .replace('{long}', lon );
}

/**
* @desc Route to handle/proxy geotweet request to twitter.
*/
app.post('/api/gettweets', function(req,res,next){
  
  var lat = req.body.lat
    , lon = req.body.lon
  
  console.log('\nRequest GPS coordinates: '+lat+','+lon)

  request.get({ uri: createGeoTweetUri("free beer", lat, lon)}, 
    function (error, response, body){
      if (!error && response.statusCode == 200)
        {
          var result = JSON.parse(body)

          //console.log(util.inspect(result));

          res.send( JSON.stringify(result), { 'Content-Type': 'application/json' }, response.statusCode);

        }
      else
      {
        console.log(response)
        res.send( JSON.stringify(response), { 'Content-Type': 'application/json' }, response.statusCode);
      }
    }) // end request()

})



if (cluster.isMaster){

  // Fork workers.
  for (var i = 0; i < 4; i++) {
    cluster.fork()
  }
  
  cluster.on('death', function(worker) {
    // We need to spin back up on death.
    cluster.fork()
    console.log('worker ' + worker.pid + ' died');
  })

}
else{ app.listen(7575) }