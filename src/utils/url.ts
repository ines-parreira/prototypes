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

export function attachSearchParamsToUrl(
    baseUrl: string,
    params: Record<string, string> = {}
): string {
    try {
        const url = new URL(baseUrl)

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value)
        })

        return url.toString()
    } catch (err) {
        console.error(err)

        return baseUrl
    }
}
