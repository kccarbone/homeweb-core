import fs from 'fs';
import { getPath, configPath } from '../util.js';

interface AppConfig {
  timezone: string;
  serverPort: number;
}

function getAppConfig(configFile?: string) {
  const path = configFile ? getPath(configFile) : configPath('config.json');
  const content = fs.readFileSync(path, 'utf8');

  return JSON.parse(content) as AppConfig;
}

interface SecretsConfig {
  mqttUsername: string;
  mqttPassword: string;
  mqttHost: string;
  mqttPort: number;
}

function getSecrets(configFile?: string) {
  const path = configFile ? getPath(configFile) : configPath('secrets.json');
  const content = fs.readFileSync(path, 'utf8');

  return JSON.parse(content) as SecretsConfig;
}

export default {
  getAppConfig,
  getSecrets
}