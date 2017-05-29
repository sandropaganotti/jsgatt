# JSGatt
JSGatt adds some syntactic sugar on top of the [web bluetooth api](https://webbluetoothcg.github.io/web-bluetooth/).

```javascript
import Device from 'jsgatt';

const phone = new Device();
const battery = phone.register(
  'battery_service', // service name or UID
  'battery_level' // characteristic name or UID
);

document.querySelector('button').addEventListener(function(){
  battery().then(value => {
    if (value.getUint8(0) < 20) {
      alert('low battery!');
    }
  });
});
```

# Features
✓ shorter syntax<br/>
✓ auto reconnection<br/>
✓ caches characteristics<br/>
✓ aggregates services for the same device<br/>
✓ prevents writing if another writing is in progress<br/>
✓ handles accessing a characteristic while the device is still connecting

# API
- use `device = new Device()` to instantiate a new bluetooth device
- use `accessor = device.register('service','characteristic')` to get access to the desired `characteristic` within `service`, both [names](https://www.bluetooth.com/specifications/gatt/services) and UIDs are supported
- use `accessor()` to read and `accessor(value)` to write, they both return a promise
- use `accessor.getCharacteristic()` to get access to the characteristic object, useful if you need to [subscribe to updates from the characteristic](https://googlechrome.github.io/samples/web-bluetooth/notifications.html)

# Examples
- **Toggle and change color of a smart light** - [demo](https://sandropaganotti.github.io/jsgatt/examples/light.html), [video](https://www.youtube.com/watch?v=10GUcvLJSzc), [source](https://github.com/sandropaganotti/jsgatt/blob/master/examples/light.html)<br/>
to run this example you'll need an [Awox smartlight](https://www.amazon.com/AwoX-SML-c4-GU10-SmartLight-Lampadina-controllo/dp/B00UHE2R14/).
- **Use the webcam to set the color from a smart light** - [demo](https://sandropaganotti.github.io/jsgatt/examples/color-detector.html), [video](https://www.youtube.com/watch?v=IzPUTmDcc8c), [source](https://github.com/sandropaganotti/jsgatt/blob/master/examples/color-detector.html)<br/>
to run this example you'll need an [Awox smartlight](https://www.amazon.com/AwoX-SML-c4-GU10-SmartLight-Lampadina-controllo/dp/B00UHE2R14/).
- **Toggle a smart light using the voice** - [demo](https://sandropaganotti.github.io/jsgatt/examples/voice.html), [video](https://www.youtube.com/watch?v=2t5n-x19Vuc), [source](https://github.com/sandropaganotti/jsgatt/blob/master/examples/voice.html)<br/>
to run this example you'll need an [Awox smartlight](https://www.amazon.com/AwoX-SML-c4-GU10-SmartLight-Lampadina-controllo/dp/B00UHE2R14/).
- **Subscribe to the battery level service** - [demo](https://sandropaganotti.github.io/jsgatt/examples/notification.html), [video](https://www.youtube.com/watch?v=kR-RzDIY_Cw), [source](https://github.com/sandropaganotti/jsgatt/blob/master/examples/notification.html)<br/>
you can emulate a battery level service using any Android device with the [BLE peripheal simulator app](https://play.google.com/store/apps/details?id=io.github.webbluetoothcg.bletestperipheral)
- **Drive a Parrot mini drone with the keyboard** - [demo](https://sandropaganotti.github.io/jsgatt/examples/drone.html), [source](https://github.com/sandropaganotti/jsgatt/blob/master/examples/drone.html)<br/>
to run this example you'll need a [Parrot Minidrone](https://www.amazon.com/dp/B0111O7VIC/ref=twister_B015HBQGA4/). Massive thanks to [poshaughnessy](https://github.com/poshaughnessy/web-bluetooth-parrot-drone] and [voodootikigod](https://github.com/voodootikigod/node-rolling-spider) for the original codebase.
