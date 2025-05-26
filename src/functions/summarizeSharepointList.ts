import { app, InvocationContext, Timer } from "@azure/functions";
import { get_accessToken } from "../utils/graphAuth";
import axios from "axios";
import { fetchAllItems, upsertAggregateResults } from "../utils/sharepoint";
import { aggregateItems } from "../utils/summarize";

const sharepointHostname = "hirokabiz.sharepoint.com";
const sitePath = "/sites/kojinjouhou_test";
const listName = "Book1";
const summaryListName = "summary";

export async function summarizeSharepointList(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer trigger function executed.');

    try {
        const token = await get_accessToken();

        const siteRes = await axios.get(
            `https://graph.microsoft.com/v1.0/sites/${sharepointHostname}:${sitePath}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const siteId = siteRes.data.id;

        const listItemsRes = await fetchAllItems(siteId, listName, token);
        const summarizeList = aggregateItems(listItemsRes);
        await upsertAggregateResults(siteId, summaryListName, token, summarizeList);

        context.log(`処理完了: 集計件数=${listItemsRes.length}`);
    } catch (error: any) {
        context.error('エラー発生:', error);
    }
}

app.timer('summarizeSharepointList', {
    schedule: '0 0 23 * * 0-4', // UTCの日曜〜木曜23時 → JSTの月曜〜金曜8時
    handler: summarizeSharepointList
});
