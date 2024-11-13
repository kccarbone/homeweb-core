import fs from 'fs';
import path from 'path';

const configDir = path.join(import.meta.dirname, '../../config');

interface AppConfig {
  timezone: string;
  serverPort: number;
}

export default JSON.parse(fs.readFileSync(`${configDir}/config.json`, 'utf8')) as AppConfig;