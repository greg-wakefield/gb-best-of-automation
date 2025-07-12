import { CHUNK_SIZE } from "../environment";
import { EditOptions } from "../types";
import logger from "../winston";
import { downloadVideo } from "../yt-dlp";

export async function createClips({ clips, folderPath }: EditOptions) {
    const tempFiles: string[] = [];
    try {
        for (let index = 0; index < clips.length; index += CHUNK_SIZE) {
            const chunkedClips = clips.slice(index, index + CHUNK_SIZE);
            const promises: Promise<{ filePath: string; filename: string }>[] = [];
            for (const clip of chunkedClips) {
                const { title, url, inTime, outTime, inTimeSeconds, outTimeSeconds } = clip;
                logger.info(`Processing video: ${title} ${inTime} - ${outTime} (${url})`);

                const filename = `${title.replace(/[^a-zA-Z0-9]/g, "")}_${inTimeSeconds}-${outTimeSeconds}`;

                const downloadOptions = {
                    ...clip,
                    filename,
                    folderPath,
                };

                try {
                    promises.push(downloadVideo(downloadOptions));
                } catch (error) {
                    logger.error(`Failed to download video for clip ${filename}:`, {
                        error,
                        url,
                        inTime,
                        outTime,
                    });
                    break;
                }
            }

            tempFiles.push(...(await Promise.all(promises)).map(({ filePath }) => filePath));

            // Delay to stop rate limiting
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 5000);
            });
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
