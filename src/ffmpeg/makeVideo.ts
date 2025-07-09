import { concatinateClips } from "./concatinateClips";
import { createClips } from "./createClips";
import { deleteClips } from "./deleteClips";
import { EditOptions } from "./types";

export async function makeVideo(options: EditOptions) {
    const clips = await createClips(options);
    await concatinateClips(options, clips);
    await deleteClips(clips);
}
