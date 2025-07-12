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
