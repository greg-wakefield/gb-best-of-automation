import { GB_API_KEY } from "../environment";
import { GbVideoInfo } from "./types";

export async function getGbVideoInfo(guid: string) {
    const url = `https://www.giantbomb.com/api/video/${guid}/?api_key=${GB_API_KEY}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch video info: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse.results;
}

export async function getGbVideos(): Promise<GbVideoInfo[]> {
    const url = `https://www.giantbomb.com/api/videos/?api_key=${GB_API_KEY}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch video info: ${response.statusText}`);
    }
    const jsonResponse = await response.json();

    return jsonResponse.results;
}
