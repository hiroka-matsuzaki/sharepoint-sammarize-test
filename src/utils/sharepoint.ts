import axios from 'axios';

export async function fetchAllItems(siteId: string, listName: string, accessToken: string) {
  let allItems: any[] = [];
  let url = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items?expand=fields&top=100`;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  while (url) {
    const response = await axios.get(url, { headers });
    allItems = allItems.concat(response.data.value);
    url = response.data['@odata.nextLink'] || null;
  }

  return allItems;
}

export async function upsertAggregateResults(
  siteId: string,
  listId: string,
  accessToken: string,
  aggregatedData: Record<string, Record<string, Record<string, number>>>
) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly',
  };

  const tasks = Object.entries(aggregatedData).flatMap(([title, field3Obj]) =>
    Object.entries(field3Obj).map(([field3, field1Obj]) => {
      return (async () => {
        const filter = `fields/Title eq '${title}' and fields/bumon eq '${field3}'`;
        const getUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$filter=${encodeURIComponent(filter)}&expand=fields`;

        let existingItem;

        try {
          const axiosConfig = { headers, timeout: 10000 }; // 10秒
          const response = await axios.get(getUrl,axiosConfig);
          existingItem = response.data.value?.[0];
        } catch (error: any) {
          console.error('❌ Graph API リスト取得エラー:', error.response?.data || error.message || error);
          return;
        }

        const fields: Record<string, any> = {
          Title: title,
          bumon: field3,
        };

        for (const [field1, count] of Object.entries(field1Obj)) {
          const fieldKey = field1 === '00' ? 'status_00'
                        : field1 === '10' ? 'status_10'
                        : field1 === '20' ? 'status_20'
                        : null;

          if (fieldKey) {
            fields[fieldKey] = count;
          }
        }

        try {
          if (existingItem) {
            const patchUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items/${existingItem.id}/fields`;
            await axios.patch(patchUrl, fields, { headers });
            console.log(`✅ Updated item: Title=${title}, bumon=${field3}`);
          } else {
            const postUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items`;
            await axios.post(postUrl, { fields }, { headers });
            console.log(`🆕 Created item: Title=${title}, bumon=${field3}`);
          }
        } catch (error: any) {
          console.error('❌ Graph API 書き込みエラー:', error.response?.data || error.message || error);
        }
      })();
    })
  );

  await Promise.all(tasks);
}
