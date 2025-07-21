/**
 * Check if url is a path to create a new resource
 * @param {String} url
 * @param {String} objectName Plural object name. E.g: tickets, customers
 * @returns {boolean}
 */
export function isCreationUrl(url: string, objectName: string) {
    return url.includes(`app/${objectName}/new`)
}

export function isSearchUrl(url: string, objectName: string) {
    return url.includes(`app/${objectName}/search`)
}
