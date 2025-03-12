
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
            let response = await fetch(`/.functions/apiCalls?type=halfCall&state=${state}&country=${country}`);
            responsed = response;
        }
        else{

            responsed = response;
            let response = await fetch(`/.functions/apiCalls?type=fullCall&city=${city}&state=${state}&country=${country}`);
            responsed = response;
        }
        let data = await responsed.json();
        if (data.length === 0){
            document.querySelector('.dialogErrors').textContent = `no info for ${city} place`;
            return;
        }
        latitude = data[0].lat; //latitude
        longitude = data[0].lon;    //longitude
        fullName = data[0].name;    //full name of the city
        stateConfirm = data[0].state;   //the state confirmation

        foreCast(latitude, longitude, timestamp, id = "getLonLat", fullName, stateConfirm, country);//getting wether condition as per cordinates
    } catch (error) {
        document.querySelector('.dialogErrors').textContent = error.message;
    }
}

//fetching weather info based on user input: country, state, city and time and date.
async function foreCast(lat, lon, timestamp, id, fullName, stateConfirm, country){
    try {
        //a GET API request to get weather condition
        
        let response = await fetch(`/.functions/apiCalls?type=viaTimestamp&lat=${lat}&lon=${lon}&timestamp=${timestamp}`);//weather condition via timestamp

        let response2 = await fetch(`/.functions/apiCalls?type=reverse&lat=${lat}&lon=${lon}`);//geocoding to get name of country via cordinates
        let response3 = await fetch(`/.functions/apiCalls?type=oneCall&lat=${lat}&lon=${lon}`);//to get the next 8 days weather condition

        let JsonData = await response.json(); //conversion of response to json (current weather condition using timemstamp)
        let JsonData2 = await response2.json();//conversion of geocoding response2 to json to get the state
        let JsonData3 = await response3.json();// conversion of response with aim for next 8 days
        
        let sunrise = JsonData.data[0].sunrise;
        let sunset = JsonData.data[0].sunset;
        const sunriseReadable = (new Date(sunrise * 1000)).toLocaleTimeString();
        const sunsetReadable = (new Date(sunset * 1000)).toLocaleTimeString();

        let currentData = JsonData.data[0];//getting the object and extracting the first element of the object
        const iconUrl = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;//open weather map url for icon
        container4next8DaysWeather = document.querySelector('.n8days');//grabbing of the containers which holds the 8days weather condition
        let NextFourdays = JsonData3.daily;//grabbing the next 8 days timestamp from response

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
       
        let currentData2 = JsonData2[0];
        let countryName = currentData2.country;

        let currentTempCelscius = (currentData.temp - 273.15).toFixed(2); //converting kelvin temperature to degree celcius
        let currentFeelLikeTempCelscius = (currentData.feels_like - 273.15).toFixed(2);//converting kelvin temperature to degree celcius
        let currentTime = new Date(currentData.dt * 1000).toLocaleTimeString(); //converting unix timestamp to current time
        let currentDate = new Date(currentData.dt * 1000).toLocaleDateString(); //converting unix timestamp to current date

         if (id === "UCADCW"){
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
            document.querySelector('.hptemp').textContent = currentTempCelscius;
            document.querySelector('.weatherRsolve').textContent =  `${currentData.weather[0].main}`;
            document.querySelector('.hpOverly').textContent = `${currentData.weather[0].description}`;
            document.querySelector('.sunrise').textContent = `sunrise: ${sunriseReadable}`;
            document.querySelector('.sunset').textContent = `sunset: ${sunsetReadable}`;
            document.querySelector('.humidity').textContent = `humidity: ${currentData.humidity}`;
        }

         if (id === "getLonLat"){ //function for form
            document.querySelector('.spinner7').classList.add('NoDisplay');
            document.querySelector('.tempSup').textContent = `${currentTempCelscius}`;
            document.querySelector('.countryInDialogspecific').textContent = country;
            document.querySelector('.akaSpecific').textContent = fullName;
            document.querySelector('.stateInDialogSpecific').textContent = stateConfirm;
            document.querySelector('.weatherIcon').src = iconUrl;
            document.querySelector('.weatherMain').textContent = `${currentData.weather[0].main}`;
            document.querySelector('.describe').textContent = `${currentData.weather[0].description}`;
            document.querySelector('.feels').textContent = `the temperature feels like ${currentFeelLikeTempCelscius}`;
            
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