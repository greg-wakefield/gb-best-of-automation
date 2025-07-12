import { VideoInfo } from "../yt-dlp/types";

export type ClipRange = { start: number; end: number; startHHMMSS: string; endHHMMSS: string };
export type Options = {
    [key: string]: { timestamps: ClipRange[]; url: string } & VideoInfo;
};

export interface EditOptions {
    options: Options;
    folderPath: string;
    output: string;
}
