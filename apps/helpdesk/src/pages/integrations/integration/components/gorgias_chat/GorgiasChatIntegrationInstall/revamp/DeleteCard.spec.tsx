import React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import DeleteCard from './DeleteCard'

const mockButton = jest.fn(
    ({ children, onClick, isLoading, isDisabled, ...props }: any) => (
        <button
            onClick={onClick}
            disabled={isDisabled || isLoading}
            data-testid={props['data-testid']}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    ),
)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: (props: any) => mockButton(props),
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children, size }: any) => <h1 data-size={size}>{children}</h1>,
    Modal: ({ children, isOpen, onOpenChange }: any) =>
        isOpen ? (
            <div data-testid="modal" role="dialog">
                {typeof children === 'function'
                    ? children({ onOpenChange })
                    : children}
            </div>
        ) : null,
    OverlayContent: ({ children }: any) => (
        <div data-testid="overlay-content">{children}</div>
    ),
    OverlayFooter: ({ children }: any) => (
        <div data-testid="overlay-footer">{children}</div>
    ),
    OverlayHeader: ({ title }: any) => (
        <div data-testid="overlay-header">{title}</div>
    ),
    Text: ({ children }: any) => <p>{children}</p>,
}))

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
        mockButton.mockClear()
    })

    const renderComponent = (integration = defaultIntegration) => {
        return render(
            <DeleteCard
                integration={integration}
                onDeleteIntegration={mockOnDeleteIntegration}
            />,
        )
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

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(deleteButton)
        })

        expect(await screen.findByTestId('modal')).toBeInTheDocument()
        expect(screen.getByText('Delete Chat ?')).toBeInTheDocument()
    })

    it('should show confirmation message in modal', async () => {
        const user = userEvent.setup()
        renderComponent()

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(deleteButton)
        })

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

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(deleteButton)
        })

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

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(deleteButton)
        })

        expect(
            screen.queryByText(
                /For manually installed chats, you also need to delete the script/,
            ),
        ).not.toBeInTheDocument()
    })

    it('should close modal when cancel button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(deleteButton)
        })

        expect(await screen.findByTestId('modal')).toBeInTheDocument()

        const cancelButton = screen.getByTestId(
            'cancel-delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(cancelButton)
        })

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should call onDeleteIntegration when delete is confirmed', async () => {
        const user = userEvent.setup()
        mockOnDeleteIntegration.mockResolvedValue(undefined)

        renderComponent()

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(deleteButton)
        })

        const confirmButton = screen.getByTestId(
            'delete-chat-integration-confirmation-button',
        )
        await act(async () => {
            await user.click(confirmButton)
        })

        expect(mockOnDeleteIntegration).toHaveBeenCalledWith(defaultIntegration)
    })

    it('should disable cancel button while deleting', async () => {
        const user = userEvent.setup()

        renderComponent()

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )
        await act(async () => {
            await user.click(deleteButton)
        })

        const confirmButton = screen.getByTestId(
            'delete-chat-integration-confirmation-button',
        )

        mockButton.mockClear()
        await act(async () => {
            await user.click(confirmButton)
        })

        const cancelButtonCalls = mockButton.mock.calls.filter(
            (call) =>
                call[0]['data-testid'] ===
                'cancel-delete-chat-integration-button',
        )
        const lastCancelButtonCall =
            cancelButtonCalls[cancelButtonCalls.length - 1]
        expect(lastCancelButtonCall[0].isDisabled).toBe(true)
    })

    it('should show loading state on delete button while deleting', async () => {
        const user = userEvent.setup()

        renderComponent()

        const deleteButton = screen.getByTestId(
            'delete-chat-integration-button',
        )

        await act(async () => await user.click(deleteButton))

        const confirmButton = screen.getByTestId(
            'delete-chat-integration-confirmation-button',
        )

        mockButton.mockClear()

        await act(async () => {
            await user.click(confirmButton)
        })

        const confirmButtonCalls = mockButton.mock.calls.filter(
            (call) =>
                call[0]['data-testid'] ===
                'delete-chat-integration-confirmation-button',
        )
        const lastConfirmButtonCall =
            confirmButtonCalls[confirmButtonCalls.length - 1]

        expect(lastConfirmButtonCall[0].isLoading).toBe(true)
    })
})
