let flightSearchFormE1 = document.getElementById('flight-search-button');


// Get API flight quote
async function getFlightQuote(event) {
    event.preventDefault();
    // 
    let outDate = moment(document.getElementById('departure-date').value).format("YYYY-MM-DD");
    let inDate = moment(document.getElementById('return-date').value).format('YYYY-MM-DD');
    let origin = document.getElementById('origin-input').value;
    let destination = document.getElementById('destination-input').value;

    console.log({
        origin,
        destination,
        outDate,
        inDate
    });


    let url = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/${origin}-sky/${destination}-sky/${outDate}`;
    let qc = `?inboundPartialDate=${inDate}`;
    let params = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
            'x-rapidapi-key':  '1047be0014msh7da5d44202bb0e4p1ba9a6jsn68f71fe1abf0'
        },
        redirect: 'follow'
    };

    await fetch(url, params)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}


flightSearchFormE1.addEventListener("click", getFlightQuote);