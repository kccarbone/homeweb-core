import fs from 'fs';
import path from 'path';

const configDir = path.join(import.meta.dirname, '../../../config');

interface AppConfig {
  timezone: string;
  serverPort: number;
}

export default JSON.parse(fs.readFileSync(`${configDir}/config.json`, 'utf8')) as AppConfig;


interface SecretsConfig {
  mqttUsername: string;
  mqttPassword: string;
  mqttHost: string;
  mqttPort: number;
}

export const secrets = JSON.parse(fs.readFileSync(`${configDir}/secrets.json`, 'utf8')) as SecretsConfig;