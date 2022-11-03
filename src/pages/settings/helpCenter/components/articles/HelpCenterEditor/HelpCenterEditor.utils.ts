import bytes from 'bytes'
import {Editor} from './types'

export const HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS = {
    maxNumberOfAttachments: 100,
    maxFileSizeBytes: 20 * 1024 * 1024,
}

/**
 * It is expected that the parser on the Help Center side will rely on these classes to extract the attachment information. This way, the structure of the HTML could be change without breaking the parsing.
 */
export const HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS = {
    wrapper: 'gorgias-file-attachment__wrapper',
    closeIcon: 'gorgias-file-attachment__close-icon',
    anchorName: 'gorgias-file-attachment__anchor-name',
    spanSize: 'gorgias-file-attachment__span-size',
}

export const generateEditorAttachmentHTML = ({
    url,
    fileName,
    prettySize,
}: {
    url: string
    fileName: string
    prettySize: string
}) => {
    /**
     * contenteditable="false" - is needed to prevent the user from editing the text in the attachment
     * class="fr-deletable" - is needed to allow the user to delete the attachment using the backspace/delete key
     */
    return `
        <div class="fr-deletable ${HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS.wrapper}" contenteditable="false">
            <div>
                <i class="material-icons">attach_file</i>

                <a
                    class="${HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS.anchorName}"
                    href="${url}" target="_blank" rel="noopener noreferrer">${fileName}</a>

                <span class="${HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS.spanSize}" >${prettySize}</span>
            </div>

            <i class="material-icons ${HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS.closeIcon}">close</i>
        </div>
    `
}

export const createOnCloseEventHandler =
    (editor: Editor): EventListener =>
    (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (!(event.target instanceof HTMLElement)) return

        const attachmentWrapper = event.target.parentElement

        // We assume that the wrapper element is the first parent of the close icon
        if (
            !(
                attachmentWrapper instanceof HTMLDivElement &&
                attachmentWrapper.className.includes(
                    HELP_CENTER_EDITOR_CSS_ATTACHMENT_CONSTANTS.wrapper
                )
            )
        )
            return

        attachmentWrapper.remove()

        editor.undo.saveStep()
    }

/**
 * If a `string` is returned, it means that the editor is invalid, and the string
 * is the error message.
 * If `null` is returned, it means that the editor is valid.
 */
export function validateFileAttachments(
    nrAttachmentsInEditor: number,
    files: File[]
): string | null {
    if (
        files.length + nrAttachmentsInEditor >
        HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS.maxNumberOfAttachments
    ) {
        return `An article can have at most ${HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS.maxNumberOfAttachments} files at a time.`
    }

    const invalidFiles = files.filter(
        (file) =>
            file.size >
            HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS.maxFileSizeBytes
    )

    if (invalidFiles.length > 0) {
        return `The following files are larger than ${bytes(
            HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS.maxFileSizeBytes
        )}: ${invalidFiles.map((file) => file.name).join(', ')}`
    }

    return null
}
