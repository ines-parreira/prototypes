export function ensureHTTPS(url = ''): string {
    if (url.startsWith('https://') || url.startsWith('/')) {
        return url
    }
    if (url.match(/^https?((:\/?\/?)|(:?\/?\/)){1}/i)) {
        return url.replace(/^https?((:\/?\/?)|(:?\/?\/)){1}/i, 'https://')
    }
    return 'https://' + url
}
