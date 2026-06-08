import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatRedesignSwitchConfirmModal } from './ChatRedesignSwitchConfirmModal'

const noop = () => undefined

describe('<ChatRedesignSwitchConfirmModal />', () => {
    it('renders the switch-to-new-chat copy when not opted in', () => {
        render(
            <ChatRedesignSwitchConfirmModal
                isOpen
                isOptedIn={false}
                isSubmitting={false}
                onConfirm={noop}
                onOpenChange={noop}
            />,
        )

        expect(screen.getByText('Switch to new chat')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Switch' }),
        ).toBeInTheDocument()
    })

    it('renders the switch-back copy when opted in', () => {
        render(
            <ChatRedesignSwitchConfirmModal
                isOpen
                isOptedIn
                isSubmitting={false}
                onConfirm={noop}
                onOpenChange={noop}
            />,
        )

        expect(
            screen.getByText('Switch back to the old chat?'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Switch' }),
        ).toBeInTheDocument()
    })

    it('calls onConfirm when the Switch button is clicked', async () => {
        const onConfirm = jest.fn()
        render(
            <ChatRedesignSwitchConfirmModal
                isOpen
                isOptedIn={false}
                isSubmitting={false}
                onConfirm={onConfirm}
                onOpenChange={noop}
            />,
        )

        await userEvent.click(screen.getByRole('button', { name: 'Switch' }))

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('closes via onOpenChange when Cancel is clicked', async () => {
        const onOpenChange = jest.fn()
        render(
            <ChatRedesignSwitchConfirmModal
                isOpen
                isOptedIn={false}
                isSubmitting={false}
                onConfirm={noop}
                onOpenChange={onOpenChange}
            />,
        )

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('disables Cancel while submitting', () => {
        render(
            <ChatRedesignSwitchConfirmModal
                isOpen
                isOptedIn={false}
                isSubmitting
                onConfirm={noop}
                onOpenChange={noop}
            />,
        )

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    })
})
