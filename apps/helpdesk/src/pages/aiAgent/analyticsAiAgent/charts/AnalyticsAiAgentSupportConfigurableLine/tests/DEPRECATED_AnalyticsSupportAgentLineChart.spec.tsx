import { screen, waitFor } from '@testing-library/react'

import { useAiAgentSupportInteractionsTimeSeriesData } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import { useAiAgentSupportInteractionsTrend } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { DEPRECATED_AnalyticsSupportAgentLineChart } from '../DEPRECATED_AnalyticsSupportAgentLineChart'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const mockUseAutomateFilters = jest.mocked(useAutomateFilters)

jest.mock('domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend')
const mockUseAiAgentSupportInteractionsTrend = jest.mocked(
    useAiAgentSupportInteractionsTrend,
)

jest.mock(
    'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData',
)
const mockUseAiAgentSupportInteractionsTimeSeriesData = jest.mocked(
    useAiAgentSupportInteractionsTimeSeriesData,
)

describe('DEPRECATED_AnalyticsSupportAgentLineChart', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseAutomateFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-06-25T00:00:00.000Z',
                    end_datetime: '2024-07-01T23:59:59.999Z',
                },
            },
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        mockUseAiAgentSupportInteractionsTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 430,
                prevValue: 400,
            },
        } as any)

        mockUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: [[{ date: '2024-06-25', value: 430 }]],
            isLoading: false,
        } as any)
    })

    it('should render the chart card with title', async () => {
        renderWithQueryClientProvider(
            <DEPRECATED_AnalyticsSupportAgentLineChart />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render loading state when fetching trend data', () => {
        mockUseAiAgentSupportInteractionsTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: null,
                prevValue: null,
            },
        } as any)

        renderWithQueryClientProvider(
            <DEPRECATED_AnalyticsSupportAgentLineChart />,
        )

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should display the value from trend data', async () => {
        renderWithQueryClientProvider(
            <DEPRECATED_AnalyticsSupportAgentLineChart />,
        )

        await waitFor(() => {
            expect(screen.getByText('430')).toBeInTheDocument()
        })
    })
})
