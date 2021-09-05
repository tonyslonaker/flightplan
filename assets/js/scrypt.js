

// api call function 
function eventbriteAPI() {

    $.ajax( {
        api_url: 'https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=XNA4KEFKZNDI4JA7LP&redirect_uri=https://tonyslonaker.github.io/flightplan/?code=YENZAWNHDK56II2POHDS',
        method: "GET",
        Authorization: "Bearer XCNZDMHCVBBHQM7FQR3C",
        Headers: "events"
    })  
};

eventbriteAPI();