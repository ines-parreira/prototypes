import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal } from './KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal'

const renderComponent = ({
    isOpen = true,
    onClose = jest.fn(),
    onUnlink = jest.fn(),
}: {
    isOpen?: boolean
    onClose?: jest.Mock
    onUnlink?: jest.Mock
} = {}) =>
    render(
        <KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal
            isOpen={isOpen}
            onClose={onClose}
            onUnlink={onUnlink}
        />,
    )

describe('KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal', () => {
    it('renders modal title, body and actions when open', () => {
        renderComponent()

        const modal = screen.getByRole('dialog')

        expect(
            within(modal).getByRole('heading', {
                name: 'Unlink intents from this guidance?',
            }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByText(
                "AI Agent won't prioritize this guidance when responding to the linked intents.",
            ),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Unlink' }),
        ).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('calls onClose when clicking cancel', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()

        renderComponent({ onClose })

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onUnlink when clicking unlink', async () => {
        const user = userEvent.setup()
        const onUnlink = jest.fn()

        renderComponent({ onUnlink })

        await user.click(screen.getByRole('button', { name: 'Unlink' }))

        expect(onUnlink).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking top-right close button', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()

        renderComponent({ onClose })

        const modal = screen.getByRole('dialog')
        const closeIcon = within(modal).getByRole('img', { name: 'close' })
        const dismissButton = closeIcon.closest('button')

        expect(dismissButton).not.toBeNull()

        await user.click(dismissButton as HTMLButtonElement)

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
