import "dotenv/config";

const IS_DEV = process.env.NODE_ENV === "development";

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

const GB_API_KEY = getEnvVariable("GB_API_KEY");
const FONT_PATH = getEnvVariable("FONT_PATH");
const GOOGLE_CLIENT_EMAIL = getEnvVariable("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY = getEnvVariable("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
const SPREADSHEET_ID = getEnvVariable("SPREADSHEET_ID");
const S3_BUCKET_NAME = getEnvVariable("S3_BUCKET_NAME");
const AWS_DEFAULT_REGION = getEnvVariable("AWS_DEFAULT_REGION");
const MIN_CLIP_DURATION_SECONDS = parseInt(process.env.MIN_CLIP_DURATION_SECONDS || "5");
const MAX_CLIP_DURATION_SECONDS = parseInt(process.env.MAX_CLIP_DURATION_SECONDS || "30");
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_PATH = process.env.LOG_PATH || "./tmp/logs";
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || "./tmp/videos";
const SHEET_NAME = IS_DEV ? "Testing" : "Production";
const BEGIN_PUBLISH_DATE_DAYS = parseInt(process.env.BEGIN_PUBLISH_DATE_DAYS || "14");
const END_PUBLISH_DATE_DAYS = parseInt(process.env.END_PUBLISH_DATE_DAYS || "7");
const CHUNK_SIZE = 2;

export {
    GB_API_KEY,
    CHUNK_SIZE,
    FONT_PATH,
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    S3_BUCKET_NAME,
    AWS_DEFAULT_REGION,
    MIN_CLIP_DURATION_SECONDS,
    MAX_CLIP_DURATION_SECONDS,
    DOWNLOAD_PATH,
    SPREADSHEET_ID,
    LOG_LEVEL,
    LOG_PATH,
    IS_DEV,
    SHEET_NAME,
    BEGIN_PUBLISH_DATE_DAYS,
    END_PUBLISH_DATE_DAYS,
};
