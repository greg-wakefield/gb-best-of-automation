import { concatinateClips } from "./concatinateClips";
import { createClips } from "./createClips";
import { EditOptions } from "./types";

export async function makeVideo(options: EditOptions) {
    const clips = await createClips(options);
    await concatinateClips(options, clips);
}
