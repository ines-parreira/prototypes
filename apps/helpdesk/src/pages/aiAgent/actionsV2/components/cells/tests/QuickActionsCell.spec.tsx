import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useDeleteAction } from 'pages/aiAgent/actions/hooks/useDeleteAction'
import { GuidanceReferenceContext } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { QuickActionsCell } from '../QuickActionsCell'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            actionEvents: (id: string) =>
                `/app/ai-agent/shopify/test/actions/events/${id}`,
        },
    }),
}))

const mockPush = jest.fn()
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom')
    return { ...actual, useHistory: () => ({ push: mockPush }) }
})

const mockDelete = jest.fn()
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction', () => ({
    __esModule: true,
    useDeleteAction: jest.fn(),
}))
const mockUseDeleteAction = jest.mocked(useDeleteAction)

const action = {
    id: 'action-1',
    internal_id: 'internal-1',
    name: 'Cancel order',
} as StoreWorkflowsConfiguration

const renderWithContext = (canBeDeleted = true) =>
    render(
        <GuidanceReferenceContext.Provider
            value={{
                canBeDeleted: () => canBeDeleted,
                references: {},
            }}
        >
            <QuickActionsCell
                action={action}
                shopName="test"
                shopType="shopify"
            />
        </GuidanceReferenceContext.Provider>,
    )

describe('QuickActionsCell', () => {
    beforeEach(() => {
        mockPush.mockReset()
        mockDelete.mockReset()
        mockUseDeleteAction.mockReturnValue({
            mutate: mockDelete,
            isLoading: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
    })

    it('opens the menu when the row-actions button is clicked', async () => {
        const user = userEvent.setup()
        renderWithContext()

        await user.click(
            screen.getByRole('button', {
                name: /row actions for cancel order/i,
            }),
        )

        expect(
            await screen.findByRole('menuitem', { name: /view event logs/i }),
        ).toBeInTheDocument()
    })

    it('navigates to the events route when View event logs is selected', async () => {
        const user = userEvent.setup()
        renderWithContext()

        await user.click(
            screen.getByRole('button', {
                name: /row actions for cancel order/i,
            }),
        )
        await user.click(
            await screen.findByRole('menuitem', { name: /view event logs/i }),
        )

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test/actions/events/action-1',
        )
    })

    it('calls deleteAction when Delete is selected and the action can be deleted', async () => {
        const user = userEvent.setup()
        renderWithContext(true)

        await user.click(
            screen.getByRole('button', {
                name: /row actions for cancel order/i,
            }),
        )
        await user.click(
            await screen.findByRole('menuitem', { name: /delete/i }),
        )

        expect(mockDelete).toHaveBeenCalledWith([{ internal_id: 'internal-1' }])
    })
})
