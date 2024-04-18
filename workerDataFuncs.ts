import axios from 'axios';

const findInfoByIp = (ip: string | undefined): Promise<{countryCode: string, lat: string, lon: string}> => {
    return new Promise((resolve, reject) => {
        if (ip === undefined) {
            reject('IP is undefined');
        }
        const url = `http://ip-api.com/json/${ip}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                resolve({countryCode: data.countryCode, lat: data.lat, lon: data.lon});
            })
            .catch(err => {
                reject(err);
            });
    })
};

const fillOptionsForAirportApi = (langtitute: number, longitude: number) => {
    const options = {
        method: 'GET',
        url: `https://api.checkwx.com/station/lat/${langtitute}/lon/${longitude}/?filter=A`,
        headers: {
          'X-API-Key': 'e18b932900d642b38275a17b85'
        }
      };
    return options;
}


const findAirport = (latitude: number, longitude: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const optionsForAirportApi = fillOptionsForAirportApi(latitude, longitude);
        axios.request(optionsForAirportApi).then(function (response) {
            resolve(response.data.data[0].iata)
        }).catch(function (error) {
            console.error(error);
            reject(error);
        });
    });
};

const workerData = (ip: string | undefined): Promise<{countryCode: string, iata: string}> => {
    return new Promise((resolve, reject) => {
        findInfoByIp(ip)
            .then(ipData => {
                let countryCode = ipData.countryCode;
                let latitude = ipData.lat;
                let longitude = ipData.lon;
                findAirport(parseFloat(latitude), parseFloat(longitude))
                    .then(iata => {
                        resolve({ countryCode: countryCode, iata: iata});
                    })
                    .catch(err => {
                        console.error('Error:', err);
                        reject(err);
                    });
            })
            .catch(err => {
                console.error('Error:', err);
                reject(err);
            });
    });
}


export { workerData };