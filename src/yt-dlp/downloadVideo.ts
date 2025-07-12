import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

import { DownloadOptions } from "../types";

export const execAsync = promisify(exec);

export async function downloadVideo(options: DownloadOptions) {
    const { folderPath, filename } = options;

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const command = buildDownloadCommand(options);

    try {
        await execAsync(command);

        const files = fs.readdirSync(folderPath);
        const downloadedFile = files.find((file) => file.includes(filename));

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

function buildDownloadCommand(options: DownloadOptions): string {
    const { url, folderPath, filename, inTime, outTime } = options;

    let command = `yt-dlp --force-keyframes-at-cuts --download-sections "*${inTime}-${outTime}"`;

    const filePath = path.join(folderPath, `${filename}.%(ext)s`);

    command += ` -o "${filePath}"`;
    command += ` "${url}"`;

    return command;
}
