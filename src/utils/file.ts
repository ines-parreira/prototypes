import {EditorState, ContentBlock} from 'draft-js'
import _get from 'lodash/get'
import {Map} from 'immutable'

import {MAX_ATTACHMENTS_SIZE} from '../config/editor'

/**
 * Save a file like it has been downloaded.
 *
 * We simulate a click on an `a` tag to let the browser
 * captures data attached to the link and saves it as a file.
 */
export const saveFileAsDownloaded = (
    name: string,
    data: string,
    contentType?: string
) => {
    const blob = new Blob([data], {
        type: contentType || 'application/octet-stream',
    })
    const blobURL = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const {body} = document

    link.style.display = 'none'
    link.href = blobURL
    link.setAttribute('download', name)

    if (typeof link.download === 'undefined') {
        link.setAttribute('target', '_blank')
    }

    body.appendChild(link)
    link.click()
    body.removeChild(link)
    window.URL.revokeObjectURL(blobURL)
}

/**
 * Take the size in bytes and return it formatted appropriately (kB/MB)
 */
const getFormattedSize = (size: number) => {
    let formattedSize = ''
    if (size < 1000 * 1000) {
        formattedSize = `${parseInt(((size / 1000) as unknown) as string)}kB.`
    } else {
        formattedSize = `${parseInt(
            ((size / (1000 * 1000)) as unknown) as string
        )}MB.`
    }
    return formattedSize
}

/**
 * Get error text message for attachment that takes up too much space.
 */
export const getFileTooLargeError = (size: number) => {
    return `Failed to upload files. Attached files must be smaller than ${getFormattedSize(
        size
    )}`
}

/*
 * Get total file size for all images inserted in the editor
 */
const getInlineImagesSize = (editorState: EditorState): number => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let size = 0
    blocks.forEach((block) => {
        //@ts-ignore ContentBlock.findEntityRanges should have 2 arguments
        ;(block as ContentBlock).findEntityRanges((character) => {
            const key = character.getEntity()
            if (!key) {
                return false
            }
            const entity = (contentState.getEntity(key) as unknown) as Map<
                any,
                any
            >
            if (entity.get('type') === 'img') {
                const data = entity.get('data')
                size = size + (_get(data, 'size', 0) as number)
            }
            return false
        })
    })
    return size
}

/*
 * Get remaining allowed upload size
 */
export const getMaxAttachmentSize = (
    editorState: EditorState = EditorState.createEmpty(),
    attachments: Array<File> = []
): number => {
    const attachmentsSize = attachments.reduce(
        (sum, file) => sum + (file.size || 0),
        0
    )
    const inlineImagesSize = getInlineImagesSize(editorState)
    return MAX_ATTACHMENTS_SIZE - attachmentsSize - inlineImagesSize
}
