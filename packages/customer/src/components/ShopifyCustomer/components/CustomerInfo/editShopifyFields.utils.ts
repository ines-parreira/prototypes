export function reorderArray<T>(
    array: T[],
    fromIndex: number,
    toIndex: number,
): T[] {
    const result = [...array]
    const [item] = result.splice(fromIndex, 1)
    result.splice(toIndex, 0, item)
    return result
}
