import {
    HELP_CENTER_EDITOR_ATTACHMENT_LIMIT_CONSTANTS,
    replaceUploadUrls,
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

describe('replaceUploadUrls', () => {
    it('should replace only the old url assets with the new urls', () => {
        const previousStr = `<p>aaa</p><p><br></p><p><br></p><p><img src="https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png" class="fr-fic fr-dii"><img src="https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png" width="100" height="200" class="fr-fic fr-dii"></p><div class="fr-deletable gorgias-file-attachment__wrapper" contenteditable="false"><div><i class="material-icons">attach_file</i> <a class="gorgias-file-attachment__anchor-name" href="https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png" rel="noopener noreferrer" target="_blank">png file</a> <span class="gorgias-file-attachment__span-size">30B</span></div><i class="material-icons gorgias-file-attachment__close-icon">close</i></div><p><br></p><img src="https://attachments.gorgias.help/uploads.gorgias.io/untouched/untouched.png" class="fr-fic fr-dii">`

        expect(replaceUploadUrls(previousStr)).toMatchSnapshot()
    })
})
