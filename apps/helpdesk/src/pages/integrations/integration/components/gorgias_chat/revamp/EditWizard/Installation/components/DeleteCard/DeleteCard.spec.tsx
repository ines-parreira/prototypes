import React from 'react'

import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { DeleteCard } from './DeleteCard'

describe('DeleteCard', () => {
    const mockOnDeleteIntegration = jest.fn()

    const defaultIntegration = fromJS({
        id: 1,
        meta: {
            shop_integration_id: 123,
            shopify_integration_ids: [],
        },
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (integration = defaultIntegration) => {
        return render(
            <DeleteCard
                integration={integration}
                onDeleteIntegration={mockOnDeleteIntegration}
            />,
        )
    }

    const openModal = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('button', { name: 'Delete chat' }))

        return screen.findByRole('dialog')
    }

    it('should render the delete card description', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Permanently remove Chat from your account. All chat settings and data will be lost.',
            ),
        ).toBeInTheDocument()
    })

    it('should open confirmation modal when delete button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const dialog = await openModal(user)

        expect(within(dialog).getByText('Delete Chat ?')).toBeInTheDocument()
    })

    it('should show confirmation message in modal', async () => {
        const user = userEvent.setup()
        renderComponent()

        await openModal(user)

        expect(
            await screen.findByText(
                'Deleting this chat will remove it from your store and disable any associated views and rules.',
            ),
        ).toBeInTheDocument()
    })

    it('should show manual installation warning for non-one-click installations', async () => {
        const user = userEvent.setup()
        const manualIntegration = fromJS({
            id: 1,
            meta: {
                shop_integration_id: 123,
                shopify_integration_ids: [456],
            },
        })

        renderComponent(manualIntegration)

        await openModal(user)

        expect(
            await screen.findByText(
                /For manually installed chats, you also need to delete the script/,
            ),
        ).toBeInTheDocument()
    })

    it('should not show manual installation warning for one-click installations', async () => {
        const user = userEvent.setup()
        const oneClickIntegration = fromJS({
            id: 1,
            meta: {
                shop_integration_id: 123,
                shopify_integration_ids: [123],
            },
        })

        renderComponent(oneClickIntegration)

        await openModal(user)

        expect(
            screen.queryByText(
                /For manually installed chats, you also need to delete the script/,
            ),
        ).not.toBeInTheDocument()
    })

    it('should close modal when cancel button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const dialog = await openModal(user)

        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should call onDeleteIntegration when delete is confirmed', async () => {
        const user = userEvent.setup()
        mockOnDeleteIntegration.mockResolvedValue(undefined)

        renderComponent()

        const dialog = await openModal(user)

        await user.click(
            within(dialog).getByRole('button', { name: 'Delete chat' }),
        )

        expect(mockOnDeleteIntegration).toHaveBeenCalledWith(
            defaultIntegration,
            true,
            true,
        )
        expect(await screen.findByRole('status')).toHaveTextContent(
            'Integration successfully deleted',
        )
    })

    it('should show error toast when delete fails', async () => {
        const user = userEvent.setup()
        mockOnDeleteIntegration.mockRejectedValueOnce({
            response: { data: { error: { msg: 'Delete failed' } } },
        })

        renderComponent()

        const dialog = await openModal(user)

        await user.click(
            within(dialog).getByRole('button', { name: 'Delete chat' }),
        )

        expect(await screen.findByRole('status')).toHaveTextContent(
            'Delete failed',
        )
    })

    it('should disable buttons while deleting', async () => {
        const user = userEvent.setup()

        let resolveDelete: () => void = () => {}
        mockOnDeleteIntegration.mockReturnValue(
            new Promise<void>((resolve) => {
                resolveDelete = resolve
            }),
        )

        renderComponent()

        const dialog = await openModal(user)

        await user.click(
            within(dialog).getByRole('button', { name: 'Delete chat' }),
        )

        await waitFor(() => {
            expect(
                within(dialog).getByRole('button', { name: 'Cancel' }),
            ).toBeDisabled()
        })

        resolveDelete()
    })
})
