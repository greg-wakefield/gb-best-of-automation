import {
    BEGIN_PUBLISH_DATE_DAYS,
    CHANNEL_NAME,
    END_PUBLISH_DATE_DAYS,
    MAX_CLIP_DURATION_SECONDS,
    MIN_CLIP_DURATION_SECONDS,
} from "../environment";
import { SheetData } from "../google-api";
import logger from "../winston";
import { ClipRange, Options } from "./types";
import { getVideoInfo } from "../yt-dlp/getVideoInfo";
import { isDate } from "util/types";

function convertToSeconds(hours: number, minutes: number, seconds: number): number {
    return hours * 3600 + minutes * 60 + seconds;
}

function getYoutubeIdFromUrl(url: string): string | null {
    try {
        const urlObject = new URL(url);
        const searchParams = new URLSearchParams(urlObject.search);
        return searchParams.get("v");
    } catch (error) {
        logger.error("Invalid URL:", { error, url });
        return null;
    }
}

export function getYoutubeIdFromUrls(urls: Set<string>) {
    const guids: Set<string> = new Set();
    urls.forEach((url) => {
        const videoId = getYoutubeIdFromUrl(url);
        if (videoId) {
            guids.add(videoId);
        }
    });
    return guids;
}

function mergeOverlappingClips(clips: ClipRange[]): ClipRange[] {
    if (clips.length <= 1) {
        return clips;
    }

    const sortedClips = clips.sort((a, b) => a.start - b.start);

    const mergedClips: ClipRange[] = [sortedClips[0]];

    for (let i = 1; i < sortedClips.length; i++) {
        const lastMergedClip = mergedClips[mergedClips.length - 1];
        const currentClip = sortedClips[i];

        if (currentClip.start < lastMergedClip.end) {
            let end: string;
            if (lastMergedClip.end > currentClip.end) {
                end = lastMergedClip.endHHMMSS;
            } else {
                end = currentClip.endHHMMSS;
            }

            lastMergedClip.end = Math.max(lastMergedClip.end, currentClip.end);
            lastMergedClip.endHHMMSS = end;
        } else {
            mergedClips.push(currentClip);
        }
    }

    return mergedClips;
}

function validateAndParseTime(timeString: string) {
    const time = parseInt(timeString);
    if (isNaN(time)) {
        logger.error("Invalid time format:", { timeString });
        throw new Error(`Invalid time format: ${timeString}`);
    }
    return time;
}

export async function processSheetData(
    sheetData: SheetData[],
    minClipDurationSeconds = MIN_CLIP_DURATION_SECONDS,
    maxClipDurationSeconds = MAX_CLIP_DURATION_SECONDS
): Promise<Options> {
    const intermediateClips: { [key: string]: ClipRange[] } = {};
    const options: Options = {};

    for (let i = 0; i < sheetData.length; i += 5) {
        const chunk = sheetData.slice(i, i + 5);
        await Promise.all(
            chunk.map(async (row) => {
                try {
                    const videoInfo = await getVideoInfo(row.url);

                    if (!videoInfo) {
                        return;
                    }

                    if (
                        !videoInfo.uploader
                            .toLowerCase()
                            .replace(/ /gm, "")
                            .includes(CHANNEL_NAME.toLowerCase().replace(/ /gm, ""))
                    ) {
                        logger.warn("Video uploader does not match channel name:", {
                            expected: CHANNEL_NAME,
                            actual: videoInfo.uploader,
                        });
                        return;
                    }

                    const [inHours, inMinutes, inSeconds] = row.inTime.split(":").map((time) => validateAndParseTime(time));
                    const [outHours, outMinutes, outSeconds] = row.outTime.split(":").map((time) => validateAndParseTime(time));
                    const start = convertToSeconds(inHours, inMinutes, inSeconds);
                    const end = convertToSeconds(outHours, outMinutes, outSeconds);

                    if (start < 0 || end < 0 || start >= end) {
                        logger.warn("Invalid clip range:", {
                            url: row.url,
                            start,
                            end,
                            inTime: row.inTime,
                            outTime: row.outTime,
                        });
                        return;
                    }

                    const { duration_string, timestamp } = videoInfo;

                    if (!timestamp || !duration_string) {
                        logger.warn("Missing video info:", { url: row.url, videoInfo });
                        return;
                    }

                    const durations = duration_string.split(":").map((time) => validateAndParseTime(time));

                    let videoHours = 0;
                    let videoMinutes = 0;
                    let videoSeconds = 0;

                    switch (durations.length) {
                        case 3:
                            videoHours = durations[0];
                        case 2:
                            videoMinutes = durations[durations.length - 2];
                        case 1:
                            videoSeconds = durations[durations.length - 1];
                            break;
                        default:
                            logger.warn("Unexpected duration format:", { url: row.url, duration_string });
                            return;
                    }

                    const videoLengthSeconds = convertToSeconds(videoHours, videoMinutes, videoSeconds);

                    if (start >= videoLengthSeconds || end >= videoLengthSeconds) {
                        logger.warn("Clip range exceeds video length:", {
                            url: row.url,
                            start,
                            end,
                            videoLengthSeconds,
                        });
                        return;
                    }

                    const publishDate = new Date(videoInfo.timestamp * 1000);

                    if (!publishDate || !isDate(publishDate)) {
                        logger.warn("Invalid publish date for video:", { url: row.url, publishDate });
                        return;
                    }

                    const beginPublishDate = new Date();
                    beginPublishDate.setDate(beginPublishDate.getDate() - BEGIN_PUBLISH_DATE_DAYS);
                    const endPublishDate = new Date();
                    endPublishDate.setDate(endPublishDate.getDate() - END_PUBLISH_DATE_DAYS);

                    if (publishDate < beginPublishDate || publishDate > endPublishDate) {
                        logger.warn("Skipping clip due to publish date:", {
                            title: videoInfo.title,
                            publishDate,
                            beginPublishDate,
                            endPublishDate,
                        });
                        return;
                    }

                    const duration = end - start;
                    if (duration > maxClipDurationSeconds || duration < minClipDurationSeconds) {
                        logger.warn("Clip duration out of bounds:", {
                            url: row.url,
                            start,
                            end,
                            duration,
                            minClipDurationSeconds,
                            maxClipDurationSeconds,
                        });
                        return;
                    }

                    if (!intermediateClips[row.url]) {
                        intermediateClips[row.url] = [];
                        options[row.url] = { ...videoInfo, url: row.url, timestamps: [] };
                    }

                    intermediateClips[row.url].push({ start, end, startHHMMSS: row.inTime, endHHMMSS: row.outTime });
                } catch (error) {
                    logger.error("Error processing row:", { error, row });
                    return;
                }
            })
        );
    }

    for (const url in intermediateClips) {
        const merged = mergeOverlappingClips(intermediateClips[url]);
        options[url].timestamps = merged;
    }

    return options;
}
