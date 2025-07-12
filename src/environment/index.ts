import "dotenv/config";
import { getWeek } from "../google-api";

const IS_DEV = process.env.NODE_ENV === "development";
console.log(`Running in ${IS_DEV ? "development" : "production"} mode`);

const getEnvVariable = (name: string): string => {
    const value = process.env[name];
    if (IS_DEV) {
        console.log(`Environment variable ${name}: ${value}`);
    }
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
};

const GOOGLE_CLIENT_EMAIL = getEnvVariable("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY = getEnvVariable("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
const SPREADSHEET_ID = getEnvVariable("SPREADSHEET_ID");
const CHANNEL_NAME = getEnvVariable("CHANNEL_NAME");
const S3_BUCKET_NAME = getEnvVariable("S3_BUCKET_NAME");
const AWS_DEFAULT_REGION = getEnvVariable("AWS_DEFAULT_REGION");
const SHEET_NAME = getEnvVariable("SHEET_NAME");
const MIN_CLIP_DURATION_SECONDS = parseInt(process.env.MIN_CLIP_DURATION_SECONDS || "5");
const MAX_CLIP_DURATION_SECONDS = parseInt(process.env.MAX_CLIP_DURATION_SECONDS || "30");
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_PATH = process.env.LOG_PATH || "./tmp/logs";
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || "./tmp/videos";
const BEGIN_PUBLISH_DATE_DAYS = parseInt(process.env.BEGIN_PUBLISH_DATE_DAYS || "14");
const END_PUBLISH_DATE_DAYS = parseInt(process.env.END_PUBLISH_DATE_DAYS || "7");
const OUTPUT_FILENAME = process.env.OUTPUT_FILENAME || getWeek();
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || "5");

export {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    SPREADSHEET_ID,
    CHANNEL_NAME,
    S3_BUCKET_NAME,
    AWS_DEFAULT_REGION,
    SHEET_NAME,
    MIN_CLIP_DURATION_SECONDS,
    MAX_CLIP_DURATION_SECONDS,
    LOG_LEVEL,
    LOG_PATH,
    DOWNLOAD_PATH,
    BEGIN_PUBLISH_DATE_DAYS,
    END_PUBLISH_DATE_DAYS,
    IS_DEV,
    OUTPUT_FILENAME,
    CHUNK_SIZE,
};
