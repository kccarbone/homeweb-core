#!/usr/bin/env node
import { env } from 'node:process';
import bark from 'bark-logger';
import config, { secrets } from '../src/services/config.js';
import { EventRouter } from '../src/services/eventRouter.js';

const log = bark.getLogger('evt-test');
bark.config.threshold = env.LOGLEVEL ?? bark.Levels.DEBUG;

const router = new EventRouter(
  secrets.mqttUsername,
  secrets.mqttPassword,
  secrets.mqttHost,
  secrets.mqttPort);

router.addEventHandler('extra1', async () => {
  log.info('Found matching event!');
});

log.info('Connecting to mqtt...');
await router.start();
log.info('listening!');