import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

import { DownloadOptions } from "./types";

export const execAsync = promisify(exec);

export async function downloadVideo(url: string, options: DownloadOptions) {
    const { folderPath, filename, startTime, endTime } = options;

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const command = buildDownloadCommand(url, {
        folderPath,
        filename,
        startTime,
        endTime,
    });

    try {
        await execAsync(command);

        const files = fs.readdirSync(folderPath);
        const downloadedFile = files.find((file) => (filename ? file.includes(filename) : file.includes(".")));

        if (!downloadedFile) {
            throw new Error("Downloaded file not found");
        }

        const filePath = path.join(folderPath, downloadedFile);

        return {
            filePath,
            filename: downloadedFile,
        };
    } catch (error) {
        throw error;
    }
}

function buildDownloadCommand(url: string, options: DownloadOptions): string {
    const { folderPath, filename, startTime, endTime } = options;

    let command = `yt-dlp --force-keyframes-at-cuts --download-sections "*${startTime}-${endTime}"`;

    const outputTemplate = path.join(folderPath, `${filename}.%(ext)s`);

    command += ` -o "${outputTemplate}"`;
    command += ` "${url}"`;

    return command;
}
