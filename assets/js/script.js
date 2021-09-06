let flightSearchFormE1 = document.getElementById('flight-search-button');
let flightQuoteResultsE1 = document.getElementById('flight-quote-results');
let returnFlightQuoteResultsE1 = document.getElementById('return-flight-quote-results');

// Get planned trip information from local storage
function getPlannedTripInformation() {
    const plannedTrip = JSON.parse(localStorage.getItem("plannedTrip")) || {};

    return plannedTrip;
}

// Save Flight Information
function saveFlightData(quoteId, originId, destinationId) {
    alert(JSON.stringify({
        quoteId, 
        originId,
        destinationId
    }));

    // Get flight information from session storage
    let storedSessionFlights = JSON.parse(sessionStorage.getItem('returnedFlights')) || {};

    console.log('Session Flights: ', storedSessionFlights);

    // Check if session flights are returned. If not, we need to alert the user
    if (!storedSessionFlights) {
        alert('Unable to save flight data. 1'); // Take out after testing
        console.log({ error: "No session flights were found." });
        // TODO: Somehow alert the user that we were unable to save the flight
        //
        //
        return;
    }
    let flightType;
    let flightDetails = {};

    // Loop through outbound flights and determine if we have a match
    for (let i = 0; i < storedSessionFlights.flights.Quotes.length; i++) {
        if (quoteId === storedSessionFlights.flights.Quotes[i].QuoteId && 
            originId === storedSessionFlights.flights.Quotes[i].OutboundLeg.OriginId && 
            destinationId === storedSessionFlights.flights.Quotes[i].OutboundLeg.DestinationId) {
                flightType = "outboundFlight";
                flightDetails = storedSessionFlights.flights.Quotes[i];
            }
    }

    // Loop through return flights and determine if we have a match
    for (let i = 0; i < storedSessionFlights.returnFlights.Quotes.length; i++) {
        if (quoteId === storedSessionFlights.returnFlights.Quotes[i].QuoteId && 
            originId === storedSessionFlights.returnFlights.Quotes[i].OutboundLeg.OriginId && 
            destinationId === storedSessionFlights.returnFlights.Quotes[i].OutboundLeg.DestinationId) {
                flightType = "returnFlight";
                flightDetails = storedSessionFlights.flights.Quotes[i]
            }
    }

    // Verify that we did get a flight match
    if (!flightType || !flightDetails?.QuoteId) {
        alert('Unable to save flight data. 2'); // Take out after testing
        console.log({ error: "No session flights were found." });
        // TODO: Somehow alert the user that we were unable to save the flight
        //
        //
        return;
    }

    // Save flight information in corresponding flight type object
    let plannedTrip = JSON.parse(localStorage.getItem("plannedTrip")) || {};
    localStorage.setItem("plannedTrip", JSON.stringify({
        ...plannedTrip,
        [flightType]: {
            ...flightDetails // Store new flight details
        }
    }));
}

// Save Returned Flight Data in Session Storage
function saveReturnedFlightData(flights, returnFlights) {
    sessionStorage.setItem("returnedFlights", JSON.stringify({
        flights, 
        returnFlights
    }));
}

// Render flights
function renderFlightList(parentElement, flights, searchParams) {
    // set the innerHTML for the current container to nothing.
    parentElement.innerHTML = "";

    // Create flight quote details headings div
    let flightQuoteDetailsHeader = document.createElement('div');
    flightQuoteDetailsHeader.innerHTML = `
            <h2>Flight Quote Results</h2>
            <h3>${searchParams.origin} -> ${searchParams.destination}</h3>
        `;

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
            let quoteCard = compileFlightQuoteCard(flightDetails);
            flightList.appendChild(quoteCard);
        }
    } else {
        console.log('flights.Quotes did not exist.', flights);
        flightList.innerHTML = `
            <p>No flights found</p>
        `;
    }

    // Append the flight quote details headings
    parentElement.appendChild(flightQuoteDetailsHeader);
    // Append the list of flight quote cards
    parentElement.appendChild(flightList);
}

// Convert to currency
function convertToCurrency(num) {
    return `$${num}`;
}

// Compile Flight Quote Card
function compileFlightQuoteCard(flightDetails) {
    // alert(JSON.stringify(flightDetails.carrierNameList));
    let quoteCard = document.createElement("div");
    quoteCard.className = "card flight-quote-card";
    quoteCard.innerHTML = `
        <div class="card-content">
            <div class="content">
                <h2>${flightDetails.searchParams.origin} > ${flightDetails.searchParams.destination}</h2>
                <h4>${flightDetails.carrierNameList[0]}</h4>
                <hr />
                <p>Flight Origin: ${flightDetails.originPlaceDetails.CityName} (${flightDetails.originPlaceDetails.IataCode})</p>
                <p>Flight Destination: ${flightDetails.destinationPlaceDetails.CityName} (${flightDetails.destinationPlaceDetails.IataCode})</p>
                <p>Departure Date: ${moment(flightDetails.OutboundLeg.DepartureDate).format('MM/DD/YYYY H:mm')}</p>
                <p>Direct Flight: ${flightDetails.Direct}</p>
                <p>Min. Price: ${convertToCurrency(flightDetails.MinPrice)}</p>
                <button id="${flightDetails.QuoteId}-${flightDetails.OutboundLeg.OriginId}-${flightDetails.OutboundLeg.DestinationId}" onClick="saveFlightData(${flightDetails.QuoteId}, ${flightDetails.OutboundLeg.OriginId}, ${flightDetails.OutboundLeg.DestinationId})">Save Flight</button>
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
            'x-rapidapi-key':  '1047be0014msh7da5d44202bb0e4p1ba9a6jsn68f71fe1abf0'
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
    renderFlightList(flightQuoteResultsE1, JSON.parse(flightResults), {
        origin,
        destination,
        departDate,
        returnDate
    });

    // Second flight search - From destination back to origin
    let returnFlightResults = await callSkyScannerAPI(destination, origin, returnDate);
    renderFlightList(returnFlightQuoteResultsE1, JSON.parse(returnFlightResults), {
        origin,
        destination,
        departDate,
        returnDate
    });

    // Save flights in session storage
    saveReturnedFlightData(JSON.parse(flightResults), JSON.parse(returnFlightResults));

    // Search Events? 
    //
    //
}

flightSearchFormE1.addEventListener("click", searchFlightsAndEvents);