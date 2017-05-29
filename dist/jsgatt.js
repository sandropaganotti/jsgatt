define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var LOADING = 'loading';
  var cache = {};
  var devices = {};

  var Device = function () {
    function Device() {
      var win = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

      _classCallCheck(this, Device);

      this.services = [];
      this.window = win;
    }

    _createClass(Device, [{
      key: 'register',
      value: function register(service, characteristic, name) {
        var _this = this;

        this.services.push(service);
        var opts = {
          request: name ? { filters: [{ namePrefix: name }], optionalServices: this.services } : { filters: [{ services: this.services }] },
          service: service,
          characteristic: characteristic
        };
        var accessor = function accessor(newValue, delay) {
          return _this._gatt(opts, newValue, false, delay);
        };
        accessor.getCharacteristic = function () {
          return accessor().then(function () {
            return cache[JSON.stringify(opts)].item;
          });
        };
        return accessor;
      }
    }, {
      key: '_gatt',
      value: function _gatt(opts, newValue) {
        var _this2 = this;

        var forget = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var delay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

        var deviceKey = JSON.stringify(this._getRequest(opts));
        var characteristicKey = JSON.stringify(opts);
        var device = devices[deviceKey];
        var characteristic = cache[characteristicKey];
        return (!forget && characteristic && characteristic.item.service.device.gatt.connected ? Promise.resolve(characteristic.item) : (!forget && device && device !== LOADING ? Promise.resolve(device) : device === LOADING ? this._waitForDevice(deviceKey) : this._requestDevice(deviceKey, opts)).then(function (device) {
          return device.gatt.connected ? device.gatt : _this2._connectDevice(device, deviceKey);
        }).then(function (server) {
          devices[deviceKey] = server.device;
          return server.getPrimaryService(opts.service);
        }).then(function (service) {
          return service.getCharacteristic(opts.characteristic);
        }).then(function (characteristic) {
          cache[characteristicKey] = { item: characteristic };
          return characteristic;
        })).then(function (characteristic) {
          if (newValue && cache[characteristicKey].iswriting) {
            return Promise.resolve();
          }
          return new Promise(function (resolve) {
            setTimeout(function () {
              (newValue ? _this2._writeValue(newValue, characteristicKey) : characteristic.readValue()).then(resolve);
            }, delay);
          });
        });
      }
    }, {
      key: '_writeValue',
      value: function _writeValue(value, characteristicKey) {
        cache[characteristicKey].iswriting = true;
        return cache[characteristicKey].item.writeValue(value).then(function () {
          delete cache[characteristicKey].iswriting;
        });
      }
    }, {
      key: '_connectDevice',
      value: function _connectDevice(device, deviceKey) {
        device[deviceKey] = LOADING;
        return device.gatt.connect();
      }
    }, {
      key: '_requestDevice',
      value: function _requestDevice(deviceKey, opts) {
        devices[deviceKey] = LOADING;
        return this.window.navigator.bluetooth.requestDevice(this._getRequest(opts));
      }
    }, {
      key: '_waitForDevice',
      value: function _waitForDevice(deviceKey) {
        return new Promise(function (resolve, reject) {
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
    }, {
      key: '_getRequest',
      value: function _getRequest(opts) {
        return opts.request || { filters: [{ services: [opts.service] }] };
      }
    }]);

    return Device;
  }();

  exports.default = Device;
});