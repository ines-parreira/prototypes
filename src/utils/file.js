// @flow
import {EditorState} from 'draft-js'
import _get from 'lodash/get'

import {MAX_ATTACHMENTS_SIZE} from '../config/editor'

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
export const saveFileAsDownloaded = (data: string, filename: string, contentType: string) => {
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

    // $FlowFixMe
    body.appendChild(link)
    link.click()
    // $FlowFixMe
    body.removeChild(link)
    window.URL.revokeObjectURL(blobURL)
}

/**
 * Notify when attachments take up too much space.
 */
const humanSize = parseInt(MAX_ATTACHMENTS_SIZE / 1000000)
export const ATTACHMENT_SIZE_ERROR = {
    status: 'error',
    message: `Failed to upload files. Attached files must be smaller than ${humanSize}MB.`
}

/*
 * Get total file size for all images inserted in the editor
 */
const getInlineImagesSize = (editorState: EditorState): number => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let size = 0
    blocks.forEach((block) => {
        block.findEntityRanges(
            (character) => {
                const key = character.getEntity()
                if (!key) {
                    return false
                }
                const entity = contentState.getEntity(key)
                if (entity.get('type') === 'img') {
                    const data = entity.get('data')
                    size = size + _get(data, 'size', 0)
                }
                return false
            }
        )
    })
    return size
}

/*
 * Get remaining allowed upload size
 */
export const getMaxAttachmentSize = (editorState: EditorState = EditorState.createEmpty(), attachments: Array<File> = []): number => {
    const attachmentsSize = attachments.reduce((sum, file) => sum + (file.size || 0), 0)
    const inlineImagesSize = getInlineImagesSize(editorState)
    return MAX_ATTACHMENTS_SIZE - attachmentsSize - inlineImagesSize
}
