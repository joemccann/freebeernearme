/* Author: Joe McCann */

var	isGapped = false, locale = {};

$(function(){
	var isTitanium = (typeof window.Titanium === 'object') ? true : false;
	
	// Get location.
	if(!!navigator.geolocation && !isGapped)
	{
		//geo_position_js.getCurrentPosition(success_callback,error_callback,{enableHighAccuracy:true,options:5000});
		
		navigator.geolocation.watchPosition(geo_success, geo_error, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
    console.log("HTML5 Geolocation Available")
	}
	else{
		// Let's try by IP
		// Build the URL to query
		var url = "http://freegeoip.net/json/";
		console.log("HTML5 Geolocation Not Available")

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
			
			showLocaleInfo();
			
		});
		
	}


	// This is the function which is called each time the Geo location position is updated
	function geo_success(p)
	{
		console.log('success')
		locale.latitude = p.coords.latitude.toFixed(4);
		locale.longitude = p.coords.longitude.toFixed(4);
		showLocaleInfo();
	}

	// This function is called each time navigator.geolocation.watchPosition() generates an error (i.e. cannot get a Geo location reading)
	function geo_error(error)
	{
		console.log(error.message);
	    switch(error.code)
	    {
	        case error.TIMEOUT:
	            console.log("Timeout!");
	        break;
	    };
	}

	function showLocaleInfo()
	{
		$(document.body)
			.append('<p>Latitude: ' + locale.latitude +'</p>')
			.append('<p>Longitude: ' + locale.longitude +'</p>');
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






















