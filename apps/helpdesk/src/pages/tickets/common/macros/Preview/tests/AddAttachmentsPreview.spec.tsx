import { render, screen } from '@testing-library/react'

import { addAttachmentsAction } from 'fixtures/macro'

import { AddAttachmentsPreview } from '../AddAttachmentsPreview'

describe('<AddAttachmentsPreview />', () => {
    it('should render attachment previews', () => {
        render(
            <AddAttachmentsPreview attachmentAction={addAttachmentsAction} />,
        )

        expect(screen.getByText('Attach files:')).toBeInTheDocument()
        expect(screen.getByText('photo_library')).toBeInTheDocument()
        expect(
            screen.getByText(
                addAttachmentsAction.arguments.attachments![0].name!,
            ),
        ).toBeInTheDocument()
    })

    it('should render multiple attachments', () => {
        const multipleAttachmentsAction = {
            ...addAttachmentsAction,
            arguments: {
                attachments: [
                    { name: 'file1.pdf', content_type: 'application/pdf' },
                    { name: 'file2.jpg', content_type: 'image/jpeg' },
                ],
            },
        }

        render(
            <AddAttachmentsPreview
                attachmentAction={multipleAttachmentsAction}
            />,
        )

        expect(screen.getByText('file1.pdf')).toBeInTheDocument()
        expect(screen.getByText('file2.jpg')).toBeInTheDocument()
    })

    it('should return null when no attachment action is provided', () => {
        const { container } = render(<AddAttachmentsPreview />)

        expect(container.firstChild).toBeNull()
    })

    it('should return null when attachment action has no attachments', () => {
        const { container } = render(<AddAttachmentsPreview />)

        expect(container.firstChild).toBeNull()
    })
})
