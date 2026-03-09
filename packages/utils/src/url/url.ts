import _trim from 'lodash/trim'

// An improved version of encodeURIComponent that also encodes !, ', (, ), and *
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_rfc3986
export function encodeRFC3986URIComponent(str: string): string {
    return encodeURIComponent(str).replace(
        /[!'()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    )
}

export function ensureHTTPS(url = ''): string {
    if (url.startsWith('https://') || url.startsWith('/')) {
        return url
    }
    if (url.match(/^https?((:\/?\/?)|(:?\/?\/)){1}/i)) {
        return url.replace(/^https?((:\/?\/?)|(:?\/?\/)){1}/i, 'https://')
    }
    return 'https://' + url
}

export function attachSearchParamsToUrl(
    baseUrl: string,
    params: Record<string, string> = {},
): string {
    try {
        const url = new URL(baseUrl)

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(
                _trim(key),
                encodeRFC3986URIComponent(_trim(value)),
            )
        })

        return decodeURI(url.toString())
    } catch (err) {
        console.error(err)

        return decodeURI(baseUrl)
    }
}
