export type SheetData = {
    url: string;
    inTime: string;
    outTime: string;
};

export type VideoInfo = {
    title: string;
    uploader: string;
    timestamp: number;
    ext: string;
    duration_string: string;
};

export type ClipRange = { inTimeSeconds: number; outTimeSeconds: number; inTime: string; outTime: string };
export type Clip = VideoInfo & ClipRange & SheetData;

export interface EditOptions {
    clips: Clip[];
    folderPath: string;
    output: string;
}

export type DownloadOptions = {
    folderPath: string;
    filename: string;
} & Clip;
