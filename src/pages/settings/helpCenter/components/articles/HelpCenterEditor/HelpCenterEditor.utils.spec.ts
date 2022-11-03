import {
    HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS,
    validateFileAttachments,
} from './HelpCenterEditor.utils'

describe('HelpCenterEditor.utils', () => {
    it('should return an error message if there are too many files', () => {
        const files = [
            new File([''], 'file5', {type: 'image/png'}),
            new File([''], 'file6', {type: 'image/png'}),
        ]

        const errorMessage = validateFileAttachments(
            HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS.maxNumberOfAttachments -
                1,
            files
        )

        expect(errorMessage).toBe(
            `An article can have at most ${HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS.maxNumberOfAttachments} files at a time.`
        )
    })
})
