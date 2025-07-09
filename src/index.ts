import path from "path";

import { DOWNLOAD_PATH, SHEET_NAME, SPREADSHEET_ID } from "./environment";

import logger from "./winston";
import { getGbVideos, downloadVideoChunked } from "./gb-api";
import { arrayToObjects, getSheet, SheetData, getWeek } from "./google-api";
import { processSheetData, makeVideo } from "./ffmpeg";
import { putObject } from "./aws/s3";

async function main() {
    const sheetDataArray = await getSheet(SPREADSHEET_ID, SHEET_NAME);
    const sheetDataObject = arrayToObjects<SheetData>(sheetDataArray);
    const gbData = await getGbVideos();
    const processedGbData = processSheetData(sheetDataObject, gbData);

    logger.info(`Downloading ${Object.values(processedGbData).length} videos...`);
    await downloadVideoChunked(Array.from(Object.values(processedGbData)));

    const filename = `${getWeek()}.mp4`;
    await makeVideo({
        options: processedGbData,
        folderPath: DOWNLOAD_PATH,
        output: filename,
    });
    await putObject(path.join(DOWNLOAD_PATH, filename), "video/mp4");
    logger.info(`Video ${filename} uploaded to S3 successfully.`);
}

logger.info("Starting GB Best Of Automation...");
main();
