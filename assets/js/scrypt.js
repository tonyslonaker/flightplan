

// api call function 
function eventbriteAPI() {

    var queryURL = "https://www.eventbrite.com/oauth/authorize?";

    $.ajax( {
        url: queryURL,
        method: "GET",
        beforeSend: function (request) {
            request.withCredentials = true;
            request.setRequestHeader("Authorization", "Bearer YENZAWNHDK56II2POHDS");
        },
    })  
};


eventbriteAPI()