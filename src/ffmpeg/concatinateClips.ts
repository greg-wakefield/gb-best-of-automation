import Ffmpeg from "fluent-ffmpeg";
import path from "path";

import { EditOptions } from "./types";
import logger from "../winston";

export async function concatinateClips({ folderPath, output }: EditOptions, clips: string[]): Promise<void> {
    try {
        logger.info("Starting concatenation of clips...");
        await new Promise<void>((resolve, reject) => {
            const command = Ffmpeg();

            clips.forEach((file) => {
                command.input(file);
            });

            command
                .on("error", reject)
                .on("end", () => resolve())
                .mergeToFile(path.join(folderPath, output), folderPath);
        });
    } catch (error) {
        logger.error("Error during concatenation:", { error });
        throw error;
    }
}
