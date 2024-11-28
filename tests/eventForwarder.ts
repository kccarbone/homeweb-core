#!/usr/bin/env node
import { env } from 'node:process';
import bark from 'bark-logger';
import axios from 'axios';
import config, { secrets } from '../src/services/config.js';
import { EventRouter } from '../src/services/eventRouter.js';

const log = bark.getLogger('evt-test');
bark.config.threshold = env.LOGLEVEL ?? bark.Levels.DEBUG;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Local state
class DeviceState {
  on = false;
  bri = 0
}

let lastActionTS = 0

// Test device
const deviceId = 'sw-loftcloset';
const deviceState = new DeviceState();

// Test indicator
const indFadeIn = {
  individual_led_effect: {
    color: 200,
    duration: 1,
    effect: 'solid',
    led: '1',
    level: 70
  }
};

// Test API targets
const staggerUp = 'http://10.0.0.71/stagger/desc/15'
const staggerdown = 'http://10.0.0.71/stagger/asc/12'

// MQTT broker
const router = new EventRouter(
  secrets.mqttUsername,
  secrets.mqttPassword,
  secrets.mqttHost,
  secrets.mqttPort);

router.addEventHandler(deviceId, async (payload: any) => {
  //log.info('Found matching event!');
  //console.log(payload);

  // Actions
  if (payload.action) {
    const newTS = Math.floor(new Date().getTime() / 1000);

    // New action must be at least 1 second newer than last action (crude debounce)
    if ((newTS - lastActionTS) > 1) {
      lastActionTS = newTS;

      if (payload.action === 'up_single') {
        // Increase brightness
        deviceState.bri = Math.min(100, deviceState.bri + 25);

        log.info(`Lights on (${deviceState.bri})`);
        const result = await axios.put(`${staggerUp}/${deviceState.bri}`);
        log.debug(`API Result: ${result.status} ${result.statusText}`);
      }

      if (payload.action === 'down_single') {
        log.info('Lights off');
        deviceState.bri = 0;
        const result = await axios.put(`${staggerdown}/${deviceState.bri}`);
        log.debug(`API Result: ${result.status} ${result.statusText}`);
      }
    }
  }

  // State changes
  if (payload.state) {
    deviceState.on = (payload.state === 'ON');
    // TODO: get current brightness from API
    //console.log(deviceState);
  }
});

log.info('Connecting to mqtt...');
await router.start();
log.info('listening!');

log.info('Sending refresh request...');
await router.refreshState(deviceId);
log.info('done');

await sleep(1000);

//await router.updateState(deviceId, indFadeIn);
console.log('--------');