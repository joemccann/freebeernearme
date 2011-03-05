/* Author: Joe McCann */

var	isGapped = false, 
		isMobile = false, 
		isAndroid = false,
		isTitanium = false, 
		locale = {};

$(function(){
	isTitanium = (typeof window.Titanium === 'object') ? true : false;
	
	isMobile = /mobile/i.test(navigator.userAgent);

	isAndroid = /android/i.test(navigator.userAgent);
/*
http://maps.google.com/maps?f=d&source=s_d&saddr=30,-97&daddr=austin,tx&geocode=FYDDyQEdwOU3-g%3BFRHXzQEdK48s-ikvA8ygmbVEhjF61WnUS0abXQ&hl=en&mra=ltm&dirflg=w&sll=30.133251,-97.377319&sspn=0.733998,1.448822&ie=UTF8&ll=30.133251,-97.377319&spn=0.733998,1.448822&z=10
http://maps.google.com/maps?f=d&source=s_d&saddr=30,-97&daddr=austin,tx&geocode=FYDDyQEdwOU3-g%3BFRHXzQEdK48s-ikvA8ygmbVEhjF61WnUS0abXQ&hl=en&mra=ltm&sll=30.133251,-97.377319&sspn=0.733998,1.448822&ie=UTF8&ll=30.133251,-97.375946&spn=0.733998,1.448822&z=10
	*/
	// Get location.
	if(!!navigator.geolocation && !isGapped && !isTitanium)
	{
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
//		navigator.geolocation.watchPosition(geoSuccess, geoError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
	}
	else{

		// Let's try by IP
		// Build the URL to query
		var url = "http://freegeoip.net/json/";

		$.getJSON(url, function(data){
			/**
			// For example...
			{
			  "country_name": "United States",
			  "city": "Austin",
			  "latitude": "30.3037",
			  "country_code": "US",
			  "region_name": "Texas",
			  "zipcode": "",
			  "region_code": "TX",
			  "ip": "99.185.132.155",
			  "longitude": "-97.7696",
			  "metrocode": "635"
			}
			
			**/
			locale = data;
			
			//showLocaleInfo();
			
		});
		
	}

	// This is the function which is called each time the Geo location position is updated
	function geoSuccess(p)
	{
		locale.latitude = p.coords.latitude.toFixed(4);
		locale.longitude = p.coords.longitude.toFixed(4);
		//showLocaleInfo();
	}

	// This function is called each time navigator.geolocation.watchPosition() generates an error (i.e. cannot get a Geo location reading)
	function geoError(error)
	{
		
	    switch(error.code)
	    {
	        case error.TIMEOUT:
	            alert("Timed out attempting to get your location.  Try again.");
	        break;
					default:
						alert('Something just aint right.')
	    };
	}

	function showLocaleInfo()
	{
		// Brutally inefficient...
		$(document.body)
			.append('<p>Latitude: ' + locale.latitude +'</p>')
			.append('<p>Longitude: ' + locale.longitude +'</p>');
	}

	$('#find-beer').bind('click', function(e){
		//alert(locale.latitude)
		if( locale.latitude == undefined ) 
		{
			alert("Sorry, we can't find your location.  Maybe try again...")
			return false;
		}
		
		$(this).fadeOut(200, function(){
			$('#fetch').fadeIn(200, function(){
				pollTwitter();
			});
		});
		
		return false;
		
	});
	
	
	// Let's call out to our twitter proxy and get some data.
	/**
	[{"from_user_id_str":"150625225","location":"37.786000, -122.402400","profile_image_url":"http://a2.twimg.com/profile_images/1118875174/Neptunius_150_normal.png","created_at":"Fri, 04 Mar 2011 02:49:11 +0000","from_user":"neptunius0","id_str":"43503223654465536","metadata":{"result_type":"recent"},"to_user_id":null,"text":"SF Python meetup, lecture on just-in-time compilers with free beer and pizza! :-D @ Yelp HQ http://gowal.la/c/3ESaR","id":43503223654465540,"from_user_id":150625225,"geo":{"type":"Point","coordinates":[37.786,-122.4024]},"iso_language_code":"en","place":{"id":"40cc4f30f5c20c6a","type":"poi","full_name":"Yelp, San Francisco"},"to_user_id_str":null,"source":"<a href="http://gowalla.com/" rel="nofollow">Gowalla</a>"}],"max_id":44049525769371650,"since_id":41527910200381440,"refresh_url":"?since_id=44049525769371648&q=free+beer","total":1,"results_per_page":15,"page":1,"completed_in":1.032223,"warning":"adjusted since_id to 41527910200381440 (), requested since_id was older than allowed","since_id_str":"41527910200381440","max_id_str":"44049525769371648","query":"free+beer"}
	**/
	function pollTwitter(cb)
	{
		// Some weak hacks to make the url play nice with express GET routes.
		// TODO: CLEAN THIS UP SO IT'S NOT LOCAL...NEEDS TO REFLECT ACTUAL WEBSITE.
		var url = isTitanium ? 'http://'+ Titanium.Network.getAddress() +':7575/api/gettweets/' : '/api/gettweets/';
		alert(url)
		$.get( url + 
				locale.latitude.replace('.', '_').replace('-', '*') +
				'/'+
				locale.longitude.replace('.', '_').replace('-', '*'), 
			
			function(data){

				if( $('#fetch').is(':visible') )
				{
					$('#fetch').fadeOut(200, function(){

						//console.log(data)
						
						if(!data.results.length)
						{
							alert("No results for your location!")
						}
						else
						{
							var list = "<h2>Search Results:</h2><ul class='beer-locations'>";
							data.results.forEach(function(el, index){
								if(el.geo != null)
								{

									//<a href="http://maps.google.com/maps?daddr=San+Francisco,+CA&saddr=cupertino">Directions</a>

									var startAddress 				= locale.latitude+","+locale.longitude;
									var destinationAddress 	=	el.location.replace(' ', ''); 
									var link = '<a target="_blank" href="http://maps.google.com/maps?dirflg=w&daddr='
															+destinationAddress
															+'&saddr='+ startAddress 
															+'">' 
															+el.text
															+ '</a>';
									
									//link = (isGapped || isAndroid) ? "<a href='geo:"+el.location.replace(' ', '')+"?z=20'>" +el.text+ "</a>" : "<a href='geo:"+el.location+"'>" +el.text+ "</a>";
									
									list += "<li class='tweet-location' data-location='"+el.location+"'>"+ link +"</li>";
								}
							})
							list += "</ul>";
							
							$('#list').append(list).fadeIn(200, function(){
								$('.tweet-location').live('click', function(){
									
									// If Android/mobile, create anchor tags with map:// scheme
									
									var location = $(this).attr('data-location');
									//console.log(location + " is the location from the data attribute.");
									
									// TODO: Create map with your location and the location of the free beer tweet.
									
								})
							});
							
						}
						
					})
				}
			
		})
	}
	
})

window.onload = function ()
{
	// Lose the URL bar for mobile version...
	/mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function ()
	{
		window.scrollTo(0, 1);
	}, 1000);

    document.addEventListener('deviceready', function ()
    {
        if ( !!(device.platform) )
        {
            // So we are on the Android device.
            isGapped = true;

						var onSuccess = function(position) {
						    alert('Latitude: '          + position.coords.latitude          + '\n' +
						          'Longitude: '         + position.coords.longitude         + '\n' +
						          'Altitude: '          + position.coords.altitude          + '\n' +
						          'Accuracy: '          + position.coords.accuracy          + '\n' +
						          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
						          'Heading: '           + position.coords.heading           + '\n' +
						          'Speed: '             + position.coords.speed             + '\n' +
						          'Timestamp: '         + new Date(position.timestamp)      + '\n');
						};

						// onError Callback receives a PositionError object
						//
						function onError(error) {
						    alert('code: '    + error.code    + '\n' +
						          'message: ' + error.message + '\n');
						}
						
					
						//navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true });
				}
    }, false);
}