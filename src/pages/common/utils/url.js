/**
 * Check if url is a path to create a new resource
 * @param {String} url
 * @param {String} objectName Plural object name. E.g: tickets, users
 * @returns {boolean}
 */
export function isCreationUrl(url, objectName) {
    return url.includes(`app/${objectName}/new`)
}
