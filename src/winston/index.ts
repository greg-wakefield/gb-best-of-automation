import path from "path";
import fs from "fs";
import winston from "winston";

import { LOG_LEVEL, LOG_PATH } from "../environment";

const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
const logDir = path.resolve(LOG_PATH);
const logFile = path.resolve(".", logDir, `${timestamp}.log`);

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = new winston.Logger({
    level: LOG_LEVEL,
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: logFile })],
});

export default logger;
