import fs from "fs";

export async function saveStream(stream: ReadableStream<Uint8Array>, filePath: string) {
    if (fs.existsSync(filePath)) {
        console.warn(`File already exists at ${filePath}`);
        return;
    }

    const writer = fs.createWriteStream(filePath);
    const reader = stream.getReader();

    const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
            writer.end();
            return;
        }
        writer.write(value);
        await pump();
    };

    await pump();
}
