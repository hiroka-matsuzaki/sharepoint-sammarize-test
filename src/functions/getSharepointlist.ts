import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { get_accessToken } from "../utils/graphAuth";
import { fetchAllItems, upsertAggregateResults } from "../utils/sharepoint";
import { aggregateItems } from "../utils/summarize";

// SharePoint サイトのホスト名とパス
const sharepointHostname = "hirokabiz.sharepoint.com"; // ← 例: contoso.sharepoint.com
const sitePath = "/sites/kojinjouhou_test";               // ← 例: /sites/hr-site
const listName = "Book1";
const summaryListName = "summary";                      // ← リストの「表示名」

export async function getListItems(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const token = await get_accessToken();

        const siteRes = await axios.get(
            `https://graph.microsoft.com/v1.0/sites/${sharepointHostname}:${sitePath}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const siteId = siteRes.data.id;

        const listItemsRes = await fetchAllItems(siteId, listName, token);
        const summarizeList = aggregateItems(listItemsRes)
        await upsertAggregateResults(siteId,summaryListName,token,summarizeList)
        return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            totalCount: listItemsRes.length,
            summary: summarizeList
        }, null, 2)
        };
    } catch (error: any) {
        context.error(error);
        return {
            status: 500,
            body: `エラーが発生しました: ${error.message || error}`
        };
    }
}

app.http('getListItems', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getListItems
});
