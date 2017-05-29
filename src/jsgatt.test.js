/*globals expect jest*/

import Device from './jsgatt';

function buildMocks(retVal, opts = {}) {
  const device = jest.fn();
  const server = jest.fn();
  const service = jest.fn();
  const characteristic = jest.fn();
  const readValue = jest.fn();
  const writeValue = jest.fn();
  
  device.mockReturnValue(Promise.resolve({
    gatt: {
      connected: !!opts.connected,
      connect: server,
      getPrimaryService: service
    }
  }));
  
  server.mockReturnValue(Promise.resolve({
    getPrimaryService: service
  }));
  
  service.mockReturnValue(Promise.resolve({
    getCharacteristic: characteristic
  }));
  
  characteristic.mockReturnValue(Promise.resolve({
    writeValue: writeValue,
    readValue: readValue,
    service: {device: {gatt: {connected: true}}}
  }));
  
  readValue.mockReturnValue(Promise.resolve(retVal));
  writeValue.mockReturnValue(Promise.resolve(true));
  
  return {
    window: {navigator: {bluetooth: {requestDevice: device}}},
    server: server,
    service: service,
    characteristic: characteristic,
    readValue: readValue,
    writeValue: writeValue
  };
}

test('it build a new device', () => {
  const phone = new Device({});
  expect(phone).not.toBeNull();

  const char = phone.register('service', 'char');
  expect(char).not.toBeNull();
  expect(char.getCharacteristic).not.toBeNull();
});

test('it connects', () => {
  const mocks = buildMocks(10);
  const phone = new Device(mocks.window);
  const char = phone.register('service1', 'char1');
  return char()
    .then((value) => {
      expect(value).toEqual(10);
      return char();
    })
    .then((value) => {
      expect(value).toEqual(10);
      // characteristic is now cached.
      expect(mocks.service.mock.calls.length).toBe(1);
      expect(mocks.readValue.mock.calls.length).toBe(2);
    });
});

test('it writes', () => {
  const mocks = buildMocks(20);
  const phone = new Device(mocks.window);
  const char = phone.register('service2', 'char2');
  return char('testvalue').then((value) => {
    expect(mocks.writeValue.mock.calls.length).toBe(1);
    expect(mocks.writeValue.mock.calls[0][0]).toEqual('testvalue');
  });
});

test('it reuses connections', () => {
  const mocks = buildMocks(30, {connected: true});
  const phone = new Device(mocks.window);
  const char = phone.register('service3', 'char3');
  return char().then(() => {
    expect(mocks.server.mock.calls.length).toBe(0);
  });
});

test('it access characteristic', () => {
  const mocks = buildMocks(30);
  const phone = new Device(mocks.window);
  const char = phone.register('service4', 'char4');  
  char.getCharacteristic().then((characteristic) => {
    expect(characteristic).toBe(mocks.characteristic);
  });
});