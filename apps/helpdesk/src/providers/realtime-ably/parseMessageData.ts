export function parseMessageData(data: unknown): unknown {
    if (typeof data !== 'string') return data

    try {
        return JSON.parse(data)
    } catch {
        return undefined
    }
}
