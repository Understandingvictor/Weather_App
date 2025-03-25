import fetch from 'node-fetch'

export const handler  = async function(event, context){
    //let apiKey = '29fafbb65de324096de026a5b5b0416c';
    const apiKey = process.env.MY_API_KEY;
    let requestBody = JSON.parse(event.body)
    let type = requestBody.type; 
    //const type = params.type;//full call or half call
    event
    try {
        let url;
        if (type === "halfCall"){
            const state = requestBody.state;
            const country= requestBody.country;

            //console.log(state, country, type);
            url = `http://api.openweathermap.org/geo/1.0/direct?q=${state},${country}&limit=${1}&appid=${apiKey}`;
        }
        if (type === "fullCall"){
            const city = requestBody.city;
            const state = requestBody.state;
            const country= requestBody.country;

           //console.log(requestBody.state, requestBody.country, requestBody.type, requestBody.state);
            url = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=${1}&appid=${apiKey}`;
        }
        if (type === "viaTimestamp"){
            const lat = requestBody.lat;
            const lon = requestBody.lon;
            const timestamp= requestBody.timestamp;
            url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${apiKey}`;
        }
        if (type === "reverse"){
            const lat = requestBody.lat;
            const lon = requestBody.lon;
            const timestamp= requestBody.timemstamp;
            url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        }
        if (type === "oneCall"){
            const lat = requestBody.lat;
            const lon = requestBody.lon;
            url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        return{
            statusCode: 200,
            body:JSON.stringify({data:data})
        };
    } catch (error) {
        return{
            statusCode: 500,
            body:JSON.stringify('error fetching data')
        };
    }

};