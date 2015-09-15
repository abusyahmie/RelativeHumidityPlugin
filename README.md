# RelativeHumidityPlugin
Cordova Device Relative Humidity Sensor Plugin

Example code:

```
<!DOCTYPE html>
<html>
  <head>
    <title>Acceleration, Temperature & Relative Humidity Example</title>

    <script type="text/javascript" charset="utf-8" src="cordova.js"></script>
    <script type="text/javascript" charset="utf-8">

    // Wait for device API libraries to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);
	console.log("Device Loaded!")

    // device APIs are available
    //
    function onDeviceReady() {
        navigator.accelerometer.getCurrentAcceleration(onAccelSuccess, onError);
		navigator.temperaturesensor.getCurrentTemperature(onTempSuccess, onError);
		navigator.relativehumiditysensor.getCurrentRelativeHumidity(onRHSuccess, onError);
    }

    // onSuccess: Get a snapshot of the current acceleration
    //
    function onAccelSuccess(acceleration) {
        alert('Acceleration X: ' + acceleration.x + '\n' +
              'Acceleration Y: ' + acceleration.y + '\n' +
              'Acceleration Z: ' + acceleration.z + '\n' +
              'Timestamp: '      + acceleration.timestamp + '\n');
    }
	
    function onTempSuccess(temperature) {
        alert('Temperature: ' + temperature.t + '\n' +
              'Timestamp: '   + temperature.timestamp + '\n');
    }

    function onRHSuccess(relativehumidity) {
        alert('Relative Humidity: ' + relativehumidity.rh + '\n' +
              'Timestamp: '   + relativehumidity.timestamp + '\n');
    }
	
    // onError: Failed to get the acceleration
    //
    function onError() {
        alert('onError!');
    }

    </script>
  </head>
  <body>
    <h1>Example</h1>
    <p>getCurrentAcceleration</p>
	<p>getCurrentTemperature</p>
	<p>getCurrentRelativeHumidity</p>
  </body>
</html>
```
