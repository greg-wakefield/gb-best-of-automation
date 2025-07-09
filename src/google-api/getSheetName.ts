export function getWeek() {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const year = lastWeek.getFullYear();
    const week = getWeekOfYear(lastWeek);

    return `Week-${week}-${year}`;
}

function getWeekOfYear(date: Date): number {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
    return week;
}
