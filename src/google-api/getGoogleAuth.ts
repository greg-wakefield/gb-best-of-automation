import { AuthClient, GoogleAuth } from "google-auth-library";
import { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } from "../environment";

let auth: GoogleAuth<AuthClient>;
export function getGoogleAuth() {
    if (auth) {
        return auth;
    }

    auth = new GoogleAuth({
        credentials: {
            client_email: GOOGLE_CLIENT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    return auth;
}
