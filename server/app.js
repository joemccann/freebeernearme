var express = require('express'),
		sys = require('sys'),
		request = require('request')

var app = module.exports = express.createServer();

// App Configuration
app.configure(function(){
    app.use('/', express.bodyDecoder());
    app.use('/', express.methodOverride());
    app.use(express.staticProvider(__dirname + '/codebase'));
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
 * Note: In the curl, we add underscores and asterisks which are then replaced so you can test the url in the browser.
 * curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://freebeernear.me/api/gettweets/37_786000/*122_402400 | jsonpretty
 */
app.get('/api/gettweets/:lat/:lon', function(req,res,next){
	
	var lat = req.params['lat'];
	var lon = req.params['lon'];

	lat = lat.replace("_", ".").replace("*", "-")
	lon = lon.replace("_", ".").replace("*", "-")

	console.log('\nRemote Address: ' + sys.inspect(req.socket.remoteAddress))
  console.log('\nRequest GPS coordinates: '+lat+','+lon)
	
	request(
  {
      uri: createGeoTweetUri("free beer", lat, lon)
  }, function (error, response, body)
  {
      if (!error && response.statusCode == 200)
      {
          var result = JSON.parse(body)

					//console.log(sys.inspect(result));
					
					res.send( JSON.stringify(result), { 'Content-Type': 'application/json' }, response.statusCode);

      }
      else
      {
          console.log(sys.inspect(response));
					res.send( JSON.stringify(response), { 'Content-Type': 'application/json' }, response.statusCode);
      }
  });
	
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(7575);
  console.log("Express server listening on port %d", app.address().port)
}