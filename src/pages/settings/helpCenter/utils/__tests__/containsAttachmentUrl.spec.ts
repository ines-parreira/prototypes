import {containsAttachmentURL} from '../containsAttachmentUrl'

describe('containsAttachmentUrl', () => {
    it.each([
        `
        <p>
            <img src="https://attachments.gorgias.help/xyz/ab/cdef/screenshot%202023-10-06%20at%2011.35.01-some-random-hash.png" style="width: 300px;" class="fr-fic fr-dib">
        </p>
        `,
        `
        <p>
            <img src="https://uploads.gorgias.io/xyz/ab/cdef/screenshot%202023-10-06%20at%2011.35.01-some-random-hash.png" style="width: 300px;" class="fr-fic fr-dib">
        </p>
        `,
        `
        <p>
            <img src="https://uploads.gorgias.xyz/xyz/ab/cdef/screenshot%202023-10-06%20at%2011.35.01-some-random-hash.png" style="width: 300px;" class="fr-fic fr-dib">
        </p>
        `,
        `
        <p>
            <img src="https://uploads.gorgi.us/xyz/ab/cdef/screenshot%202023-10-06%20at%2011.35.01-some-random-hash.png" style="width: 300px;" class="fr-fic fr-dib">
        </p>
        `,
    ])('detects attachment url in img', (contentWithImgAttachment) => {
        expect(containsAttachmentURL(contentWithImgAttachment)).toBe(true)
    })

    it.each([
        `
        <div class="fr-deletable gorgias-file-attachment__wrapper" contenteditable="false">
            <div>
                <i class="material-icons">attach_file</i> <a class="gorgias-file-attachment__anchor-name" href="https://attachments.gorgias.help/uploads.gorgias.io/abcdefgh/some-random-very-long-attachment-filename.csv" rel="noopener noreferrer" target="_blank">caution-danger.csv</a> 
                <span class="gorgias-file-attachment__span-size">28.5KB</span>
            </div>
            
            <i class="material-icons gorgias-file-attachment__close-icon">close</i>
        </div>
        `,
        `
        <div class="fr-deletable gorgias-file-attachment__wrapper" contenteditable="false">
            <div>
                <i class="material-icons">attach_file</i> <a class="gorgias-file-attachment__anchor-name" href="https://uploads.gorgias.io/abcdefgh/some-random-very-long-attachment-filename.csv" rel="noopener noreferrer" target="_blank">caution-danger.csv</a> 
                <span class="gorgias-file-attachment__span-size">28.5KB</span>
            </div>
            
            <i class="material-icons gorgias-file-attachment__close-icon">close</i>
        </div>
        `,
        `
        <div class="fr-deletable gorgias-file-attachment__wrapper" contenteditable="false">
            <div>
                <i class="material-icons">attach_file</i> <a class="gorgias-file-attachment__anchor-name" href="https://uploads.gorgias.xyz/abcdefgh/some-random-very-long-attachment-filename.csv" rel="noopener noreferrer" target="_blank">caution-danger.csv</a> 
                <span class="gorgias-file-attachment__span-size">28.5KB</span>
            </div>
            
            <i class="material-icons gorgias-file-attachment__close-icon">close</i>
        </div>
        `,
        `
        <div class="fr-deletable gorgias-file-attachment__wrapper" contenteditable="false">
            <div>
                <i class="material-icons">attach_file</i> <a class="gorgias-file-attachment__anchor-name" href="https://uploads.gorgi.us/abcdefgh/some-random-very-long-attachment-filename.csv" rel="noopener noreferrer" target="_blank">caution-danger.csv</a> 
                <span class="gorgias-file-attachment__span-size">28.5KB</span>
            </div>
            
            <i class="material-icons gorgias-file-attachment__close-icon">close</i>
        </div>
        `,
    ])('detects attachment url in link', (contentWithLinkAttachment) => {
        expect(containsAttachmentURL(contentWithLinkAttachment)).toBe(true)
    })

    it('detects attachment url in plain text', () => {
        const contentWithAttachmentUrlInPlainText = `
        <p>
            Hello I would like to expose this file URL https://attachments.gorgias.help/uploads.gorgias.io/abcdefgh/some-random-very-long-attachment-filename.csv
        </p>
        `

        expect(containsAttachmentURL(contentWithAttachmentUrlInPlainText)).toBe(
            true
        )
    })

    it('detects that there are no attachment urls', () => {
        const contentWithoutAttachmentUrl = `
        <p>
            <img src="https://google.com/some-image.png" style="width: 300px;" class="fr-fic fr-dib">
        </p>

        <div class="fr-deletable gorgias-file-attachment__wrapper" contenteditable="false">
            <div>
                <i class="material-icons">attach_file</i> <a class="gorgias-file-attachment__anchor-name" href="https://wikipedia.org/some-file.csv" rel="noopener noreferrer" target="_blank">caution-danger.csv</a> 
                <span class="gorgias-file-attachment__span-size">28.5KB</span>
            </div>
            
            <i class="material-icons gorgias-file-attachment__close-icon">close</i>
        </div>

        <p>
            Hello I would like to expose this file URL https://bing.com/something
        </p>
        `

        expect(containsAttachmentURL(contentWithoutAttachmentUrl)).toBe(false)
    })
})
