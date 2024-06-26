import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { SonyBraviaPlugin } from './platform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SonyBraviaPluginAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private switchState = {
    On: false,
  };

  constructor(
    private readonly platform: SonyBraviaPlugin,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Sony')
      .setCharacteristic(this.platform.Characteristic.Model, 'BraviaTV')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
    platform.log.debug('Initializing accessory:', accessory.context.device.ipaddress);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

  }

  async setOn(value: CharacteristicValue) {
    this.switchState.On = value as boolean;
    this.toggleAudioOutput();
    this.platform.log.debug('Set Characteristic On ->', value);
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.switchState.On;
    this.platform.log.debug('Get Characteristic On ->', isOn);
    return isOn;
  }

  async toggleAudioOutput() {
    try {
      // get status of TV audio output
      const tvUrl = 'http://' + this.accessory.context.device.ipaddress + '/sony/audio';
      const getAudioState = {
        'method': 'getSoundSettings',
        'id': 73,
        'params': [{'target': 'outputTerminal'}],
        'version': '1.1',
      };
      const setAudioToTV = {
        'method': 'setSoundSettings',
        'id': 5,
        'params': [
          {'settings':
            [
              {
                'value': this.accessory.context.device.tvOutput,
                'target': 'outputTerminal',
              },
            ],
          },
        ],
        'version': '1.1',
      };
      const setAudioToDesiredOutput = {
        'method': 'setSoundSettings',
        'id': 5,
        'params': [
          {'settings':
            [
              {
                'value': this.accessory.context.device.audioSystemOutput,
                'target': 'outputTerminal',
              },
            ],
          },
        ],
        'version': '1.1',
      };
      this.postData(tvUrl, getAudioState).then((data) => {
        const currentTvAudioOutput = data.result[0][0].currentValue;
        if (currentTvAudioOutput === this.accessory.context.device.tvOutput) {
          this.platform.log.debug('Audio output changed once');
          this.postData(tvUrl, setAudioToDesiredOutput);
        } else {
          this.postData(tvUrl, setAudioToTV).then(() =>
            setTimeout(() => this.postData(tvUrl, setAudioToDesiredOutput), 500));
          // Need a delay since the Bravia won't handle two requests too close together
          this.platform.log.debug('Audio output changed twice');
        }
        this.switchState.On = false;
      });
      // if you need to return an error to show the device as 'Not Responding' in the Home app:
      // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

      this.platform.log.debug('Switch toggled');
    } catch (error) {
      this.platform.log.debug('Switch toggling failure:' + error);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async postData(url = '', params = {}) {
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-PSK': this.accessory.context.device.psk,
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(params),
    });
    this.platform.log.debug('Sending POST');
    if (response.status !== 200) {
      this.platform.log.debug('HTTP POST response unsuccessful for: ' + url
        + ' with status: ' + response.status
        + ' and params: ' + JSON.stringify(params));
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
    return response.json();
  }

}

