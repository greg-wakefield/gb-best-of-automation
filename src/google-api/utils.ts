export function arrayToObjects<T>(arr: any[][]): T[] {
    if (!arr || arr.length < 1) {
        return [];
    }
    const keys = arr[0];
    const dataRows = arr.slice(1);
    return dataRows.map((row) => {
        const obj: Record<string, any> = {};
        keys.forEach((key, i) => {
            obj[key] = row[i];
        });
        return obj as T;
    });
}
export function getUniqueUrls(sheetData: any[][]) {
    return sheetData.slice(1).reduce((acc, row) => acc.add(row[0]), new Set<string>());
}
