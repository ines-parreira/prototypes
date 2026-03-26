import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { OrderManagementFlowsCard } from './OrderManagementFlowsCard'
import type { OrderManagementFlow } from './useOrderManagementFlows'

const mockFlows: OrderManagementFlow[] = [
    {
        key: 'trackOrderPolicy',
        title: 'Track order',
        routePath: 'track',
        isEnabled: true,
        hasEmptyResponse: false,
        canNavigate: true,
    },
    {
        key: 'returnOrderPolicy',
        title: 'Return order',
        routePath: 'return',
        isEnabled: false,
        hasEmptyResponse: false,
        canNavigate: true,
    },
    {
        key: 'cancelOrderPolicy',
        title: 'Cancel order',
        routePath: 'cancel',
        isEnabled: true,
        hasEmptyResponse: false,
        canNavigate: true,
    },
    {
        key: 'reportIssuePolicy',
        title: 'Report issue',
        routePath: 'report-issue',
        isEnabled: false,
        hasEmptyResponse: false,
        canNavigate: true,
    },
]

const renderComponent = (
    props: Partial<Parameters<typeof OrderManagementFlowsCard>[0]> = {},
) => {
    const defaultProps = {
        isLoading: false,
        isUpdatePending: false,
        flows: mockFlows,
        onFlowToggle: jest.fn(),
        onFlowClick: jest.fn(),
    }

    return render(<OrderManagementFlowsCard {...defaultProps} {...props} />)
}

describe('OrderManagementFlowsCard', () => {
    describe('loading state', () => {
        it('should render skeleton and hide content when isLoading is true', () => {
            renderComponent({ isLoading: true })

            expect(
                screen.queryByRole('heading', { name: /order management/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('content', () => {
        it('should render the heading', () => {
            renderComponent()

            expect(
                screen.getByRole('heading', { name: /order management/i }),
            ).toBeInTheDocument()
        })

        it('should render the description', () => {
            renderComponent()

            expect(
                screen.getByText(
                    /let customers sign in to track, return, cancel or report issues with orders/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render the Show and Button column headers', () => {
            renderComponent()

            expect(screen.getByText('Show')).toBeInTheDocument()
            expect(screen.getByText('Button')).toBeInTheDocument()
        })

        it('should render all flow titles', () => {
            renderComponent()

            expect(screen.getByText('Track order')).toBeInTheDocument()
            expect(screen.getByText('Return order')).toBeInTheDocument()
            expect(screen.getByText('Cancel order')).toBeInTheDocument()
            expect(screen.getByText('Report issue')).toBeInTheDocument()
        })
    })

    describe('toggles', () => {
        it('should render toggles in correct enabled/disabled state', () => {
            renderComponent()

            const toggles = screen.getAllByRole('switch')
            expect(toggles[0]).toBeChecked() // Track order - enabled
            expect(toggles[1]).not.toBeChecked() // Return order - disabled
            expect(toggles[2]).toBeChecked() // Cancel order - enabled
            expect(toggles[3]).not.toBeChecked() // Report issue - disabled
        })

        it('should disable all toggles when isUpdatePending is true', () => {
            renderComponent({ isUpdatePending: true })

            screen
                .getAllByRole('switch')
                .forEach((toggle) => expect(toggle).toBeDisabled())
        })

        it('should call onFlowToggle with correct key and value when toggled on', async () => {
            const user = userEvent.setup()
            const onFlowToggle = jest.fn()
            renderComponent({ onFlowToggle })

            await user.click(screen.getAllByRole('switch')[1]) // Return order is off

            expect(onFlowToggle).toHaveBeenCalledWith('returnOrderPolicy', true)
        })

        it('should call onFlowToggle with false when an enabled toggle is clicked', async () => {
            const user = userEvent.setup()
            const onFlowToggle = jest.fn()
            renderComponent({ onFlowToggle })

            await user.click(screen.getAllByRole('switch')[0]) // Track order is on

            expect(onFlowToggle).toHaveBeenCalledWith('trackOrderPolicy', false)
        })
    })

    describe('empty flows', () => {
        it('should render heading and description with no rows when flows is empty', () => {
            renderComponent({ flows: [] })

            expect(
                screen.getByRole('heading', { name: /order management/i }),
            ).toBeInTheDocument()
            expect(screen.queryByRole('switch')).not.toBeInTheDocument()
        })
    })

    describe('row navigation', () => {
        it('should call onFlowClick with correct routePath when a navigable row is clicked', async () => {
            const user = userEvent.setup()
            const onFlowClick = jest.fn()
            renderComponent({ onFlowClick })

            await user.click(screen.getByText('Track order'))

            expect(onFlowClick).toHaveBeenCalledWith('track')
        })

        it('should call onFlowClick with report-issue routePath when that row is clicked', async () => {
            const user = userEvent.setup()
            const onFlowClick = jest.fn()
            renderComponent({ onFlowClick })

            await user.click(screen.getByText('Report issue'))

            expect(onFlowClick).toHaveBeenCalledWith('report-issue')
        })

        it('should not call onFlowClick when canNavigate is false', async () => {
            const user = userEvent.setup()
            const onFlowClick = jest.fn()
            const nonNavigableFlows = mockFlows.map((f) => ({
                ...f,
                canNavigate: false,
            }))
            renderComponent({ flows: nonNavigableFlows, onFlowClick })

            await user.click(screen.getByText('Track order'))

            expect(onFlowClick).not.toHaveBeenCalled()
        })

        it('should not call onFlowClick when clicking the toggle directly', async () => {
            const user = userEvent.setup()
            const onFlowClick = jest.fn()
            renderComponent({ onFlowClick })

            await user.click(screen.getAllByRole('switch')[0])

            expect(onFlowClick).not.toHaveBeenCalled()
        })
    })
})
