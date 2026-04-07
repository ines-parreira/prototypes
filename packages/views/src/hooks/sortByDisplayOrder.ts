export function sortByDisplayOrder<T extends { id?: number }>(
    items: T[],
    orderingMap: Record<string, { display_order: number }> | undefined,
): T[] {
    return [...items].sort(
        (a, b) =>
            (orderingMap?.[String(a.id)]?.display_order ?? Infinity) -
            (orderingMap?.[String(b.id)]?.display_order ?? Infinity),
    )
}
