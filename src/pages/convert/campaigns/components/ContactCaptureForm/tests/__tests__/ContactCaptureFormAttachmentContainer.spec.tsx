import {act, render} from '@testing-library/react'
import React from 'react'
import {ContactFormAttachmentContainer} from 'pages/convert/campaigns/components/ContactCaptureForm/ContactFormAttachmentContainer'
import {sampleContactFormAttachment} from 'pages/convert/campaigns/components/ContactCaptureForm/tests/fixtures'

describe('ContactFormAttachmentContainer', () => {
    it('should render the ContactFormAttachmentContainer', () => {
        render(
            <ContactFormAttachmentContainer
                {...{
                    css: {},
                    onEdit: jest.fn(),
                    onClose: jest.fn(),
                    attachment: sampleContactFormAttachment,
                }}
            />
        )
    })

    it('should call the close callback when close is clicked', () => {
        const mockOnClose = jest.fn()
        const {getByText} = render(
            <ContactFormAttachmentContainer
                {...{
                    css: {},
                    onEdit: jest.fn(),
                    onClose: mockOnClose,
                    attachment: sampleContactFormAttachment,
                }}
            />
        )
        act(() => getByText('close').click())
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call the edit callback when edit is clicked', () => {
        const mockOnEdit = jest.fn()
        const {getByText} = render(
            <ContactFormAttachmentContainer
                {...{
                    css: {},
                    onEdit: mockOnEdit,
                    onClose: jest.fn(),
                    attachment: sampleContactFormAttachment,
                }}
            />
        )
        act(() => getByText('edit').click())
        expect(mockOnEdit).toHaveBeenCalled()
    })
})
