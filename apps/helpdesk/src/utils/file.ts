import type { ContentBlock } from 'draft-js'
import { EditorState } from 'draft-js'
import type { Map } from 'immutable'
import _get from 'lodash/get'

import { MAX_ATTACHMENTS_SIZE } from '../config/editor'

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
            const entity = contentState.getEntity(key) as unknown as Map<
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
    attachments: Array<File> = [],
): number => {
    const attachmentsSize = attachments.reduce(
        (sum, file) => sum + (file.size || 0),
        0,
    )
    const inlineImagesSize = getInlineImagesSize(editorState)
    return MAX_ATTACHMENTS_SIZE - attachmentsSize - inlineImagesSize
}
