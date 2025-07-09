import { GoogleAuth, AuthClient } from "google-auth-library";
import { getGoogleAuth } from "./getGoogleAuth";
import { SheetData } from "./types";

export async function getSheet(spreadsheetId: string, sheetName: string, auth: GoogleAuth<AuthClient> = getGoogleAuth()) {
    const client = await auth.getClient();
    const range = `${sheetName}!A1:Z1000`;
    const res = await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`,
    });

    const data = res.data as { values: unknown[][] };

    if (!data || !data.values) {
        throw new Error("No data found in the specified sheet.");
    }

    return data.values;
}
