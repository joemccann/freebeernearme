Yayo = function(options){
  
  // Just for debugging
  var debug
  
  // "private/protected" vars
  var _locale
    , _offline
    , _maxAge
    , _maxTimeout
    , debug

  // "private" methods
  
  /*
   * @desc Callback function for a successful geolocation lookup; 
   * sets the locale object and calls a handler.
   * @param {Object}	The data object containing geolocation information such 
   * as latitude and longitude.
   * @return {void}
   */
  function _geoSuccess(p){
    _locale.latitude = debug ? 30.41131 + "" : p.coords.latitude + ""
    _locale.longitude = debug ? -91.827806 + "" : p.coords.longitude + ""
  }

  /*
   * @desc Callback function for a failed geolocation lookup.
   * @param {Object}	The data object containing information pertaining to 
   * the type of error from the failed attempt.
   * @return {void}
   */
  function _geoError(error){
      switch(error.code){
          case error.TIMEOUT:
              alert("Timed out attempting to get your location.  Try again.")
          break
  				default:
  					alert('Ruh-roh. Are you location settings enabled? Check your settings and try again.')
      } // end switch

  }
  
  // a bit like a constructor
  !function(){
    
    debug = options.debug || false

    // apparently a speed improvement to add known props to object
    // ahead of time
    _locale = {
      latitude: 0,
      longitude: 0
    }

    // check if offline is supported and set it. also useful for debugging on an 
    // international flight
    try{
      _offline = navigator.onLine
    }catch(e){
      _offline = options.sadPandaMessage || 
                  "unknown because of old browser" // this resolves to true, fyi
    }
    
    // init the geo params
    _maxAge = options.maxAge || 3000
    _maxTimeout = options.maxTimeout || 30000
    _isHighlyAccurate = options.isHighlyAccurate || true
    
  }()
  
  return {

    /*
     * @desc Returns locale object to outside world
     * @return {Object}
     */
    getLocale: function(){
      return _locale
    },
    /*
     * @desc Main geolocation method that finds a user's location.
     * and stashes it in the _locale variable.
     * @return {void}
     */
    getLocation: function(){
      // Get location.
    	if(!!navigator.geolocation)
    	{
    		// For testing with no wifi on the plane.
    		if(_offline){
    			_locale = {latitude: 30.97, longitude: -122.92}
    		}
    		else{
    			navigator.geolocation.getCurrentPosition(
    			  _geoSuccess, _geoError, { 
    			    maximumAge: _maxAge, 
    			    timeout: _maxTimeout, 
    			    enableHighAccuracy: _isHighlyAccurate }
    			)
    		}  // end else
    	}
    	else{
  	  
    	  // TODO: ADD ABILITY TO ENTER LOCATION THEN REVERSE GEOCODE WITH GOOGLE
    	  // MAY REQUIRE SERVERSIDE PROXY BC OF X-DOMAIN ISSUES
  	  
    	  alert(options.sadPandaMessage 
    	    || "Looks your browser can't tell us who you are. Sad Panda.")

    	} // end else inner
    }, // end getLocation()
    /*
     * @desc Simple method useful when debugging geolocation data.  Just appends
     * the lat/lon to the <body> or alerts it
     * @return {void}
     */
    showLocaleInfo: function()
    {
    	var lat = '<p>Latitude: ' + _locale.latitude + '</p>';
    	var lon = '<p>Longitude: ' + _locale.longitude + '</p>';

      // TODO: Improve this to be less alert douchey
      if(!window.jQuery){
        alert("lat: " + lat + "lon: " + lon)
      }else{
        $(document.body)
          .append(lat)
          .append(lon)
      } 
    }


  }  // end API

} // end Yayo module



$(function(){
  
  var yayo = new Yayo({debug: true})
  
  yayo.getLocation()
  
  
  
})