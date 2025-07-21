export function split_url(url: string): [string, string] {
    let base_url = url.replace('http://', '').replace('https://', '')
    const first_q = base_url.indexOf('?')
    if (first_q > 0) {
        base_url = base_url.slice(0, first_q)
    }
    let last_slash = base_url.lastIndexOf('/')
    if (last_slash === base_url.length - 1) {
        base_url = base_url.slice(0, last_slash)
        last_slash = base_url.lastIndexOf('/')
    }
    const store_url = base_url.slice(0, last_slash)
    const suffix = base_url.slice(last_slash + 1, base_url.length)
    return [store_url, suffix]
}
