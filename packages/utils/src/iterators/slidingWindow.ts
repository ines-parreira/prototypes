export function* slidingWindow<T>(
    items: T[],
): Generator<[current: T, previous: T | undefined], void> {
    for (let i = 0; i < items.length; i++) {
        yield [items[i], items[i - 1]]
    }
}
