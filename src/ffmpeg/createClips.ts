import path from "path";
import Ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";

import { EditOptions } from "./types";
import { FONT_PATH } from "../environment";
import logger from "../winston";

export async function createClips({ options, folderPath }: EditOptions) {
    const tempFiles: string[] = [];
    try {
        for (const [filename, clips] of Object.entries(options)) {
            const inputPath = path.join(folderPath, `${filename}.mp4`);
            logger.info(`Processing video: ${filename}`);

            for (const [index, clip] of clips.timestamps.entries()) {
                const tempOutput = path.join(folderPath, `clip_${uuidv4()}.mp4`);
                const duration = clip.end - clip.start;
                await new Promise<void>((resolve, reject) => {
                    Ffmpeg(inputPath)
                        .setStartTime(clip.start)
                        .setDuration(duration)
                        // .videoFilters(
                        //     index === 0
                        //         ? [
                        //               `drawtext=fontfile=${FONT_PATH}:text=${clips.name}:fontcolor=white:fontsize=64:box=1:boxcolor=black@0.5:boxborderw=5:x=50:y=h-(text_h*4):enable='lt(t,5)':alpha='if(lt(t,1),t,if(lt(t,4),1,if(lt(t,5),5-t,0)))'`,
                        //           ]
                        //         : []
                        // )
                        .outputOptions("-codec:a", "copy")
                        .output(tempOutput)
                        .on("end", () => {
                            tempFiles.push(tempOutput);
                            resolve();
                        })
                        .on("error", (error) => reject(`Error processing video clip ${filename}: ${error.message}`))
                        .run();
                });
            }
        }
    } catch (error) {
        logger.error("Error creating clips:", { error });
        throw error;
    }

    if (tempFiles.length === 0) {
        throw new Error("No clips were generated, nothing to concatenate.");
    }

    return tempFiles;
}
