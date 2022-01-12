export function ensureHTTPS(url = ''): string {
    if (url.startsWith('https://') || url.startsWith('/')) {
        return url
    }
    // We don’t want to match httpbin.org here
    // So we make sure that http is either followed by : or /
    if (url.match(/^https?((:\/?\/?)|(:?\/?\/)){1}/i)) {
        return url.replace(/^https?((:\/?\/?)|(:?\/?\/)){1}/i, 'https://')
    }
    return 'https://' + url
}
