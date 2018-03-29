/**
 * Save a file like it has been downloaded.
 *
 * We simulate a click on an `a` tag to let the browser
 * captures data attached to the link and saves it as a file.
 *
 * @param {String} data - Date to save
 * @param {String} filename - Name of the file to save
 * @param {String} contentType - content type of the file to save
 */
export const saveFileAsDownloaded = (data, filename, contentType) => {
    const blob = new Blob([data], {type: contentType || 'application/octet-stream'})
    const blobURL = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const body = document.body || document.html || document

    link.style.display = 'none'
    link.href = blobURL
    link.setAttribute('download', filename)

    if (typeof link.download === 'undefined') {
        link.setAttribute('target', '_blank')
    }

    body.appendChild(link)
    link.click()
    body.removeChild(link)
    window.URL.revokeObjectURL(blobURL)
}
