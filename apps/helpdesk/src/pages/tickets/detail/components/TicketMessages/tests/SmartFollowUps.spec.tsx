import React from 'react'

import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { SmartFollowUpType } from 'models/ticket/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import SmartFollowUps from '../SmartFollowUps'

jest.mock(
    'pages/settings/conditionalFields/components/ExpressionField/Pill',
    () => ({
        Pill: ({ children, color, className }: any) => (
            <span data-testid="pill" data-color={color} className={className}>
                {children}
            </span>
        ),
    }),
)

describe('SmartFollowUps', () => {
    const mockFollowUps = [
        {
            text: 'Order status',
            type: SmartFollowUpType.DYNAMIC,
        },
        {
            text: 'Shipping policy',
            type: SmartFollowUpType.DYNAMIC,
        },
        {
            text: 'Return policy',
            type: SmartFollowUpType.DYNAMIC,
        },
    ]

    it('should return null when followUps is empty array', () => {
        const { container } = renderWithStoreAndQueryClientProvider(
            <SmartFollowUps smartFollowUps={[]} />,
        )

        expect(container.firstChild).toBeNull()
    })

    describe('when shouldDisplayAllFollowUps is true', () => {
        const mockState = {
            ticket: fromJS({
                _internal: {
                    shouldDisplayAllFollowUps: true,
                },
            }),
        }

        it('should display all smart follow ups', () => {
            renderWithStoreAndQueryClientProvider(
                <SmartFollowUps smartFollowUps={mockFollowUps} />,
                mockState,
            )

            expect(screen.getByText('Order status')).toBeInTheDocument()
            expect(screen.getByText('Shipping policy')).toBeInTheDocument()
            expect(screen.getByText('Return policy')).toBeInTheDocument()
        })

        it('should display check icon for the selected smart follow up', () => {
            renderWithStoreAndQueryClientProvider(
                <SmartFollowUps
                    smartFollowUps={mockFollowUps}
                    selectedSmartFollowUpIndex={0}
                />,
                mockState,
            )

            const checkIcon = screen.getByText('check')
            expect(checkIcon).toBeInTheDocument()
            expect(checkIcon).toHaveClass('material-icons')
        })

        it('should not display check icon for non selected smart follow ups', () => {
            renderWithStoreAndQueryClientProvider(
                <SmartFollowUps
                    smartFollowUps={mockFollowUps}
                    selectedSmartFollowUpIndex={1}
                />,
                mockState,
            )

            const smartFollowUps = screen.getAllByTestId('pill')
            expect(smartFollowUps).toHaveLength(3)

            // Only the first pill should have the check icon
            const firstSmartFollowUp = smartFollowUps[0]
            expect(firstSmartFollowUp).toHaveTextContent('check')
            expect(firstSmartFollowUp).toHaveTextContent('Shipping policy')

            // Other pills should not have check icon
            const secondSmartFollowUp = smartFollowUps[1]
            expect(secondSmartFollowUp).not.toHaveTextContent('check')
            expect(secondSmartFollowUp).toHaveTextContent('Order status')

            const thirdSmartFollowUp = smartFollowUps[2]
            expect(thirdSmartFollowUp).not.toHaveTextContent('check')
            expect(thirdSmartFollowUp).toHaveTextContent('Return policy')
        })

        it('should render tooltip for the selected smart follow up', async () => {
            const tooltipText =
                'Customer selected a quick-reply given by the AI Agent'

            renderWithStoreAndQueryClientProvider(
                <SmartFollowUps
                    smartFollowUps={mockFollowUps}
                    selectedSmartFollowUpIndex={0}
                />,
                mockState,
            )

            expect(screen.queryByText(tooltipText)).toBeFalsy()

            const user = userEvent.setup()

            await act(async () => {
                await user.hover(screen.getByText('Shipping policy'))
            })
            expect(screen.queryByText(tooltipText)).toBeFalsy()

            await act(async () => {
                await user.hover(screen.getByText('Return policy'))
            })
            expect(screen.queryByText(tooltipText)).toBeFalsy()

            await act(async () => {
                await user.hover(screen.getByText('Order status'))
            })
            expect(screen.getByText(tooltipText)).toBeInTheDocument()
        })

        it('should apply correct CSS classes when there no smart follow up has been selected', () => {
            const { container } = renderWithStoreAndQueryClientProvider(
                <SmartFollowUps smartFollowUps={mockFollowUps} />,
                mockState,
            )

            const smartFollowUpsContainer = container.firstChild
            expect(smartFollowUpsContainer).toHaveClass('topSpacing')
        })

        it('should not apply topSpacing class when a smart follow up has been selected', () => {
            const { container } = renderWithStoreAndQueryClientProvider(
                <SmartFollowUps
                    smartFollowUps={mockFollowUps}
                    selectedSmartFollowUpIndex={1}
                />,
                mockState,
            )

            const smartFollowUpsContainer = container.firstChild
            expect(smartFollowUpsContainer).not.toHaveClass('topSpacing')
        })

        it('should render pills with correct color and className', () => {
            renderWithStoreAndQueryClientProvider(
                <SmartFollowUps smartFollowUps={mockFollowUps} />,
                mockState,
            )

            const pills = screen.getAllByTestId('pill')
            pills.forEach((pill) => {
                expect(pill).toHaveAttribute('data-color', 'secondary')
                expect(pill).toHaveClass('pill')
            })
        })
    })

    describe('when shouldDisplayAllFollowUps is false', () => {
        const mockState = {
            ticket: fromJS({
                _internal: {
                    shouldDisplayAllFollowUps: false,
                },
            }),
        }

        it('should display only the selected smart follow up', () => {
            renderWithStoreAndQueryClientProvider(
                <SmartFollowUps
                    smartFollowUps={mockFollowUps}
                    selectedSmartFollowUpIndex={2}
                />,
                mockState,
            )

            expect(screen.getByText('Return policy')).toBeInTheDocument()
            expect(screen.queryByText('Order status')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Shipping policy'),
            ).not.toBeInTheDocument()
        })

        it('should display check icon for the selected smart follow up', () => {
            renderWithStoreAndQueryClientProvider(
                <SmartFollowUps
                    smartFollowUps={mockFollowUps}
                    selectedSmartFollowUpIndex={2}
                />,
                mockState,
            )

            const checkIcon = screen.getByText('check')
            expect(checkIcon).toBeInTheDocument()
            expect(checkIcon).toHaveClass('material-icons')
        })

        it('should return null when no follow ups were selected', () => {
            const { container } = renderWithStoreAndQueryClientProvider(
                <SmartFollowUps smartFollowUps={mockFollowUps} />,
            )

            expect(container.firstChild).toBeNull()
        })
    })
})
