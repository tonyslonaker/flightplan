let flightSearchFormE1 = document.getElementById('flight-search-button');
let flightQuoteResultsE1 = document.getElementById('flight-quote-results');
let returnFlightQuoteResultsE1 = document.getElementById('return-flight-quote-results');
let hotelListE1 = document.getElementById('hotel-list');
let plannedTripModalE1 = document.getElementById('planned-trip-modal');
let plannedTripModalContentE1 = document.getElementById('planned-trip-modal-content-container');

// Create My Planned Trip modal content
function createMyPlannedTripModalContent() {
    let plannedTrip = getPlannedTripInformation();

    // Outbound flight html
    let outboundFlightHTML = `<p>No saved outbound flight</p>`;
    if (plannedTrip?.outboundFlight?.QuoteId) {
        outboundFlightHTML = `
            <p>Departure Date: ${moment(plannedTrip.outboundFlight.OutboundLeg).format('MM/DD/YYYY')}</p>
            <p>Carrier: ${plannedTrip.outboundFlight.carrierName}</p>
            <p>Origin: ${plannedTrip.outboundFlight.originIata}</p>
            <p>Destination: ${plannedTrip.outboundFlight.destinationIata}</p>
            <button class="button is-danger" onClick="removeSavedFlight('flight-quote-results', 'modal')">Remove Flight</button>
        `;
    }

    // Return flight html
    let returnFlightHTML = `<p>No saved return flight</p>`;
    if (plannedTrip?.returnFlight?.QuoteId) {
        returnFlightHTML = `
            <p>Departure Date: ${moment(plannedTrip.returnFlight.OutboundLeg).format('MM/DD/YYYY')}</p>
            <p>Carrier: ${plannedTrip.returnFlight.carrierName}</p>
            <p>Origin: ${plannedTrip.returnFlight.originIata}</p>
            <p>Destination: ${plannedTrip.returnFlight.destinationIata}</p>
            <button class="button is-danger" onClick="removeSavedFlight('return-flight-quote-results', 'modal')">Remove Flight</button>
        `;
    }

    // Hotel html
    let hotel = '<p>No hotel saved.</p>';
    if (plannedTrip?.hotel?.hotel_id) {
        hotel = `
            <div class="columns">
                <div class="column is-one-third">
                    <img src='${plannedTrip.hotel.max_1440_photo_url}' width="200px" />
                </div>
                <div class="column is-two-thirds">
                    <h4 class="title is-5 mb-2">${plannedTrip.hotel.hotel_name}</h5>
                    <p class="bold">Estimated Price: ${convertToCurrency(plannedTrip.hotel.price_breakdown.gross_price)}</p>
                    <button class="button is-danger mt-3" onClick="removeHotelFromLocalStorage('modal')">Remove</button>
                </div>
            </div>
        `;
    }

    
    // plannedTripModalContentE1.innerHTML = JSON.stringify(plannedTrip);
    plannedTripModalContentE1.innerHTML = `
    <div id="planned-trip-modal-content">
        <div class="planned-trip-section" id="planned-flights">
            <div class="title is-4">Flight Information</div>
            <hr />
            <div id="planned-flight-list">
                <div class="title is-5 mb-1">Outbound Flight</div>
                ${outboundFlightHTML}
                <div class="title is-5 mb-1 mt-3">Return Flight</div>
                ${returnFlightHTML}
            </div>
        </div>
        <div class="planned-trip-section" id="planned-hotel">
            <div class="title is-4 mt-4">Selected Hotel</div>
            <hr />
            <div id="planned-hotels-list">
                ${hotel}
            </div>
        </div>
    </div>
    `;
}

// Open planned trip modal
function openPlannedTripModal() {
    plannedTripModalE1.className = "modal is-active";

    // Set modal content
    createMyPlannedTripModalContent();
}

// Close planned trip modal
function closePlannedTripModal() {
    plannedTripModalE1.className = "modal";
}

// Clear planned trip from local storage
function clearPlannedTrip() {
    localStorage.removeItem('plannedTrip');
    refreshPlannedTripModal();

    // Re-render the saved flight lists
    renderFlightList(flightQuoteResultsE1, {});
    renderFlightList(returnFlightQuoteResultsE1, {});
}

// Refresh modal
function refreshPlannedTripModal() {
    // Close Modal
    closePlannedTripModal();
    // Open modal to get new dom build of planned trip content
    openPlannedTripModal();
}

// Get planned trip information from local storage
function getPlannedTripInformation() {
    const plannedTrip = JSON.parse(localStorage.getItem("plannedTrip")) || {};

    return plannedTrip;
}

// Remove saved flight
function removeSavedFlight(flightType, source) {
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

    // If source click was from My Planned Trip modal, refresh the modal
    if (source === "modal") {
        refreshPlannedTripModal();
    }

    renderFlightList(parentElement, {});
}

// Save flight information in local storage
function saveFlightData(quoteId, originId, destinationId, flightType, carrierName, originIata, destinationIata) {
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
            ...flightDetails, // Store new flight details
            carrierName,
            originIata,
            destinationIata
        }
    }));

    // Re-render flights
    renderFlightList(parentElement, {});
}

// Save returned hotels in session storage
function saveHotelDataInSession(hotels) {
    sessionStorage.setItem("hotels", JSON.stringify(hotels));
}

// Get saved hotels from session storage
function getSessionHotelData() {
    return JSON.parse(sessionStorage.getItem("hotels"));
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

// Save hotel to local storage
function saveHotelToLocalStorage(hotelId) {
    // Get planned trip from local storage
    let plannedTrip = getPlannedTripInformation();

    // Find hotel in session by provided hotelId
    let hotels = getSessionHotelData() || [];
    let hotel = {};
    // Loop through session hotels and get the correct hotel
    for (let i = 0; i < hotels.result.length; i++) {
        if (hotels.result[i].hotel_id == hotelId) {
            hotel = hotels.result[i];
        }
    }

    // update planned trip and add hotel
    localStorage.setItem("plannedTrip", JSON.stringify({
        ...plannedTrip,
        hotel
    }));

    renderHotels();
}

// Remove hotel from local storage
function removeHotelFromLocalStorage(source) {
    // Get planned trip from local storage
    let plannedTrip = getPlannedTripInformation();

    // update planned trip and remove hotel
    localStorage.setItem("plannedTrip", JSON.stringify({
        ...plannedTrip,
        hotel: {}
    }));

    renderHotels();
    if (source === "modal") {
        refreshPlannedTripModal();
    }
}

// Create hotel row
function createHotelRow(hotel) {
    // Create hotel row for parent table
    let hotelRow = document.createElement('tr');

    // Create hotel image element
    let hotelImage = document.createElement('td');
    hotelImage.innerHTML = `
        <img src=${hotel.max_1440_photo_url} width="100px"/>
    `;

    // Create hotel name element
    let hotelName = document.createElement('td');
    hotelName.innerHTML = `${hotel.hotel_name}`;

    // Create price element
    let hotelPrice = document.createElement('td');
    hotelPrice.innerHTML = `${convertToCurrency(hotel.price_breakdown.gross_price)}`;

    // Create save button
    let hotelButton = document.createElement('td');
    hotelButton.innerHTML = `
        <button class="button is-success" onClick="saveHotelToLocalStorage('${hotel.hotel_id}')">Save Hotel</button>
    `;

    // Get planned trip information
    let savedHotel = getPlannedTripInformation();
    savedHotel = savedHotel.hotel || {};
    
    // Check if this hotel is saved in local storage
    if (savedHotel?.hotel_id) {
        if (savedHotel.hotel_id == hotel.hotel_id) {
            hotelButton.innerHTML = `
                <button class="button is-danger" onClick="removeHotelFromLocalStorage()">Remove</button>
            `;
        }
    }

    // Append children
    hotelRow.appendChild(hotelImage);
    hotelRow.appendChild(hotelName);
    hotelRow.appendChild(hotelPrice);
    hotelRow.appendChild(hotelButton);

    // return hotel row
    return hotelRow;
}

// Render hotels
function renderHotels(params) {
    hotelListE1.innerHTML = "";

    let hotels = getSessionHotelData() || [];
    if (hotels?.result) {
        hotels = hotels.result;
    }
    
    let hotelTableE1 = document.createElement('table');
    hotelTableE1.className = 'table';
    let hotelTableBodyE1 = document.createElement('tbody');

    let hotelTableHeadings = document.createElement('tr');
    hotelTableHeadings.innerHTML = `
        <th>Image</th>
        <th>Hotel</th>
        <th>Price</th>
        <th></th>
    `;

    hotelTableBodyE1.appendChild(hotelTableHeadings);

    for (let i = 0; i < hotels.length; i++) {
        let hotelRow = createHotelRow(hotels[i]);
        hotelTableBodyE1.appendChild(hotelRow);
    }

    hotelTableE1.appendChild(hotelTableBodyE1);

    hotelListE1.appendChild(hotelTableE1);

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
        console.log({ error: 'Unable to determine flight type.'} );
    }

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
        console.log({ error: 'Unable to determine flight type.'} );
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
    // Check if we have saved this flight so we can render the appropriate button
    let matchedFlight = matchAgainstSavedFlights(flightType, flightDetails.QuoteId, flightDetails.OutboundLeg.OriginId, flightDetails.OutboundLeg.DestinationId);
    let button = `<button class="button is-success" id="${flightDetails.QuoteId}-${flightDetails.OutboundLeg.OriginId}-${flightDetails.OutboundLeg.DestinationId}" onClick="saveFlightData(${flightDetails.QuoteId}, ${flightDetails.OutboundLeg.OriginId}, ${flightDetails.OutboundLeg.DestinationId}, '${flightType}', '${flightDetails.carrierNameList[0]}', '${flightDetails.originPlaceDetails.IataCode}', '${flightDetails.destinationPlaceDetails.IataCode}')">Save Flight</button>`;
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
            'x-rapidapi-key':  '1047be0014msh7da5d44202bb0e4p1ba9a6jsn68f71fe1abf0'
        },
        redirect: 'follow'
    };

    return await fetch(url, params)
    .then(response => response.text())
    .then(flightQuoteResults => flightQuoteResults)
    .catch(error => console.log('error', error));
}

// Booking API - Search Location
async function searchLocationBooking(cityName) {
    let url = `https://booking-com.p.rapidapi.com/v1/hotels/locations?locale=en-us&name=${cityName}`;
    let params = {
        method: 'GET',
        // locale: 'en-us',
        // name: cityName,
        headers: {
            "x-rapidapi-host": "booking-com.p.rapidapi.com",
            "x-rapidapi-key": "1047be0014msh7da5d44202bb0e4p1ba9a6jsn68f71fe1abf0"
        }
    }

    return await fetch(url, params)
    .then(response => response.text())
    .then(locationResponseData => locationResponseData)
    .catch(error => {
        console.log(error);
    })
}

// Booking API - Search Hotels
async function searchHotelsBooking(destId, checkInDate, checkOutDate) {
    let url = `https://booking-com.p.rapidapi.com/v1/hotels/search?units=metric&order_by=popularity&checkin_date=${checkInDate}&filter_by_currency=USD&adults_number=1&checkout_date=${checkOutDate}&dest_id=${destId}&locale=en-gb&dest_type=city&room_number=1`;
    let params = {
        method: 'GET',
        headers: {
            "x-rapidapi-host": "booking-com.p.rapidapi.com",
            "x-rapidapi-key": "1047be0014msh7da5d44202bb0e4p1ba9a6jsn68f71fe1abf0"
        }
    }

    return await fetch(url, params)
    .then(result => result.text())
    .then(hotelData => hotelData)
    .catch(error => {
        console.log(error);
    })
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

    // Search Hotels

    // Step 1 - Get CityName from returned flightResults 
    let sessionFlightData = getSessionFlightData();
    let cityName = '';
    let countryName  = '';
    if (sessionFlightData?.flights?.Places) {
        for (let i = 0; i < sessionFlightData.flights.Places.length; i++ ) {
            if (sessionFlightData.flights.Places[i].IataCode.toUpperCase() == destination.toUpperCase()) {
                cityName = sessionFlightData.flights.Places[i].CityName;
                countryName = sessionFlightData.flights.Places[i].CountryName;
            }
        }
    }

    if (cityName && countryName) {
        // Step 2 - Use cityName as parameter pass into searchLocationBooking function
        let locationResult = JSON.parse(await searchLocationBooking(cityName)) || [];
        console.log(locationResult);

        // Step 3 -Get dest_id from returned response from searchLocationbooking call
        // loop through returned locations and select one
        let destId = '';
        let locationLabel = '';
        for (let i = 0; i < locationResult.length; i++) {
            console.log(`${locationResult[i].type} - ${locationResult[i].country }`);
            if (locationResult[i].type === "ci" && locationResult[i].country == countryName) {
                destId = locationResult[i].dest_id;
                locationLabel = locationResult[i].label;
            }
        } 

        console.log({
            cityName,
            countryName,
            destId,
            locationLabel
        })

        // Step 4 - Call Hotel Search with dest_id 
        if (destId) {
            let hotelResults = JSON.parse(await searchHotelsBooking(
                destId,
                departDate,
                returnDate
            ));
            console.log(hotelResults);

            // store in session storage
            saveHotelDataInSession(hotelResults);
        }

        // Step 5 - Render on front-end
        renderHotels({
            cityName,
            countryName,
            destId,
            locationLabel
        });
    }
    

}

flightSearchFormE1.addEventListener("click", searchFlightsAndEvents);