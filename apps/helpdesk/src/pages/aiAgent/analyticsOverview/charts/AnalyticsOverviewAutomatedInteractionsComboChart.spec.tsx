import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AnalyticsOverviewAutomatedInteractionsComboChart } from './AnalyticsOverviewAutomatedInteractionsComboChart'

jest.mock(
    'domains/reporting/hooks/automate/useAutomatedInteractionsBySkill',
    () => ({
        useAutomatedInteractionsBySkill: jest.fn(() => ({
            data: [
                { name: 'Support', value: 100 },
                { name: 'Shopping assistant', value: 50 },
            ],
            isLoading: false,
            isError: false,
        })),
    }),
)

jest.mock(
    '../../analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsMetric',
    () => ({
        useAiAgentAutomatedInteractionsMetric: jest.fn(() => ({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 150,
                prevValue: 100,
            },
        })),
    }),
)

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(() => ({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
        })),
    }),
)

describe('AnalyticsOverviewAutomatedInteractionsComboChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }

        Element.prototype.getAnimations = function () {
            return []
        }
    })
    it('should render chart with data', async () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should toggle between donut and bar chart', async () => {
        const user = userEvent.setup()
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        const radioGroup = screen.getByRole('radiogroup')
        const buttons = within(radioGroup).getAllByRole('radio')
        const barChartButton = buttons[1] // Second button is the bar chart

        await act(() => user.click(barChartButton))

        await waitFor(() => {
            expect(barChartButton).toHaveAttribute('aria-checked', 'true')
        })
    })
})
