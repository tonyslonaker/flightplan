let flightSearchFormE1 = document.getElementById('flight-search-button');
let flightQuoteResultsE1 = document.getElementById('flight-quote-results');
let returnFlightQuoteResultsE1 = document.getElementById('return-flight-quote-results');
let plannedTripModalE1 = document.getElementById('planned-trip-modal');
let plannedTripModalContentE1 = document.getElementById('planned-trip-modal-content-container');

// Open planned trip modal
function openPlannedTripModal() {
    let plannedTrip = getPlannedTripInformation();

    plannedTripModalE1.className = "modal is-active";

    // plannedTripModalContentE1.innerHTML = JSON.stringify(plannedTrip);
    plannedTripModalContentE1.innerHTML = `
    <div id="planned-trip-modal-content">
        <div class="planned-trip-section" id="planned-flights">
            <div class="title is-4">Flight Information</div>
            <hr />
            <div id="planned-flight-list">
                <div class="title is-5">Outbound Flight</div>
                <p>${JSON.stringify(plannedTrip.outboundFlight)}</p>
                <div class="title is-5">Return Flight</div>
                <p>${JSON.stringify(plannedTrip.returnFlight)}</p>
            </div>
        </div>
        <div class="planned-trip-section" id="planned-events">
            <div class="title is-4">Planned Events</div>
            <hr />
            <div id="planned-event-list">
                <p>Display saved events here....</p>
            </div>
        </div>
    </div>
    `;

}

// Clear planned trip from local storage
function clearPlannedTrip() {
    localStorage.removeItem('plannedTrip');
}

// Close planned trip modal
function closePlannedTripModal() {
    plannedTripModalE1.className = "modal";
}

// Get planned trip information from local storage
function getPlannedTripInformation() {
    const plannedTrip = JSON.parse(localStorage.getItem("plannedTrip")) || {};

    return plannedTrip;
}

// Remove saved flight
function removeSavedFlight(flightType) {
    let plannedTrip = getPlannedTripInformation();
    let parentElement;

    if (flightType === "flight-quote-results") {
        flightType = "outboundFlight";
        parentElement = flightQuoteResultsE1;
    } else if (flightType === "return-flight-quote-results") {
        flightType = "returnFlight";
        parentElement = returnFlightQuoteResultsE1;
    } else {
        console.log({ error: "Unable to remove saved flight." })
        return;
    }

    // update saved flight to empty object depending on the flight type
    localStorage.setItem("plannedTrip", JSON.stringify({
        ...plannedTrip,
        [flightType]: {}
    }));

    renderFlightList(parentElement, {});
}

// Save flight information in local storage
function saveFlightData(quoteId, originId, destinationId, flightType) {
    // alert(JSON.stringify({
    //     quoteId, 
    //     originId,
    //     destinationId
    // }));

    // Get flight information from session storage
    let storedSessionFlights = JSON.parse(sessionStorage.getItem('returnedFlights')) || {};

    console.log('Session Flights: ', storedSessionFlights);

    // Check if session flights are returned. If not, we need to alert the user
    if (!storedSessionFlights) {
        // alert('Unable to save flight data. 1'); // Take out after testing
        console.log({ error: "No session flights were found." });
        // TODO: Somehow alert the user that we were unable to save the flight
        //
        //
        return;
    }

    let flightDetails = {};


    if (flightType === "flight-quote-results") {
        flightType = "outboundFlight";
        parentElement = flightQuoteResultsE1;
        // Loop through outbound flights and determine if we have a match
        for (let i = 0; i < storedSessionFlights.flights.Quotes.length; i++) {
            if (quoteId === storedSessionFlights.flights.Quotes[i].QuoteId &&
                originId === storedSessionFlights.flights.Quotes[i].OutboundLeg.OriginId &&
                destinationId === storedSessionFlights.flights.Quotes[i].OutboundLeg.DestinationId) {
                flightDetails = storedSessionFlights.flights.Quotes[i];
            }
        }
    } else if (flightType === "return-flight-quote-results") {
        flightType = "returnFlight";
        parentElement = returnFlightQuoteResultsE1;

        // Loop through return flights and determine if we have a match
        for (let i = 0; i < storedSessionFlights.returnFlights.Quotes.length; i++) {
            if (quoteId === storedSessionFlights.returnFlights.Quotes[i].QuoteId &&
                originId === storedSessionFlights.returnFlights.Quotes[i].OutboundLeg.OriginId &&
                destinationId === storedSessionFlights.returnFlights.Quotes[i].OutboundLeg.DestinationId) {
                flightDetails = storedSessionFlights.returnFlights.Quotes[i]
            }
        }
    } else {
        console.log({ error: "Unable to save flight." })
        return;
    }

    // Verify that we did get a flight match
    if (!flightType || !flightDetails?.QuoteId) {
        // alert('Unable to save flight data. 2'); // Take out after testing
        console.log({ error: "No session flights were found." });
        // TODO: Somehow alert the user that we were unable to save the flight
        //
        //
        return;
    }

    // Save flight information in corresponding flight type object
    let plannedTrip = getPlannedTripInformation();
    localStorage.setItem("plannedTrip", JSON.stringify({
        ...plannedTrip,
        [flightType]: {
            ...flightDetails // Store new flight details
        }
    }));

    // Re-render flights
    renderFlightList(parentElement, {});
}

// Get Saved Flight Data in Session Storage
function getSessionFlightData() {
    return JSON.parse(sessionStorage.getItem("returnedFlights"));
}

// Save Returned Flight Data in Session Storage
function saveReturnedFlightData(flights, returnFlights) {
    sessionStorage.setItem("returnedFlights", JSON.stringify({
        flights,
        returnFlights
    }));
}

// Render flights
function renderFlightList(parentElement, searchParams) {
    // set the innerHTML for the current container to nothing.
    parentElement.innerHTML = "";

    // Get stored session flights flights: {flights, returnedFlights}
    let flights = getSessionFlightData();

    // Determine which type we want to render - Outbound/Return flights
    if (parentElement.id == "flight-quote-results") {
        // Get outbound flights
        flights = flights.flights;
    } else if (parentElement.id == "return-flight-quote-results") {
        // Get return flights
        flights = flights.returnFlights;
    } else {
        console.log({ error: 'Unable to determine flight type.' });
    }

    // Create flight quote details headings div
    // let flightQuoteDetailsHeader = document.createElement('div');
    // flightQuoteDetailsHeader.innerHTML = `
    //         <h3>${searchParams.origin} -> ${searchParams.destination}</h3>
    //     `;
    // flightQuoteDetailsHeader.innerHTML = '';

    // Create div element for flight list
    let flightList = document.createElement("div");
    flightList.className = "flight-list";

    // Check if flights have quotes array
    if (flights?.Quotes) {
        for (let i = 0; i < flights.Quotes.length; i++) {

            // loop through quote carrier IDs and get a resolve to carrier names
            let carrierNameList = [];
            if (flights.Quotes[i]?.OutboundLeg?.CarrierIds) {
                for (let c = 0; c < flights.Quotes[i].OutboundLeg.CarrierIds.length; c++) {
                    // loop through carrier list and get the name
                    for (let x = 0; x < flights.Carriers.length; x++) {
                        if (flights.Quotes[i].OutboundLeg.CarrierIds[c] === flights.Carriers[x].CarrierId) {
                            carrierNameList.push(flights.Carriers[x].Name);
                        }
                    }
                }
            }

            // Loop through places and return place information
            let originPlaceDetails = {};
            let destinationPlaceDetails = {};

            if (flights?.Places) {
                for (let p = 0; p < flights.Places.length; p++) {
                    // Resolve origin place information
                    if (flights.Places[p].PlaceId === flights.Quotes[i].OutboundLeg.OriginId) {
                        originPlaceDetails = flights.Places[p];
                    }

                    // Resolve destination place information
                    if (flights.Places[p].PlaceId === flights.Quotes[i].OutboundLeg.DestinationId) {
                        destinationPlaceDetails = flights.Places[p];
                    }
                }
            }

            // Create flightDetails object to pass to compileFlightQuoteCard
            let flightDetails = {
                ...flights.Quotes[i],
                carrierNameList,
                originPlaceDetails,
                destinationPlaceDetails,
                searchParams
            };

            // Compile the flight quote card html
            let quoteCard = compileFlightQuoteCard(flightDetails, parentElement.id);
            flightList.appendChild(quoteCard);
        }
    } else {
        console.log('flights.Quotes did not exist.', flights);
        flightList.innerHTML = `
            <p>No flights found</p>
        `;
    }

    // Append the flight quote details headings
    // parentElement.appendChild(flightQuoteDetailsHeader);
    // Append the list of flight quote cards
    parentElement.appendChild(flightList);
}

// Convert to currency
function convertToCurrency(num) {
    return `$${num}`;
}

// Match saved flights to session flights
function matchAgainstSavedFlights(flightType, quoteId, originId, destinationId) {
    let plannedTrip = getPlannedTripInformation();
    let flightDetails;
    let match = false;

    // Determine what the type is and get the planned flight details for that type
    if (flightType == "flight-quote-results") {
        // Get outbound flight details
        flightDetails = plannedTrip.outboundFlight;
    } else if (flightType == "return-flight-quote-results") {
        // Get return flight details
        flightDetails = plannedTrip.returnFlight;
    } else {
        console.log({ error: 'Unable to determine flight type.' });
        return match;
    }

    // If nothing is stored, return false
    if (!flightDetails?.QuoteId) {
        return match;
    }

    // Check if it is a match
    if (flightDetails.QuoteId === quoteId &&
        flightDetails.OutboundLeg.OriginId === originId &&
        flightDetails.OutboundLeg.DestinationId === destinationId) {
        match = true;
    }

    return match;
}

// Compile Flight Quote Card
function compileFlightQuoteCard(flightDetails, flightType) {
    // Check if we have saved this flight
    let matchedFlight = matchAgainstSavedFlights(flightType, flightDetails.QuoteId, flightDetails.OutboundLeg.OriginId, flightDetails.OutboundLeg.DestinationId);
    let button = `<button class="button is-success" id="${flightDetails.QuoteId}-${flightDetails.OutboundLeg.OriginId}-${flightDetails.OutboundLeg.DestinationId}" onClick="saveFlightData(${flightDetails.QuoteId}, ${flightDetails.OutboundLeg.OriginId}, ${flightDetails.OutboundLeg.DestinationId}, '${flightType}')">Save Flight</button>`;
    if (matchedFlight) {
        button = `<button class="button is-danger" id="${flightDetails.QuoteId}-${flightDetails.OutboundLeg.OriginId}-${flightDetails.OutboundLeg.DestinationId}" onClick="removeSavedFlight('${flightType}')">Remove Saved Flight</button>`;
    }

    // alert(JSON.stringify(flightDetails.carrierNameList));
    let quoteCard = document.createElement("div");
    quoteCard.className = "card flight-quote-card";
    quoteCard.innerHTML = `
        <div class="card-content">
            <div class="content">
                <h2>${flightDetails.originPlaceDetails.IataCode} > ${flightDetails.destinationPlaceDetails.IataCode}</h2>
                <h4>${flightDetails.carrierNameList[0]}</h4>
                <hr />
                <p>Flight Origin: ${flightDetails.originPlaceDetails.CityName} (${flightDetails.originPlaceDetails.IataCode})</p>
                <p>Flight Destination: ${flightDetails.destinationPlaceDetails.CityName} (${flightDetails.destinationPlaceDetails.IataCode})</p>
                <p>Departure Date: ${moment(flightDetails.OutboundLeg.DepartureDate).format('MM/DD/YYYY H:mm')}</p>
                <p>Direct Flight: ${flightDetails.Direct}</p>
                <p>Min. Price: ${convertToCurrency(flightDetails.MinPrice)}</p>
                ${button}
            </div>
        </div>
    `;
    return quoteCard;
}

// Call Flight Quote API
async function callSkyScannerAPI(origin, destination, takeOffDate) {
    let url = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/${origin}-sky/${destination}-sky/${takeOffDate}`;
    // let qc = `?inboundPartialDate=${inDate}`;
    let params = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
            'x-rapidapi-key': '1047be0014msh7da5d44202bb0e4p1ba9a6jsn68f71fe1abf0'
        },
        redirect: 'follow'
    };

    return await fetch(url, params)
        .then(response => response.text())
        .then(flightQuoteResults => flightQuoteResults)
        .catch(error => console.log('error', error));
}

// Search flights and events
async function searchFlightsAndEvents(event) {
    event.preventDefault();

    // Get user form search data
    let departDate = moment(document.getElementById('departure-date').value).format("YYYY-MM-DD");
    let returnDate = moment(document.getElementById('return-date').value).format('YYYY-MM-DD');
    let origin = document.getElementById('origin-input').value;
    let destination = document.getElementById('destination-input').value;

    // First flight search - From origin to destination
    let flightResults = await callSkyScannerAPI(origin, destination, departDate);

    // Second flight search - From destination back to origin
    let returnFlightResults = await callSkyScannerAPI(destination, origin, returnDate);

    // Save flights in session storage
    saveReturnedFlightData(JSON.parse(flightResults), JSON.parse(returnFlightResults));

    // Create searchParams object to pass into render function
    let searchParams = {
        origin,
        destination,
        departDate,
        returnDate
    }

    // Render outbound flights on UI
    renderFlightList(flightQuoteResultsE1, searchParams);

    // Render return flights on UI
    renderFlightList(returnFlightQuoteResultsE1, searchParams);

    // Search Hotels?

}

async function callHotelApi() {

    fetch("https://booking-com.p.rapidapi.com/v1/hotels/search?units=metric&order_by=popularity&checkin_date=2021-11-25&filter_by_currency=AED&adults_number=2&checkout_date=2021-11-26&dest_id=-553173&locale=en-gb&dest_type=city&room_number=1&children_ages=5%2C0&page_number=0&categories_filter_ids=facility%3A%3A107%2Cfree_cancellation%3A%3A1&children_number=2", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "booking-com.p.rapidapi.com",
            "x-rapidapi-key": "985c5a5a52msh5e525b5f3d5f2adp1c9239jsn6cfdc252f604"
        }
    })
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.error(err);
        });

}

flightSearchFormE1.addEventListener("click", searchFlightsAndEvents);