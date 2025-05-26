type Item = {
  fields: any;
  Title: string;
  field_3: string;
  field_1: string;
  // 他のフィールドがあれば追加
};

export function aggregateItems(items: Item[]) {
    console.log(items[0]);

  const result: Record<string, Record<string, Record<string, number>>> = {};
  items.forEach(item => {
    const title = item.fields?.Title || 'undefined';
    const field3 = item.fields?.field_3 || 'undefined';
    const field1 = item.fields?.field_1 || 'undefined';

    if (!result[title]) {
      result[title] = {};
    }
    if (!result[title][field3]) {
      result[title][field3] = {};
    }
    if (!result[title][field3][field1]) {
      result[title][field3][field1] = 0;
    }
    result[title][field3][field1]++;
  });

  return result;
}
