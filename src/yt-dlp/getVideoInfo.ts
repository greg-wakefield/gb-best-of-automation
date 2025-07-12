import logger from "../winston";
import { execAsync } from "./downloadVideo";
import { VideoInfo } from "./types";

const videoInfoCache = new Map<string, Promise<VideoInfo>>();
export async function getVideoInfo(url: string): Promise<VideoInfo> {
    try {
        if (videoInfoCache.has(url)) {
            logger.verbose(`Cache hit for ${url}`);
            return await videoInfoCache.get(url)!;
        }

        //--print-json seems slow and title sometimes has " or ' "
        const command = `yt-dlp --print "%(title)s|-|-|-|%(uploader)s|-|-|-|%(timestamp)s|-|-|-|%(ext)s|-|-|-|%(duration_string)s" "${url}"`;

        const requestPromise = execAsync(command)
            .then((result) => {
                const [title, uploader, timestamp, ext, duration_string] = result.stdout.trim().split("|-|-|-|");
                return {
                    title,
                    uploader,
                    timestamp: parseInt(timestamp),
                    ext,
                    duration_string,
                } as VideoInfo;
            })
            .catch((error) => {
                videoInfoCache.delete(url);
                throw new Error(`Failed to get video info: ${error}`);
            });

        videoInfoCache.set(url, requestPromise);
        return await requestPromise;
    } catch (error) {
        throw error;
    }
}
