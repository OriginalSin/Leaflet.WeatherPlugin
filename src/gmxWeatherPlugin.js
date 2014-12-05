/*
 * gmxWeatherPlugin  - weather plugin for leaflet
 */
var gmxWeatherPlugin = function (options) {
    if (!options) options = {};
    var _gtxt = function (key) {
        return L.gmxLocale ? L.gmxLocale.getText(key) : key;
    };
    L.gmxLocale.addText({
        eng: {
            WeatherPlugin: {
                WindButton : "Wind",
                WeatherButton : "Weather",
                AccordingTo : "According to the data from"
             }
        },
        rus: {
            WeatherPlugin: {
                WindButton : "Ветер",
                WeatherButton : "Погода",
                AccordingTo : "По данным"
             }
        }
    });

    var layer = null,
        weatherURL = options.weatherURL || "http://maps.kosmosnimki.ru/Weather.ashx",
        imagesHost = options.imagesHost || "http://maps.kosmosnimki.ru/api/img/weather/",
        attributes = ['Name', 'Lat', 'Lng', 'Forecast', 'Error', 'icon']
        styles = [];
    for (var i = 0; i < 9; i++) {
        styles.push({
            MinZoom:1, MaxZoom:21, BalloonEnable:true, DisableBalloonOnClick:false, DisableBalloonOnMouseMove:true
            ,Filter: '"icon"=' + i
            ,RenderStyle:{
                marker:{
                    image: imagesHost + '24/' + i + '.png',
                    center: true
                }
            }
        });
    }
    
    var info = {
        properties: {
            type: 'Vector'
            ,GeometryType: 'point'
            ,attributes: attributes
            ,styles: styles
        }
    };
    var data = null;
    var parseData = function (arr) {
        data = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var it = arr[i];
            if (it.Error != null)
                continue;
            var forecast = it.Forecast,
                icon = 0,
                latlng = L.latLng(it.Lat, it.Lng),
                merc = L.Projection.Mercator.project(latlng);

            if (forecast && forecast.length) {
                icon = forecast[0].Precipitation < 9
                    ? forecast[0].Precipitation
                    : forecast[0].Cloudiness
                ;
            }
            data.push([
               it.Id,
               it.Name,
               it.Lat,
               it.Lng,
               it.Forecast,
               it.Error,
               icon,
               {type:'POINT', coordinates: [merc.x, merc.y]}
            ]);
        }
        layer.addData(data);
    };
    var getData = function (params) {
        if (!params) params = {};
        L.gmxUtil.requestJSONP(
            weatherURL, 
            {
                WrapStyle: 'func',
                country: params.countryCode || 0
            }
        ).then(function(json) {
            if (json && json.Status === 'ok' && json.Result) {
                parseData(json.Result);
            } else {
                console.log('data not found!');
            }
        });
    };
    layer = L.gmx.createLayer(info)
        .on('loading', function (ev) {
            if (!data) getData();
        })
        .bindPopup(
            '',
            {
                maxWidth: 560,
                popupopen: function(ev) {
                    var popup = ev.popup,
                        city = ev.gmx.properties,
                        weekdays = ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'],
                        tods = ['ночь','утро','день','вечер'],
                        dir = ['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ'];

                    var str = "<span style=\"font-size:14px; font-weight:bold; color:#000;\">" + city.Name + "</span><br/>";
                    str += "<table style=\"width:375px;\"><tbody>";
                    for (var i = 0; i < city.Forecast.length; ++i) {
                        var imgIcon = (city.Forecast[i].Precipitation < 9) ? city.Forecast[i].Precipitation : city.Forecast[i].Cloudiness,
                            pres = Math.round((city.Forecast[i].PressureMax + city.Forecast[i].PressureMin) / 2),
                            rel = Math.round((city.Forecast[i].HumidityMax + city.Forecast[i].HumidityMin) / 2),
                            date = new Date(Number(city.Forecast[i].DateTime.replace("/Date(","").replace(")/","")));
                      
                        str += "<tr><td style=\"width:70px\">" + weekdays[date.getDay()] + ", " + tods[city.Forecast[i].TimeOfDay] + "</td><td style=\"width:80px;text-align:center;\">" + (city.Forecast[i].TemperatureMin > 0 ? "+" : '') + city.Forecast[i].TemperatureMin + '..' + (city.Forecast[i].TemperatureMax > 0 ? "+" : '') + city.Forecast[i].TemperatureMax + "</td><td style=\"width:20px;text-align:right;\">" + dir[city.Forecast[i].WindDirection] + "</td><td style=\"width:80px;text-align:center;\">" + city.Forecast[i].WindMin + '-' + city.Forecast[i].WindMax + ' м/с' + "</td><td style=\"width:70px;text-align:center;\">" + pres + " м.р.с.</td><td style=\"width:35px;text-align:center;\">" + rel + "%</td><td style=\"width:20px;\"><img style=\"width:16px;height:16px;\" src=\"" + imagesHost + "16/" + imgIcon + ".png\"></td></tr>";
                    }
                  
                    str += "</table></tbody>";
                    str += "<div style=\"margin-top:5px; font-size:10px; text-align:right; font-family: sans-serif;\">" + _gtxt('WeatherPlugin.AccordingTo') + " <a href=\"http://gismeteo.ru\" target=\"_blank\">Gismeteo.ru</a></div>";
                    popup.setContent(str);
                }
            }
        );
    return layer;
};
