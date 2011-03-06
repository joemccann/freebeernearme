/* Author: Joe McCann */

var	isGapped = false, 
		isMobile = false, 
		isAndroid = false,
		isTitanium = false, 
		locale = {};

var offline = false;

$(function(){
	
	function whereYat()
	{
		// Get location.
		if(!!navigator.geolocation && !isGapped && !isTitanium)
		{
			// For testing with no wifi on the plane.
			if(offline)
			{
				locale = {latitude: 30.97, longitude: -122.92}
			}
			else
			{
						navigator.geolocation.getCurrentPosition(geoSuccess, geoError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });

				//		navigator.geolocation.watchPosition(geoSuccess, geoError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
			}
		}
		else{

			if(offline)
			{
				locale = {latitude: 30.97, longitude: -122.92}
				showDesktopNotification("location-found");
			}

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
				isTitanium && locale.notifiction && showDesktopNotification("location-found");

				//showLocaleInfo();

			});

		}
		
	}
	
	function showDesktopNotification(type)
	{
		switch(type)
		{
			case 'location-found':
				var notify = Titanium.Notification.createNotification();
				notify.setTitle("Free Beer Near Me")
				notify.setMessage("Your location was found!")
				notify.setIcon("/img/beer.png")
				notify.show();
			break;
			default: break;
		}
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

	// Let's call out to our twitter proxy and get some data.
	/**
	[{"from_user_id_str":"150625225","location":"37.786000, -122.402400","profile_image_url":"http://a2.twimg.com/profile_images/1118875174/Neptunius_150_normal.png","created_at":"Fri, 04 Mar 2011 02:49:11 +0000","from_user":"neptunius0","id_str":"43503223654465536","metadata":{"result_type":"recent"},"to_user_id":null,"text":"SF Python meetup, lecture on just-in-time compilers with free beer and pizza! :-D @ Yelp HQ http://gowal.la/c/3ESaR","id":43503223654465540,"from_user_id":150625225,"geo":{"type":"Point","coordinates":[37.786,-122.4024]},"iso_language_code":"en","place":{"id":"40cc4f30f5c20c6a","type":"poi","full_name":"Yelp, San Francisco"},"to_user_id_str":null,"source":"<a href="http://gowalla.com/" rel="nofollow">Gowalla</a>"}],"max_id":44049525769371650,"since_id":41527910200381440,"refresh_url":"?since_id=44049525769371648&q=free+beer","total":1,"results_per_page":15,"page":1,"completed_in":1.032223,"warning":"adjusted since_id to 41527910200381440 (), requested since_id was older than allowed","since_id_str":"41527910200381440","max_id_str":"44049525769371648","query":"free+beer"}
	**/
	function pollTwitter(cb)
	{
		// Some weak hacks to make the url play nice with express GET routes.
		// TODO: CLEAN THIS UP SO IT'S NOT LOCAL...NEEDS TO REFLECT ACTUAL WEBSITE.
		var url = isTitanium ? 'http://'+ Titanium.Network.getAddress() +':7575/api/gettweets/' : '/api/gettweets/';
		
		if(offline)
		{
			$.get('/testing.json', function(data){
				
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
							var list = createList(data);

							appendList(list);	

						}

					});
				}
				
			})
		}
		else
		{
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
								var list = createList(data);

								appendList(list);	

							}

						});
					}
			});
			
		}
		
	
	} // end pollTwitter
	
	function appendList(list)
	{
		$('#list').append(list).fadeIn(200);
	}
	
	function createList(data)
	{
		var list = "<h2>Search Results:</h2><div id='list-wrap'><ul class='beer-locations'>";
		var geoIterator = 0
		data.results.forEach(function(el, index){
			if(el.geo != null)
			{
				// Show at most 5 results?  Remove this line if you want all and an ugly overflowing container w/scrollbars.
				if(geoIterator < 5)
				{
					geoIterator++;
					//<a href="http://maps.google.com/maps?daddr=San+Francisco,+CA&saddr=cupertino">Directions</a>

					var startAddress 				= locale.latitude+","+locale.longitude;
					var destinationAddress 	=	el.location.replace(' ', ''); 
					
					var link = '<a href="http://maps.google.com/maps?dirflg=w&daddr='
											+destinationAddress
											+'&saddr='+ startAddress 
											+'">' 
											+el.text
											+ '</a>';
											
					//link = (isGapped || isAndroid) ? "<a href='geo:"+el.location.replace(' ', '')+"?z=20'>" +el.text+ "</a>" : "<a href='geo:"+el.location+"'>" +el.text+ "</a>";

					list += "<li class='tweet-location' data-location='"+el.location+"'>"+ link +"</li>";
				} 

			}
		})
		list += "</ul></div>";
		return list;
	}
	
	function closeModal()
	{
		if( $('#fill').is(":visible") )
		{
			$('#map-frame').fadeOut(200, function(){
				$('#map-frame').find('iframe').remove();
				$('#fill').fadeOut(200);
			})
		}
	}
	
	// http://www.dynamicdrive.com/dynamicindex17/iframessi2.htm
	function resizeIframe()
	{
		var currentfr=document.getElementById('current-iframe')
		if (currentfr && !window.opera)
		{
			currentfr.style.display="block"
			if (currentfr.contentDocument && currentfr.contentDocument.body.offsetHeight) //ns6 syntax
			currentfr.height = currentfr.contentDocument.body.offsetHeight+FFextraHeight; 
			else if (currentfr.Document && currentfr.Document.body.scrollHeight) //ie5+ syntax
			currentfr.height = currentfr.Document.body.scrollHeight;
			if (currentfr.addEventListener)
			currentfr.addEventListener("load", readjustIframe, false)
			else if (currentfr.attachEvent)
			{
				currentfr.detachEvent("onload", readjustIframe) // Bug fix line
				currentfr.attachEvent("onload", readjustIframe)
			}
		}
	}

	function yeahNo()
	{
		isTitanium = (typeof window.Titanium === 'object') ? true : false;
		isMobile = /mobile/i.test(navigator.userAgent);
		isAndroid = /android/i.test(navigator.userAgent);
	}

	function init()
	{
		yeahNo();
		whereYat();
		$('header').lettering('lines');
		$('.line1, .line2').lettering();
		
		setTimeout(function(){
			$('#subprint').fadeIn(3000);
		}, 1000)		
		
		var _gaq = _gaq || [];
		  _gaq.push(['_setAccount', 'UA-3312370-9']);
		  _gaq.push(['_trackPageview']);

		  (function() {
		    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		  })();
		
		
	}
	
	// Bindings...
	
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
	
	$('#fill').bind('click', closeModal);

	// TODO: Add esc key
	$(document.body).bind('keypress', function(e){
		if(e.keyCode == 27 || e.keyCode == 32 ) closeModal();
	});
	
	$('.tweet-location > a').live('click', function(){

		var href = this.href;
		var location = $(this).attr('data-location');
		//console.log(location + " is the location from the data attribute.");

		if(isMobile || isGapped)
		{
			// Let device open Google Maps.
		}
		else
		{
			// Show modal (weak sauce, modals are lame, but I'm strapped for time)
			$('#fill').fadeIn(200, function(){
				$('#map-frame').append("<iframe id='current-iframe' width='800' height='600' frameborder='1' scrolling='auto' src='" + href + "'></iframe>").fadeIn(200, function(){
						//resizeIframe();
				})

			});

		}
		return isMobile;

	});
	
	
	

	init();
	
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