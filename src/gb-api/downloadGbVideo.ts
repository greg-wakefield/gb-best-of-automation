import fs from "fs";
import path from "path";

import { CHUNK_SIZE, DOWNLOAD_PATH } from "../environment";

import { saveStream } from "./saveStream";
import { GbVideoInfo } from "./types";
import logger from "../winston";

export async function downloadGbVideo(videoUrl: string, filePath = DOWNLOAD_PATH) {
    const response = await fetch(videoUrl);

    if (!response.ok) {
        throw new Error(`Failed to download video from ${videoUrl}: ${response.statusText}`);
    } else if (!response.body) {
        throw new Error(`No response body for video URL: ${videoUrl}`);
    }

    logger.info(`Downloaded and saved to ${filePath}`);
    await saveStream(response.body, filePath);
}

export async function downloadVideoChunked(gbData: GbVideoInfo[]) {
    const fileDir = path.resolve(DOWNLOAD_PATH);

    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir), { recursive: true };
    }

    for (let i = 0; i < gbData.length; i += CHUNK_SIZE) {
        const videoUrlChunk = gbData.slice(i, i + CHUNK_SIZE);
        const promises: Promise<void>[] = [];
        videoUrlChunk.forEach((video) => {
            const filePath = path.join(fileDir, `${video.youtube_id}.mp4`);
            if (!video.hd_url) {
                return;
            } else if (fs.existsSync(filePath)) {
                logger.warn(`File already exists at ${filePath}, skipping download.`);
                return;
            }
            promises.push(downloadGbVideo(video.hd_url, filePath));
        });
        logger.info(`Downloading chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(gbData.length / CHUNK_SIZE)}`);
        await Promise.all(promises);
    }
}
