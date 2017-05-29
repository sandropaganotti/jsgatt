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
