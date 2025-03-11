const fetch = require(node-fetch);

exports.handler = async function(event){
    const apiKey = process.env.MY_API_KEY;
    const type = params.type;//full call or half call
    try {
        let url;
        if (type === "halfCall"){
            const state = event.queryStringParameters.state;
            const country= event.queryStringParameters.country;
            url = `http://api.openweathermap.org/geo/1.0/direct?q=${state},${country}&limit=${1}&appid=${apiKey}`;
        }
        if (type == "fullCall"){
            const city = event.queryStringParameters.city;
            const state = event.queryStringParameters.state;
            const country= event.queryStringParameters.country;
            url = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=${1}&appid=${apiKey}`;
        }
        if (type == "viaTimestamp"){
            const lat = event.queryStringParameters.lat;
            const lon = event.queryStringParameters.lon;
            const timestamp= event.queryStringParameters.timestamp;
            url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${apiKey}`;
        }
        if (type == "reverse"){
            const lat = event.queryStringParameters.lat;
            const lon = event.queryStringParameters.lon;
            const timestamp= event.queryStringParameters.timemstamp;
            url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        }
        if (type == "oneCall"){
            const lat = event.queryStringParameters.lat;
            const lon = event.queryStringParameters.lon;
            url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        }

        const response = await fetch(url);
        const data = response.json();
        return{
            statusCode: 200,
            body:JSON.stringify(data)
        };
    } catch (error) {
        return{
            statusCode: 500,
            body:JSON.stringify('error fetching data')
        };
    }

};