export function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {}
}

export function getString(
    record: Record<string, unknown>,
    key: string,
): string | null {
    const value = record[key]

    return typeof value === 'string' && value.length > 0 ? value : null
}

export function getStringLike(
    record: Record<string, unknown>,
    key: string,
): string | undefined {
    const value = record[key]

    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : undefined
}
