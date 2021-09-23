const http = require('http');
const fs = require('fs');
var requests = require('requests');
var geoip = require('geoip-lite');
const RequestIp = require('@supercharge/request-ip')




// var ip_info = get_ip(req, right_most_proxy = True)

const homeFile = fs.readFileSync("home.html", "utf-8");
const port = process.env.PORT || 5000;

const replaceValues = (oldValue, orgValue) => {
    let temprature = oldValue.replace("{%tempVal%}", orgValue.main.temp);
    temprature = temprature.replace("{%tempMin%}", orgValue.main.temp_min);
    temprature = temprature.replace("{%tempMax%}", orgValue.main.temp_max);
    temprature = temprature.replace("{%location%}", orgValue.name);
    temprature = temprature.replace("{%coutry%}", orgValue.sys.country);
    temprature = temprature.replace("{%tempStatus%}", orgValue.weather[0].main);
    return temprature;
}
const server = http.createServer((req, res) => {
    if (req.url == "/") {
        const ipAdd = RequestIp.getClientIp(req)
            // console.log(ipAdd)
        var ip = ipAdd;
        var geo = geoip.lookup(ip);
        let city = geo.city;



        requests(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=ad28a3baf0f28aeea5f94ada4997fb33`)
            .on('data', (chunk) => {
                const objData = JSON.parse(chunk)
                const arrData = [objData];
                if (arrData[0].cod == 404) {
                    const notFoundFile = fs.readFileSync("notFound.html", "utf-8");
                    res.write(notFoundFile.toString());
                } else {
                    const realTimeData = arrData.map((val) => replaceValues(homeFile, val)).join("");
                    res.write(realTimeData)
                }


            })
            .on('end', (err) => {
                if (err) return console.log('connection closed due to errors', err);
                res.end();
            });
    }
}).listen(port, () => {
    console.log(`listning on port ${port}`)
});