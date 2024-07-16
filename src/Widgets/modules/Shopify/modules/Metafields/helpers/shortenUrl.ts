export function shortenUrl(url: string) {
    const result = url.replace(/(^\w+:|^)\/\//, '')
    return url
        ? result.length > 20
            ? `${result.slice(0, 20)}...`
            : result
        : undefined
}
