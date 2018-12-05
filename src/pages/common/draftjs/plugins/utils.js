// @flow
import {EditorState, AtomicBlockUtils, SelectionState, Modifier, ContentBlock, RichUtils} from 'draft-js'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import _get from 'lodash/get'

import {uploadFiles} from '../../../../utils'
import {ATTACHMENT_SIZE_ERROR, getMaxAttachmentSize} from '../../../../utils/file'
import {DEFAULT_IMAGE_WIDTH} from '../../../../config/editor'

import type {ContentState} from 'draft-js'
import type {PluginMethods} from './types'

const uploadPicture = (file) => {
    return uploadFiles([file])
        .then((files) => files[0])
        .catch((error) => {
            let errorMessage = fromJS(error.response).getIn(['data', 'error', 'msg'])

            if (!errorMessage) {
                errorMessage = error.response.status === 413
                    ? 'Failed to upload files. One or more files are larger than the size limit of 10MB.'
                    : 'Failed to upload files. Please try again later.'
            }

            return Promise.reject({
                error: errorMessage
            })
        })
}

export const isImage = (file: {type: string}) => {
    return file.type.includes('image/')
}

// get selectionState around a specific entity.
// draft doesn't support removing an entity by key, only all entities in a selection,
// so we use the selection to isolate one entity.
export const getEntitySelectionState = (contentState: ContentState, entityKey: string): ?SelectionState => {
    let entitySelection
    const blocks = contentState.getBlockMap()
    blocks.some((block) => {
        block.findEntityRanges(
            (character) => {
                return character.getEntity() === entityKey
            },
            (start, end) => {
                entitySelection = SelectionState.createEmpty(block.getKey())
                        .set('anchorOffset', start)
                        .set('focusOffset', end)
            }
        )

        return !!entitySelection
    })
    return entitySelection
}

export const getSelectedText = (contentState: ContentState, selection: SelectionState): string => {
    const startKey = selection.getStartKey()
    const endKey = selection.getEndKey()
    const blockMap = contentState.getBlockMap()
    return blockMap
        .skipUntil((b: ContentBlock) => b.getKey() === startKey)
        .takeUntil((b: ContentBlock) => b.getKey() === endKey)
        .concat([[endKey, blockMap.get(endKey)]])
        .reduce(
            (acc: string, block: ContentBlock) => {
                const key = block.getKey()
                const text = block.getText()
                return acc + text.slice(
                    key === startKey ? selection.getStartOffset() : 0,
                    key === endKey ? selection.getEndOffset() : text.length
                )
            },
            ''
        )
}

// Enitity selection behavior is based on Gmail's editor link toggle functionality
export const getSelectedEntityKey = (contentState: ContentState, selection: SelectionState): ?string => {
    const block = contentState.getBlockForKey(selection.getStartKey())
    const endOffset = selection.getEndOffset() - 1

    if (endOffset < 0 || selection.getStartKey() !== selection.getEndKey()) {
        return
    }

    const entityKey = block.getEntityAt(endOffset)

    if (!entityKey || (!selection.isCollapsed() && entityKey !== block.getEntityAt(selection.getStartOffset()))) {
        return
    }

    return entityKey
}

export const removeLink = (entityKey: string, editorState: EditorState): EditorState => {
    const contentState = editorState.getCurrentContent()
    const selection = getEntitySelectionState(contentState, entityKey)
    if (selection) {
        const newState = RichUtils.toggleLink(editorState, selection, null)
        const endOfLinkSelection = selection.set('anchorOffset', selection.getFocusOffset())
        return EditorState.forceSelection(newState, endOfLinkSelection)
    }
    return editorState
}

export const addImage = (editorState: EditorState, url: string, size: number = 0): EditorState => {
    const entityContentState = editorState.getCurrentContent().createEntity(
        'img',
        'IMMUTABLE',
        {
            src: url,
            width: DEFAULT_IMAGE_WIDTH,
            size,
        }
    )
    const entityKey = entityContentState.getLastCreatedEntityKey()
    let newEditorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' ',
    )

    // forcing the current selection ensures that it will be at it's right place
    return EditorState.forceSelection(newEditorState, newEditorState.getSelection())
}

export const insertInlineImages = (
    files: Array<File>,
    {getEditorState, setEditorState, getProps}: PluginMethods,
    notify: ({status: string, message: string}) => void = _noop
): EditorState => {
    // don't exceed maximum attachment file size
    const editorState = getEditorState()
    const attachments = _get(getProps(), 'attachments', fromJS([])).toJS()
    const maxSize = getMaxAttachmentSize(editorState, attachments)
    const currentSize = files.reduce((sum, file) => sum + (file.size || 0), 0)

    if (currentSize >= maxSize) {
        notify(ATTACHMENT_SIZE_ERROR)
        return Promise.resolve()
    }

    const uploaded = []
    let newEditorState = getEditorState()

    files.forEach((file) => {
        uploaded.push(new Promise((resolve) => {
            const blobURL = window.URL.createObjectURL(file)
            // add image to the editor with a dataUrl
            newEditorState = addImage(newEditorState, blobURL, file.size)
            const contentState = newEditorState.getCurrentContent()
            const imageKey = contentState.getLastCreatedEntityKey()

            // upload image then replace img src
            uploadPicture(file)
            .then((res: {url: string}) => {
                const editorState = getEditorState()
                const contentState = editorState.getCurrentContent()
                const newContentState = contentState.mergeEntityData(imageKey, {src: res.url})
                const newEditorState = EditorState.push(
                    editorState,
                    newContentState,
                    'update-pasted-image-url',
                )

                setEditorState(newEditorState)

                window.URL.revokeObjectURL(blobURL)
                return resolve({})
            })
            .catch((err) => {
                // remove image that was not uploaded
                const editorState = getEditorState()
                const contentState = editorState.getCurrentContent()
                const entitySelection = getEntitySelectionState(contentState, imageKey)
                const newContentState = Modifier.applyEntity(
                    contentState,
                    entitySelection,
                    null
                )
                const newEditorState = EditorState.push(
                    editorState,
                    newContentState,
                    'remove-pasted-image',
                )

                setEditorState(newEditorState)

                // notify
                notify({
                    status: 'error',
                    message: err.error
                })

                window.URL.revokeObjectURL(blobURL)
                return resolve(err)
            })
        }))
    })

    setEditorState(newEditorState)

    return Promise.all(uploaded)
}


