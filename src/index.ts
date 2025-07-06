import { GB_API_KEY, CHUNK_SIZE } from "./environment";
import * as fs from "fs";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";

ffmpeg.setFfmpegPath("./ffmpeg/bin/ffmpeg");
ffmpeg.setFfprobePath("./ffmpeg/bin/ffprobe");

interface GbVideoInfo {
    hd_url?: string;
    // Add other fields from the API response as needed
}

async function getGbVideoInfo(guid: string): Promise<GbVideoInfo | null> {
    const url = `https://www.giantbomb.com/api/video/${guid}/?api_key=${GB_API_KEY}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch video info: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    console.log(`Fetched video info for GUID ${guid}:`, jsonResponse);
    return jsonResponse.results;
}

async function downloadGbVideo(videoUrl: string): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(videoUrl);
    console.log(`Fetching video from: ${videoUrl}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    return response.body;
}

async function saveStream(stream: ReadableStream<Uint8Array>, filePath: string) {
    const writer = fs.createWriteStream(filePath);
    const reader = stream.getReader();

    const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
            writer.end();
            return;
        }
        writer.write(value);
        await pump();
    };

    await pump();
}

async function downloadAndSave(guid: string, filePath: string) {
    const videoInfo = await getGbVideoInfo(guid);
    if (videoInfo && videoInfo.hd_url) {
        const stream = await downloadGbVideo(videoInfo.hd_url);
        if (stream) {
            await saveStream(stream, filePath);
            console.log(`Downloaded and saved to ${filePath}`);
        }
    } else {
        console.error("Could not get video information or hd_url is missing.");
    }
}

const downloadPath = "C:/Users/grego/Downloads/";
const guids = ["wyf8JlupuJM", "sY8bjOYS3D0"];

async function runDownloads() {
    for (let i = 0; i < guids.length; i += CHUNK_SIZE) {
        const guidsChunk = guids.slice(i, i + CHUNK_SIZE);
        const promises: Promise<void>[] = [];
        guidsChunk.forEach((guid) => {
            const filePath = path.join(downloadPath, `${guid}.mp4`);
            promises.push(downloadAndSave(guid, filePath));
        });
        await Promise.all(promises);
    }
}

type ClipRange = { start: number; end: number };
type Options = Record<string, ClipRange[]>;

interface EditOptions {
    options: Options;
    folderPath: string;
    output: string;
}

export async function editVideos({ options, folderPath, output }: EditOptions): Promise<void> {
    const tempFiles: string[] = [];

    for (const [filename, clips] of Object.entries(options)) {
        const inputPath = path.join(folderPath, `${filename}.mp4`);

        for (const clip of clips) {
            const tempOutput = path.join(folderPath, `clip_${uuidv4()}.mp4`);
            await new Promise<void>((resolve, reject) => {
                ffmpeg(inputPath)
                    .setStartTime(clip.start)
                    .setDuration(clip.end - clip.start)
                    .output(tempOutput)
                    .on("end", () => {
                        tempFiles.push(tempOutput);
                        resolve();
                    })
                    .on("error", reject)
                    .run();
            });
        }
    }

    const concatListPath = path.join(folderPath, `concat_list_${uuidv4()}.txt`);
    const concatText = tempFiles.map((file) => `file '${file}'`).join("\n");
    fs.writeFileSync(concatListPath, concatText);

    await new Promise<void>((resolve, reject) => {
        ffmpeg()
            .input(concatListPath)
            .inputOptions("-f", "concat", "-safe", "0")
            .outputOptions("-c", "copy")
            .output(path.join(folderPath, output))
            .on("end", () => resolve())
            .on("error", reject)
            .run();
    });

    // Cleanup temp files
    tempFiles.forEach((file) => fs.unlinkSync(file));
    fs.unlinkSync(concatListPath);
}

editVideos({
    options: {
        wyf8JlupuJM: [{ start: 10, end: 20 }],
        sY8bjOYS3D0: [
            { start: 5, end: 15 },
            { start: 30, end: 40 },
        ],
    },
    folderPath: downloadPath,
    output: "final_output.mp4",
})
    .then(console.log)
    .catch(console.error);
