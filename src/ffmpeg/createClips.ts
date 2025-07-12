import path from "path";
import { v4 as uuidv4 } from "uuid";

import { EditOptions } from "./types";
import logger from "../winston";
import { downloadVideo } from "../yt-dlp";

export async function createClips({ options, folderPath }: EditOptions) {
    const tempFiles: string[] = [];
    try {
        for (const [key, info] of Object.entries(options)) {
            logger.info(`Processing video: ${info.title} (${info.url})`);

            for (const [index, clip] of info.timestamps.entries()) {
                const filename = `${info.title.replace(/[^a-zA-Z0-9]/g, "")}-${index + 1}`;
                logger.info(`Creating clip ${index + 1}: ${clip.startHHMMSS} - ${clip.endHHMMSS}`);
                const ext = info.ext;
                const tempOutput = path.join(folderPath, `${filename}.${ext}`);

                const downloadOptions = {
                    filename: filename,
                    startTime: clip.startHHMMSS,
                    endTime: clip.endHHMMSS,
                    folderPath: folderPath,
                };

                try {
                    await downloadVideo(info.url, downloadOptions);
                } catch (error) {
                    logger.error(`Failed to download video for clip ${index + 1}:`, {
                        error,
                        url: info.url,
                        start: clip.startHHMMSS,
                        end: clip.endHHMMSS,
                    });
                    break;
                }
                tempFiles.push(tempOutput);

                // Delay to stop rate limiting
                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 5000);
                });
            }
        }
    } catch (error) {
        logger.error("Error creating clips:", { error });
        throw error;
    }

    if (tempFiles.length === 0) {
        throw new Error("No clips were generated, nothing to concatenate.");
    }

    return tempFiles;
}
