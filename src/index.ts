#!/usr/bin/env node
import { env, exit } from 'node:process';
import proc from 'child_process';
import bark from 'bark-logger';

const appName = 'homeweb-core';
const log = new bark.Logger(appName);

bark.config.threshold = env.LOGLEVEL ?? bark.Levels.INFO;

/* Nothin yet... */