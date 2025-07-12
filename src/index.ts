import path from "path";

import { DOWNLOAD_PATH, IS_DEV, OUTPUT_FILENAME, SHEET_NAME, SPREADSHEET_ID } from "./environment";

import logger from "./winston";
import { arrayToObjects, getSheet } from "./google-api";
import { processSheetData, makeVideo } from "./ffmpeg";
import { putObject } from "./aws/s3";
import { SheetData } from "./types";

async function main() {
    console.time("automation");
    const sheetDataArray = await getSheet(SPREADSHEET_ID, SHEET_NAME);
    const sheetDataObject = arrayToObjects<SheetData>(sheetDataArray);

    const processedData = await processSheetData(sheetDataObject);

    logger.verbose(`Processing data`, JSON.stringify(processedData, null, 3));

    logger.info("Creating video from processed data...");
    const filename = `${OUTPUT_FILENAME}.mp4`;
    await makeVideo({
        clips: processedData,
        folderPath: DOWNLOAD_PATH,
        output: filename,
    });

    if (!IS_DEV) {
        await putObject(path.join(DOWNLOAD_PATH, filename), "video/mp4");
        logger.info(`Video ${filename} uploaded to S3 successfully.`);
    }

    logger.info("Video processing completed successfully.");
    console.timeEnd("automation");
}

logger.info("Starting GB Best Of Automation...");
main();
