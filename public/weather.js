
let apiKey = '29fafbb65de324096de026a5b5b0416c';

//this function fetches and loads countries
async function loadCountries() {
    try {
        let response = await fetch("https://restcountries.com/v3.1/all");
        let countries = await response.json();

        // Sort countries alphabetically by common name
        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

        let countrySelect = document.querySelector(".country");

        countries.forEach(country => {
            let option = document.createElement("option");
           // option.style.backgroundColor = "black";
            option.value = country.name.common;
            option.textContent = country.name.common; // Country name
            countrySelect.appendChild(option);
        });
    } catch (error) {
        document.querySelector('.message').textContent = error.message;
    }
}

//This function gets the current time and date and displays it to default UI (immediately he logs in to the app)
function currentTime(){
    time = new Date()
    //console.log(time.toLocaleDateString());
    const timeString = time.toLocaleTimeString();
    const dateString = time.toLocaleDateString();
    document.querySelector('.currentDateTime').innerHTML = `<h3>${timeString} | <span style="font-size:small">${dateString}</span><h3>  `;

}

//This asks for access to a user location and on access it gets the cordinates and passes it  to foreCast()
//and aslo converts the current time to UNIX timestamp
function getUserCordinatesAndDisplayCurrentWeather(){
    if (navigator.geolocation){
        const currentDate = new Date();// Get the current date and time
        const timestamp = Math.floor(currentDate.getTime() / 1000);// Convert to Unix timestamp (in seconds)
        navigator.geolocation.getCurrentPosition((position)=>{
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            foreCast(lat, lon, timestamp, id = "UCADCW", fullName = "", stateConfirm = "", country = "");//get current user weather condition and display icon and temperature
        })
    }
}

//code is run immediately app is launched
setInterval(currentTime, 1000);
getUserCordinatesAndDisplayCurrentWeather();
loadCountries();

//getting form data and submitting
let form = document.querySelector('.myForm');
form.addEventListener("submit", (event)=>{
    event.preventDefault();
    let country = event.target.country.value;//users input country
    let state = event.target.state.value;//users input state
    let city = event.target.city.value;//users input city
    let dateTime = event.target.DateTime.value; //users input date
    let isoDateTime =  `${dateTime}:00Z`; //date in iso format by adding :00Z at the end
    let specificDateToTimestampObject = new Date(isoDateTime); //creating a new date object
    let timestamp = Math.floor(specificDateToTimestampObject.getTime() / 1000);//time converted to unix timestamp
    openModal(); //modal opens up for displaying of results
    if (!city){
        getLonLat(country, state, city = "", timestamp)
        //countryState(state, country);
    }
    else if (city && state && country && dateTime){
        getLonLat(country, state, city, timestamp);
        //countryStateCity(country, state, city);
    }
})

//getting the longitute and latitude cordinates of user input after which the cordinates is passed to forecast() to get the weather condition
async function getLonLat(country, state, city, timestamp){
    try {
        let responsed;
        let latitude;
        let longitude;
        let fullName;
        let stateConfirm;

        if (!city){
            let response = await fetch(`/.netlify/functions/apiCalls`, {
                method:'POST',
                body:JSON.stringify({
                    country:country, 
                    state:state,
                    type:'halfCall'
                })
            });
            responsed = response;
        }
        else{
            //responsed = response; ?type=fullCall&city=${city}&state=${state}&country=${country}`
            let response = await fetch('/.netlify/functions/apiCalls', {
                method:'POST',
                body:JSON.stringify({country:country, state:state, city:city, timestamp:timestamp, type:'fullCall'})
            });
            responsed = response;
        }
        //.................................
        let data = await responsed.json();
        //data = JSON.stringify(data);

        if (!data || data.length === 0){
            document.querySelector('.dialogErrors').textContent = `no info for ${city} place`;
            return;
        }

        latitude = data.data[0].lat; //latitude
        longitude = data.data[0].lon;    //longitude
        fullName = data.data[0].name;    //full name of the city
        stateConfirm = data.data[0].state;   //the state confirmation

        //console.log(data);
        console.log(latitude, longitude, fullName, stateConfirm);
        //console.log(data);
       foreCast(latitude, longitude, timestamp, id = "getLonLat", fullName, stateConfirm, country);//getting wether condition as per cordinates
    } catch (error) {
        document.querySelector('.dialogErrors').textContent = error.message;
    }
}

//fetching weather info based on user input: country, state, city and time and date.
async function foreCast(lat, lon, timestamp, id, fullName, stateConfirm, country){
    try {


        if (id === "getLonLat"){ //function for form

            //a GET API request to get weather condition
        let response = await fetch('/.netlify/functions/apiCalls', {
            method:'POST',
            body:JSON.stringify({lat:lat, lon:lon, timestamp:timestamp, type:'viaTimestamp'})
        });//weather condition via timestamp

        let JsonData = await response.json(); //conversion of response to json (current weather condition using timemstamp)
        let temperature = JsonData.data.data[0].temp; 
        let feelsLike = JsonData.data.data[0].feels_like;
        let weatherMain = JsonData.data.data[0].weather[0].main; //what weather is
        let weatherMainDesc = JsonData.data.data[0].weather[0].description; //description
        let weatherMainIcon = JsonData.data.data[0].weather[0].icon; //weather icon
        let feelsLikeTempCelscius = (feelsLike - 273.15).toFixed(2); //converting kelvin temperature to degree celcius
        let currentTempCelscius = (temperature - 273.15).toFixed(2); //converting kelvin temperature to degree celcius
        const iconUrl = `https://openweathermap.org/img/wn/${weatherMainIcon}@2x.png`;//open weather map url for icon

            document.querySelector('.spinner7').classList.add('NoDisplay');
            document.querySelector('.tempSup').textContent = `${currentTempCelscius }`;
            document.querySelector('.countryInDialogspecific').textContent = country;
            document.querySelector('.akaSpecific').textContent = fullName;
            document.querySelector('.stateInDialogSpecific').textContent = stateConfirm;
            document.querySelector('.weatherIcon').src = iconUrl;
            document.querySelector('.weatherMain').textContent = `${weatherMain}`;
            document.querySelector('.describe').textContent = `${weatherMainDesc}`;
            document.querySelector('.feels').textContent = `the temperature feels like ${feelsLikeTempCelscius}`;
           
        }
        
        if (id === "UCADCW"){
                let response2 = await fetch('/.netlify/functions/apiCalls',  {
                method:'POST',
                body:JSON.stringify({lat:lat, lon:lon, type:'reverse'})
            });//geocoding to get name of country via cordinates

            let response3 = await fetch('/.netlify/functions/apiCalls',  {
                method:'POST',
                body:JSON.stringify({lat:lat, lon:lon, type:'oneCall'})
            });//to get the next 8 days weather condition and current weather condition

            let JsonData2 = await response2.json();//conversion of geocoding response2 to json to get the state
            let JsonData3 = await response3.json();// conversion of response with aim for next 8 days and current weather condition

            //console.log(JsonData2);
            console.log("......................................")
            console.log(JsonData3.data.daily);

            let currentWeatherIcon = JsonData3.data.current.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`;//open weather map url for icon
            let countryName = JsonData3.data.timezone;
            let currentTempCelcius = (JsonData3.data.current.temp - 273.15).toFixed(2); //converting kelvin temperature to degree celcius
            let weatherMain = JsonData3.data.current.weather[0].main;
            let weatherDesc = JsonData3.data.current.weather[0].description;
            let humidity = JsonData3.data.current.humidity;

            let sunrise = JsonData3.data.current.sunrise;
            let sunset = JsonData3.data.current.sunset;

            const sunriseReadable = (new Date(sunrise * 1000)).toLocaleTimeString();
            const sunsetReadable = (new Date(sunset * 1000)).toLocaleTimeString();
            //let feelsLikeTempCelcius = (JsonData3.data.current.feels_like - 273.15).toFixed(2); //converting kelvin temperature to degree celcius

            document.querySelector('.spinner').classList.add('NoDisplay');
            document.querySelector('.spinner2').classList.add('NoDisplay');
            document.querySelector('.spinner3').classList.add('NoDisplay');
            document.querySelector('.spinner4').classList.add('NoDisplay');
            document.querySelector('.spinner5').classList.add('NoDisplay');
            document.querySelector('.conditionIcon').src = iconUrl;   //displating the current weather to default UI (immediately user logs in)
            document.querySelector('.hpIdivCountry').textContent = countryName;
            document.querySelector('.hpstate').textContent = `longitude: ${lon.toFixed(3)}`;
            document.querySelector('.hpstateLat').textContent = `latitude: ${lat.toFixed(3)}`;
            document.querySelector('.conditionIcon').src = iconUrl;
            document.querySelector('.hptemp').textContent = currentTempCelcius;
            document.querySelector('.weatherRsolve').textContent =  weatherMain;
            document.querySelector('.hpOverly').textContent = weatherDesc;
            document.querySelector('.sunrise').textContent = `sunrise: ${sunriseReadable}`;
            document.querySelector('.sunset').textContent = `sunset: ${sunsetReadable}`;
            document.querySelector('.humidity').textContent = `humidity: ${humidity}`;

            container4next8DaysWeather = document.querySelector('.n8days');//grabbing of the containers which holds the 8days weather condition
            let NextFourdays = JsonData3.data.daily;//grabbing the next 8 days timestamp from response
            //converting each timestamp to corresponding readable format, getting temperature and icon for each day. and then dynamically populating in the frontend
            NextFourdays.forEach(element => {
                let timestamp = element.dt;
                let temperature = element.temp.day;
                let icon = element.weather[0].icon;
                const currentDate = (new Date(timestamp * 1000)).toLocaleDateString("en-uS", {weekday:"short"});
                temperature = (temperature - 273.15).toFixed(2);
                const newDiv = document.createElement("div");
                const img = document.createElement("img");
                const sup = document.createElement("sup"); 
                const date = document.createElement("small");
                img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;//open weather url for icon
                img.width = "100";
                sup.textContent = temperature;
                date.textContent = currentDate;

                newDiv.appendChild(img);
                newDiv.appendChild(sup);
                newDiv.appendChild(date);
                container4next8DaysWeather.appendChild(newDiv);
            });
            container4next8DaysWeather.style.opacity = "70" + "%";
        }
           } catch (error) {
            document.querySelector('.dialogErrors').textContent = error.message;
    }
}

//function for opening modal for weather info display
function openModal(){
    let modal = document.querySelector('.infoDialog');
    const spinner = document.querySelector('.spinner7');
    const weatherDataElements = document.querySelectorAll('.infos .countryInDialogspecific, .infos .stateInDialogSpecific, .infos .akaSpecific, .infos .weatherMain, .weatherIcon, .tempSup, .describe, .feels');

    // Clear previous results
    weatherDataElements.forEach(element => {
        element.textContent = ""; // Clear text content
        if (element.tagName === 'IMG') {
            element.src = ""; // Clear image source
        }
    });
    //SHOW MODAL AND SHOW SPINNER
    modal.showModal();
    clearErrorScreen();
    document.querySelector('.spinner7').classList.remove('NoDisplay');
}

//function for closing modal for weather info display
function closeModal(){
    let modal = document.querySelector('.infoDialog');
    modal.close();
}
function formOut(){
    let form = document.querySelector('.myForm');
    let home = document.querySelector('.containerForDefaultWatherCondition');
    home.style.display = 'none';
    form.style.display = 'block';
}
function home(){
    let form = document.querySelector('.myForm');
    let home = document.querySelector('.containerForDefaultWatherCondition');
    home.style.display = 'block';
    form.style.display = 'none';
}
function clearErrorScreen(){
    dialogerros = document.querySelector('.dialogErrors').textContent = "";
}