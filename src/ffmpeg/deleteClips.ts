import fs from "fs";

export async function deleteClips(files: string[]): Promise<void> {
    files.forEach((file) => fs.unlinkSync(file));
}
