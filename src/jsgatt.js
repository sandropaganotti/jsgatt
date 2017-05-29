const LOADING = 'loading';
const cache = {};
const devices = {};

class Device {

  constructor(win = window) {
    this.services = [];
    this.window = win;
  }
  
  register(service, characteristic, name) {
    this.services.push(service);
    const opts = {
      request: (
        name 
          ? {filters: [{namePrefix: name}], optionalServices: this.services}
          : {filters: [{services: this.services}]}
      ),
      service: service,
      characteristic: characteristic,        
    };
    const accessor = (newValue, delay) => { 
      return this._gatt(opts, newValue, false, delay);
    }; 
    accessor.getCharacteristic = () => {
      return accessor().then(() => {
        return cache[JSON.stringify(opts)].item;
      });
    };
    return accessor;    
  }
  
  _gatt(opts, newValue, forget = false, delay = 0) {
    const deviceKey = JSON.stringify(this._getRequest(opts));
    const characteristicKey = JSON.stringify(opts);
    const device = devices[deviceKey];
    const characteristic = cache[characteristicKey];
    return (
      (
        !forget && 
        characteristic && 
        characteristic.item.service.device.gatt.connected
      )  
        ? Promise.resolve(characteristic.item)
        : (
            !forget && device && device !== LOADING
            ? Promise.resolve(device)
            : device === LOADING
              ? this._waitForDevice(deviceKey)
              : this._requestDevice(deviceKey, opts)
          ).then(device => device.gatt.connected 
             ? device.gatt
             : this._connectDevice(device, deviceKey)
          ).then(server => {
            devices[deviceKey] = server.device;
            return server.getPrimaryService(opts.service);
          }).then(service => 
            service.getCharacteristic(opts.characteristic)
          ).then(characteristic => {
            cache[characteristicKey] = {item: characteristic};
            return characteristic;
          })
    ).then(characteristic => {
      if (newValue && cache[characteristicKey].iswriting) {
        return Promise.resolve();
      }
      return new Promise(resolve => { 
        setTimeout(() => {
          (
            newValue
            ? this._writeValue(newValue, characteristicKey)
            : characteristic.readValue()
          ).then(resolve);
        }, delay);
      });
    });
  }  

  _writeValue(value, characteristicKey) {
    cache[characteristicKey].iswriting = true;
    return cache[characteristicKey].item.writeValue(value)
      .then(() => { 
        delete cache[characteristicKey].iswriting;
      });
  }
  
  _connectDevice(device, deviceKey) {
    device[deviceKey] = LOADING;
    return device.gatt.connect();
  }
  
  _requestDevice(deviceKey, opts) {
    devices[deviceKey] = LOADING;
    return this.window.navigator.bluetooth.requestDevice(this._getRequest(opts));
  }
  
  _waitForDevice(deviceKey) {
    return new Promise((resolve, reject) => {
      function pollForDevice() {
        if (devices[deviceKey] && devices[deviceKey] !== LOADING) {
          resolve(devices[deviceKey]);
        } else {
          this.window.requestAnimationFrame(pollForDevice);
        }
      }
      pollForDevice();
    });
  }
  
  _getRequest(opts) {
    return opts.request || {filters: [{services: [opts.service]}]};
  }  
  
}


export default Device;