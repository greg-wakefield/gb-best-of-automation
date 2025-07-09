import { GbVideoInfo } from "../gb-api";

export type ClipRange = { start: number; end: number };
export type Options = {
    [key: string]: { timestamps: ClipRange[] } & GbVideoInfo;
};

export interface EditOptions {
    options: Options;
    folderPath: string;
    output: string;
}
