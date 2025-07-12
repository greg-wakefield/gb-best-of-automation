export interface VideoInfo {
    title: string;
    uploader: string;
    timestamp: number;
    ext: string;
    duration_string: string;
}

export interface DownloadOptions {
    folderPath: string;
    filename: string;
    startTime: string;
    endTime: string;
}
