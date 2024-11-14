import mqtt from 'mqtt';
import bark from 'bark-logger';
import { fuzzyMatch } from '../util.js';

class EventHandler {
  readonly id: number;
  readonly target: string;
  readonly action: () => Promise<void>;

  constructor(initialId: number, initialTarget: string, initialAction: () => Promise<void>) {
    this.id = initialId;
    this.target = initialTarget;
    this.action = initialAction;
  }
}

export class EventRouter {
  private _log: bark.Logger;
  private _cxString: string;
  private _eventBus?: mqtt.MqttClient;
  private _handlers: EventHandler[];
  private _handlerSeq = 0;

  timeout = 3000;

  constructor(username = '', password = '', host = 'localhost', port = 1883) {
    this._log = bark.getLogger('event-router');
    this._handlers = [];
    this._cxString = (username && password)
      ? `mqtt://${username}:${password}@${host}:${port}`
      : `mqtt://${host}:${port}`
  }

  async start() {
    const options = { connectTimeout: 3000 };
    this._eventBus = await mqtt.connectAsync(this._cxString, options);

    this._eventBus.on('connect', connack => {
      this._log.debug('MQTT connected');
    });
    
    this._eventBus.on('disconnect', () => {
      this._log.debug('MQTT disconnected');
    });

    this._eventBus.on('reconnect', () => {
      this._log.debug('MQTT reconnected');
    });
    
    this._eventBus.on('offline', () => {
      this._log.debug('MQTT offline');
    });
    
    this._eventBus.on('close', () => {
      this._log.debug('MQTT closed');
    });
    
    this._eventBus.on('end', () => {
      this._log.debug('MQTT ended');
    });
    
    this._eventBus.on('error', err => {
      this._log.error('MQTT error');
      console.log(err);
    });
    
    this._eventBus.on('message', this.processEvent.bind(this));

    await this._eventBus.subscribeAsync('zigbee2mqtt/#');
  }

  private async processEvent(topic: string, message: Buffer) {
    for (const handler of this._handlers) {
      if (fuzzyMatch(`zigbee2mqtt/${handler.target}`, topic)) {
        await handler.action();
      }
    }
  }

  addEventHandler(target: string, action: () => Promise<void>) {
    const handlerId = this._handlerSeq++;
    this._handlers.push(new EventHandler(handlerId, target, action));

    return handlerId;
  }

  removeEventHandler(handlerId: number) {
    this._handlers = [...this._handlers.filter(x => x.id !== handlerId)];
  }
}