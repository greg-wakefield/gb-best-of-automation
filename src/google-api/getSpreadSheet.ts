import { GoogleAuth, AuthClient } from "google-auth-library";
import { getGoogleAuth } from "./getGoogleAuth";

export async function getSpreadSheet(spreadsheetId: string, auth: GoogleAuth<AuthClient> = getGoogleAuth()) {
    const client = await auth.getClient();
    return await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    });
}
