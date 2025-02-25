import { List } from 'immutable'

import { AttachmentEnum } from 'common/types'
import { transformAttachmentsToContactCaptureForms } from 'pages/convert/campaigns/utils/transformAttachmentsToContactCaptureForms'

describe('transformAttachmentsToContactForm', () => {
    it('should return an empty array if no attachments are provided', () => {
        const attachments = List([])

        const result = transformAttachmentsToContactCaptureForms(attachments)

        expect(result).toEqual([])
    })

    it('should return an empty array if no attachments are contact form', () => {
        const attachments = List([
            {
                content_type: 'image',
                name: 'image1',
                extra: { id: 1, scenario: 'scenario1' },
            },
            {
                content_type: 'image',
                name: 'image2',
                extra: { id: 2, scenario: 'scenario2' },
            },
        ])

        const result = transformAttachmentsToContactCaptureForms(attachments)

        expect(result).toEqual([])
    })

    it('should return an array with one contact form', () => {
        const attachments = List([
            {
                content_type: AttachmentEnum.ContactForm,
                name: 'Email Capture Form',
                extra: undefined,
            },
        ])

        const result = transformAttachmentsToContactCaptureForms(attachments)

        expect(result).toMatchObject([
            {
                contentType: AttachmentEnum.ContactForm,
                name: 'Email Capture Form',
                extra: undefined,
            },
        ])
    })
})
