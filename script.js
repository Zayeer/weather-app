const form = document.querySelector("#form");
const cOrF = document.querySelector(".cOrF");
const displayTemp = document.querySelector(".displayTemp");
const displayAddData = document.querySelector(".displayAddData");
const success = document.querySelector(".success");
const failure = document.querySelector(".failure");
const loadingWrapper = document.querySelector(".loading-wrapper");
const dataRecieved = document.querySelector(".dataRecieved");
const weatherImage = document.querySelector(".weather-image");
let duplicateData;

const asynchronousTasks = (() => {
    const accessWeatherData = async (dataURL)  => {
        const dataResponse = await fetch(dataURL);
        const data = await dataResponse.json();
        if (dataResponse.status !== 200) {
            throw Error(data.message);
        }
        return data;
    }

    const accessAppropriateGif = async(gifURL) => {
        const gifResponse = await fetch(gifURL);
        if (gifResponse.status !== 200) {
            throw Error("Not Found");
        }
        const gifData = await gifResponse.json();
        return gifData;
    }

    return {accessWeatherData, accessAppropriateGif};
})();

form.addEventListener("submit", (event) => {
    event.preventDefault();
    let cityNameURL;
    if(location.protocol === "http:") {
        cityNameURL = `http://api.openweathermap.org/data/2.5/weather?q=${event.target.firstElementChild.value}&appid=f481182c63cfe95ca3bec984a6378f17`;
    } else {
        cityNameURL = `https://api.openweathermap.org/data/2.5/weather?q=${event.target.firstElementChild.value}&appid=f481182c63cfe95ca3bec984a6378f17`;
    }
    accessData(cityNameURL);
});

function accessData(url) {
    asynchronousTasks.accessWeatherData(url).then((data)=> {
        duplicateData = data;
        let gifURL;
        if(location.protocol === "http:") {
            gifURL = `http://api.giphy.com/v1/gifs/search?q=${duplicateData.weather[0].main}&api_key=u24N0Slud9p19OanROCrN8KeIIKTjKTw&limit=1`;
        } else {
            gifURL = `https://api.giphy.com/v1/gifs/search?q=${duplicateData.weather[0].main}&api_key=u24N0Slud9p19OanROCrN8KeIIKTjKTw&limit=1`;
        }
        return asynchronousTasks.accessAppropriateGif(gifURL);
    }).then(gifData => {
        weatherImage.src = gifData.data[0].images.original.url;
        weatherImage.setAttribute("style",
            "display: block; animation: imageAnimation 5s linear 0 1; opacity: 0.6; z-index: -10");
        assignValuesToDomElements(duplicateData);
        failure.style.display = "none";
        success.style.display = "grid";
    }).catch(err => {
        failure.innerText = err.message;
        success.style.display = "none";
        failure.style.display = "grid";
        weatherImage.src = "./images/giphy.webp";
        weatherImage.style.opacity = "0.6";
        weatherImage.style.zIndex = -10;
    });
}

navigator.geolocation.watchPosition((position) => {
    let latAndLongURL;
    if(location.protocol === "http:") {
        latAndLongURL = `http://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=f481182c63cfe95ca3bec984a6378f17`;
    } else {
        latAndLongURL = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=f481182c63cfe95ca3bec984a6378f17`;
    }
    accessData(latAndLongURL);
});



cOrF.addEventListener("click", () => {
    if(event.target === document.querySelector(".fa-toggle-off")) {
        document.querySelector(".fa-toggle-off").remove();
        cOrF.innerHTML = `<p>C</p><i class="fas fa-toggle-on"></i><p>F</p>`;
        displayDataToggle();
    } else if(event.target === document.querySelector(".fa-toggle-on")) {
        document.querySelector(".fa-toggle-on").remove();
        cOrF.innerHTML = `<p>C</p><i class="fas fa-toggle-off"></i><p>F</p>`;
        displayDataToggle();
    } 
});

function displayDataToggle() {
    if (success.style.display === "grid") {
        assignValuesToDomElements(duplicateData);
    }
}


function assignValuesToDomElements(data) {
    const { tempInC, tempInF, feelsLikeInC, feelsLikeInF, minTemperatureInC, minTemperatureInF,
        maxTemperatureInC, maxTemperatureInF, city, country, humidity, weatherDesc } = getRequiredWeatherData(data);
        document.querySelector(".cityName").innerText = city;
        document.querySelector(".countryName").innerText = country;
        document.querySelector(".weatherDescVal").innerText = weatherDesc;
        document.querySelector(".humidityVal").innerText = `${humidity}%`;
        if (cOrF.children[1].classList.contains("fa-toggle-off")) {
            document.querySelector(".displayTemp").innerHTML = `${ tempInC }<sup class ="cSymbolTemp">&#8451;</sup>`;
            document.querySelector(".fl-val").innerHTML = `${ feelsLikeInC }<sup class="cSymbol">&#8451;</sup>`;
            document.querySelector(".minTempVal").innerHTML = `${ minTemperatureInC }<sup class="cSymbol">&#8451;</sup>`;
            document.querySelector(".maxTempVal").innerHTML = `${ maxTemperatureInC }<sup class="cSymbol">&#8451;</sup>`;            
        } else {
            document.querySelector(".displayTemp").innerHTML = `${ tempInF }<sup class="fSymbolTemp">&#8457;</sup>`;
            document.querySelector(".fl-val").innerHTML = `${ feelsLikeInF }<sup class="fSymbol">&#8457;</sup>`;
            document.querySelector(".minTempVal").innerHTML = `${ minTemperatureInF }<sup class="fSymbol">&#8457;</sup>`;
            document.querySelector(".maxTempVal").innerHTML = `${ maxTemperatureInF }<sup class="fSymbol">&#8457;</sup>`;
        }
}

function getRequiredWeatherData(data) {
    const tempInC = convertKelvinToCelsius(data.main.temp);
    const tempInF = convertKelvinToFahrenheit(data.main.temp);
    const feelsLikeInC = convertKelvinToCelsius(data.main.feels_like);
    const feelsLikeInF = convertKelvinToFahrenheit(data.main.feels_like);
    const minTemperatureInC = convertKelvinToCelsius(data.main.temp_min);
    const minTemperatureInF = convertKelvinToFahrenheit(data.main.temp_min);
    const maxTemperatureInC = convertKelvinToCelsius(data.main.temp_max);
    const maxTemperatureInF = convertKelvinToFahrenheit(data.main.temp_max);
    const city = data.name;
    const country = data.sys.country;
    const humidity = data.main.humidity;
    const weatherDesc = data.weather[0].main;
    return {
        tempInC, tempInF, feelsLikeInC, feelsLikeInF, minTemperatureInC, minTemperatureInF,
        maxTemperatureInC, maxTemperatureInF, city, country, humidity, weatherDesc
    };
}

function convertKelvinToCelsius(temp) {
    return +(temp - 273.15).toFixed(1);
}

function convertKelvinToFahrenheit(temp) {
    return +((temp - 273.15) * 9/5 + 32).toFixed(1);
}