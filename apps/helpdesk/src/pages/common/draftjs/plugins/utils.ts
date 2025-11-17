import type { AxiosError } from 'axios'
import type { EditorChangeType, SelectionState } from 'draft-js'
import { AtomicBlockUtils, EditorState, Modifier, RichUtils } from 'draft-js'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _get from 'lodash/get'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'
import type { UploadType } from 'common/types'
import { uploadFiles } from 'common/utils'
import { DEFAULT_IMAGE_WIDTH, DEFAULT_VIDEO_WIDTH } from 'config/editor'
import type { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { ConnectedAction } from 'state/types'
import { getEntitySelectionState } from 'utils/editor'
import { getFileTooLargeError, getMaxAttachmentSize } from 'utils/file'
import { linkify } from 'utils/linkify'

import type { PluginMethods } from './types'

const uploadPicture = (file: File, uploadType?: UploadType) => {
    return uploadFiles([file], uploadType ? { type: uploadType } : null)
        .then((files) => files[0])
        .catch((error) => {
            let errorMessage = (
                fromJS((error as AxiosError).response) as Map<any, any>
            ).getIn(['data', 'error', 'msg'])

            if (!errorMessage) {
                errorMessage =
                    (error as AxiosError).response?.status === 413
                        ? 'Failed to upload files. One or more files are larger than the size limit of 10MB.'
                        : 'Failed to upload files. Please try again later.'
            }

            return Promise.reject({
                error: errorMessage,
            })
        })
}

export const isImage = (file: { type: string }) => {
    return file.type.includes('image/')
}

export const removeLink = (
    entityKey: string,
    editorState: EditorState,
): EditorState => {
    const contentState = editorState.getCurrentContent()
    const selection = getEntitySelectionState(contentState, entityKey)
    if (selection) {
        const newState = RichUtils.toggleLink(editorState, selection, null)
        const endOfLinkSelection = selection.set(
            'anchorOffset',
            selection.getFocusOffset(),
        ) as SelectionState
        return EditorState.forceSelection(newState, endOfLinkSelection)
    }
    return editorState
}

export const addImage = (
    editorState: EditorState,
    url: string,
    size = 0,
): EditorState => {
    const entityContentState = editorState
        .getCurrentContent()
        .createEntity(draftjsGorgiasCustomBlockRenderers.Img, 'IMMUTABLE', {
            src: url,
            width: DEFAULT_IMAGE_WIDTH,
            size,
        })
    const entityKey = entityContentState.getLastCreatedEntityKey()
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' ',
    )

    // forcing the current selection ensures that it will be at it's right place
    return EditorState.forceSelection(
        newEditorState,
        newEditorState.getSelection(),
    )
}

export const insertInlineImages = (
    files: Array<File>,
    { getEditorState, setEditorState, getProps }: PluginMethods,
    notify: ConnectedAction<typeof notifyAction>,
    uploadType?: UploadType,
) => {
    // don't exceed maximum attachment file size
    const editorState = getEditorState()
    const attachments = (
        _get(getProps(), 'attachments', fromJS([])) as List<any>
    ).toJS()
    const maxSize = getMaxAttachmentSize(editorState, attachments)
    const currentSize = files.reduce((sum, file) => sum + (file.size || 0), 0)

    if (currentSize >= maxSize) {
        void notify({
            status: NotificationStatus.Error,
            message: getFileTooLargeError(maxSize),
        })
        return Promise.resolve()
    }

    const uploaded: Promise<any>[] = []
    let newEditorState = getEditorState()

    files.forEach((file) => {
        uploaded.push(
            new Promise((resolve) => {
                const blobURL = window.URL.createObjectURL(file)
                // add image to the editor with a dataUrl
                newEditorState = addImage(newEditorState, blobURL, file.size)
                const contentState = newEditorState.getCurrentContent()
                const imageKey = contentState.getLastCreatedEntityKey()

                // upload image then replace img src
                uploadPicture(file, uploadType)
                    .then((res: { url: string }) => {
                        const editorState = getEditorState()
                        const contentState = editorState.getCurrentContent()
                        const newContentState = contentState.mergeEntityData(
                            imageKey,
                            { src: res.url },
                        )
                        const newEditorState = EditorState.push(
                            editorState,
                            newContentState,
                            'update-pasted-image-url' as EditorChangeType,
                        )

                        setEditorState(newEditorState)

                        window.URL.revokeObjectURL(blobURL)
                        return resolve({})
                    })
                    .catch((err) => {
                        // remove image that was not uploaded
                        const editorState = getEditorState()
                        const contentState = editorState.getCurrentContent()
                        const entitySelection = getEntitySelectionState(
                            contentState,
                            imageKey,
                        )
                        const newContentState = Modifier.applyEntity(
                            contentState,
                            entitySelection!,
                            null,
                        )
                        const newEditorState = EditorState.push(
                            editorState,
                            newContentState,
                            'remove-pasted-image' as EditorChangeType,
                        )

                        setEditorState(newEditorState)

                        void notify({
                            status: NotificationStatus.Error,
                            message: (err as { error: string }).error,
                        })

                        window.URL.revokeObjectURL(blobURL)
                        return resolve(err)
                    })
            }),
        )
    })

    setEditorState(newEditorState)

    return Promise.all(uploaded)
}

export const addVideo = (
    editorState: EditorState,
    url: string,
): EditorState => {
    const entityContentState = editorState
        .getCurrentContent()
        .createEntity(draftjsGorgiasCustomBlockRenderers.Video, 'IMMUTABLE', {
            url: url,
            width: DEFAULT_VIDEO_WIDTH,
        })
    const entityKey = entityContentState.getLastCreatedEntityKey()
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' ',
    )

    // forcing the current selection ensures that it will be at it's right place
    return EditorState.forceSelection(
        newEditorState,
        newEditorState.getSelection(),
    )
}

export const addDiscountCodeLink = (
    editorState: EditorState,
    url: string,
    code: string,
): EditorState => {
    let contentState = editorState
        .getCurrentContent()
        .createEntity(
            draftjsGorgiasCustomBlockRenderers.DiscountCodeLink,
            'IMMUTABLE',
            {
                url: url,
                code: code,
            },
        )
    const selection = editorState.getSelection()
    const entityKey = contentState.getLastCreatedEntityKey()

    contentState = Modifier.replaceText(
        contentState,
        selection,
        code || url,
        undefined,
        entityKey,
    )

    return EditorState.push(editorState, contentState, 'apply-entity')
}

export const linkifyWithTemplate = (url: string) => {
    const noTemplateUrl = url.replace(
        /{{(.*?)}}/g,
        (m, group: string) => `**${group}**`,
    )
    const parsedUrl = linkify.match(noTemplateUrl)?.[0]?.url || noTemplateUrl
    return parsedUrl.replace(
        /\*\*(.*?)\*\*/g,
        (m, group: string) => `{{${group}}}`,
    )
}
