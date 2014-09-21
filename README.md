Leaflet.WeatherPlugin
=====================

Plugin for weather.

## Demos

- [Test WeatherPlugin &rarr;](http://originalsin.github.io/Leaflet.WeatherPlugin/examples/WeatherPlugin.html)


## Basic Usage

```js
    <script src="../src/gmxWeatherPlugin.js"></script>
    var map = new L.Map('map', {});
    var weatherLayer = gmxWeatherPlugin({
        //weatherURL: "http://maps.kosmosnimki.ru/Weather.ashx",
        //imagesHost: "http://maps.kosmosnimki.ru/api/img/weather/"
    });
    map.addLayer(weatherLayer);
    ...
```

## Changelog

#### 0.0.1 &mdash; Sep 21, 2014

- Initial release.

