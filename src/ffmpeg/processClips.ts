import { time } from "console";
import {
    BEGIN_PUBLISH_DATE_DAYS,
    END_PUBLISH_DATE_DAYS,
    MAX_CLIP_DURATION_SECONDS,
    MIN_CLIP_DURATION_SECONDS,
} from "../environment";
import { GbVideoInfo } from "../gb-api";
import { SheetData } from "../google-api";
import logger from "../winston";
import { ClipRange, Options } from "./types";

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
            lastMergedClip.end = Math.max(lastMergedClip.end, currentClip.end);
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

export function processSheetData(
    sheetData: SheetData[],
    gbData: GbVideoInfo[],
    minClipDurationSeconds = MIN_CLIP_DURATION_SECONDS,
    maxClipDurationSeconds = MAX_CLIP_DURATION_SECONDS
): Options {
    const intermediateClips: { [key: string]: ClipRange[] } = {};

    sheetData.forEach((row) => {
        try {
            const youtubeId = getYoutubeIdFromUrl(row.youtubeLink);

            if (!youtubeId) {
                return;
            }

            const [inHours, inMinutes, inSeconds] = row.inTime.split(":").map((time) => validateAndParseTime(time));
            const [outHours, outMinutes, outSeconds] = row.outTime.split(":").map((time) => validateAndParseTime(time));
            const start = convertToSeconds(inHours, inMinutes, inSeconds);
            const end = convertToSeconds(outHours, outMinutes, outSeconds);

            const videoInfo = gbData.find((video) => video.youtube_id === youtubeId);
            if (
                !videoInfo ||
                (videoInfo?.length_seconds && (start > videoInfo.length_seconds || end > videoInfo.length_seconds))
            ) {
                return;
            }

            const { publish_date } = videoInfo;
            if (publish_date) {
                const publishDate = new Date(publish_date);
                const beginPublishDate = new Date();
                beginPublishDate.setDate(beginPublishDate.getDate() - BEGIN_PUBLISH_DATE_DAYS);
                const endPublishDate = new Date();
                endPublishDate.setDate(endPublishDate.getDate() - END_PUBLISH_DATE_DAYS);

                if (publishDate < beginPublishDate || publishDate > endPublishDate) {
                    logger.verbose("Skipping clip due to publish date:", {
                        name: videoInfo.name,
                        youtubeId,
                        publishDate,
                        beginPublishDate,
                        endPublishDate,
                    });
                    return;
                }
            }

            if (start >= end) {
                return;
            }

            const duration = end - start;
            if (duration > maxClipDurationSeconds || duration < minClipDurationSeconds) {
                return;
            }

            if (!intermediateClips[youtubeId]) {
                intermediateClips[youtubeId] = [];
            }
            intermediateClips[youtubeId].push({ start, end });
        } catch (error) {
            logger.error("Error processing row:", { error, row });
            return;
        }
    });

    const options: Options = {};

    for (const youtubeId in intermediateClips) {
        const videoInfo = gbData.find((video) => video.youtube_id === youtubeId);
        if (videoInfo && videoInfo.name) {
            const merged = mergeOverlappingClips(intermediateClips[youtubeId]);
            options[youtubeId] = {
                timestamps: merged,
                ...videoInfo,
            };
        }
    }

    return options;
}
