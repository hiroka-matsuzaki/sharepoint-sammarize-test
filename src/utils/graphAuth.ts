import axios from "axios";

export async function get_accessToken() {
    try {
        const params = new URLSearchParams({
            grant_type: 'client_credentials',
            scope: 'https://graph.microsoft.com/.default',
            client_id: process.env.CLIENT_ID!,
            client_secret: process.env.CLIENT_SECRET!
        }).toString();


        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const token_response = await axios.post(
            `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
            params,
            config
        );
        return token_response.data.access_token;
    } catch (error: any) {
        console.error("Error get_accessToken:", error?.response?.data || error.message || error);
        throw error; // 必ず再throwして呼び出し元に知らせる
    }
}
