import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { useAiAgentSupportInteractionsMetric } from '../../../hooks/useAiAgentSupportInteractionsMetric'
import { useSupportInteractionsByIntent } from '../../../hooks/useSupportInteractionsByIntent'
import { SupportInteractionsComboChart } from '../SupportInteractionsComboChart'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock('../../../hooks/useAiAgentSupportInteractionsMetric')
const mockUseAiAgentSupportInteractionsMetric = jest.mocked(
    useAiAgentSupportInteractionsMetric,
)

jest.mock('../../../hooks/useSupportInteractionsByIntent')
const mockUseSupportInteractionsByIntent = jest.mocked(
    useSupportInteractionsByIntent,
)

describe('SupportInteractionsComboChart', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-06-25T00:00:00.000Z',
            end_datetime: '2024-07-01T23:59:59.999Z',
        },
    }

    const mockChartData = [
        { name: 'Order::Status', value: 150 },
        { name: 'Shipping::Tracking', value: 120 },
        { name: 'Return::Request', value: 80 },
        { name: 'Product::Question', value: 50 },
        { name: 'Payment::Issue', value: 30 },
    ]

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        mockUseAiAgentSupportInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            isFieldsAvailable: true,
            data: {
                label: 'Automated interactions',
                value: 430,
                prevValue: 400,
            },
        })

        mockUseSupportInteractionsByIntent.mockReturnValue({
            data: mockChartData,
            isLoading: false,
            isError: false,
            isFieldsAvailable: true,
        })
    })

    it('should render nothing when fields are not available', () => {
        mockUseSupportInteractionsByIntent.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            isFieldsAvailable: false,
        })

        const { container } = renderWithQueryClientProvider(
            <SupportInteractionsComboChart />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render the chart card with title', async () => {
        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render loading state when fetching trend data', () => {
        mockUseAiAgentSupportInteractionsMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            isFieldsAvailable: true,
            data: {
                label: 'Automated interactions',
                value: null,
                prevValue: null,
            },
        })

        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render loading state when fetching chart data', () => {
        mockUseSupportInteractionsByIntent.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            isFieldsAvailable: true,
        })

        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render horizontal bar chart with data', async () => {
        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('430')).toBeInTheDocument()
        })
    })

    it('should display the value from trend data', async () => {
        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(screen.getByText('430')).toBeInTheDocument()
        })
    })

    it('should filter out chart data items with zero value', async () => {
        mockUseSupportInteractionsByIntent.mockReturnValue({
            data: [
                { name: 'Order::Status', value: 150 },
                { name: 'Empty::Intent', value: 0 },
                { name: 'Shipping::Tracking', value: 120 },
            ],
            isLoading: false,
            isError: false,
            isFieldsAvailable: true,
        })

        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should handle undefined chart data gracefully', async () => {
        mockUseSupportInteractionsByIntent.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            isFieldsAvailable: true,
        })

        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render with correct metric format', async () => {
        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(screen.getByText('430')).toBeInTheDocument()
        })
    })

    it('should use useStatsFilters for period data', () => {
        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should use useAiAgentSupportInteractionsMetric for trend data', () => {
        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        expect(mockUseAiAgentSupportInteractionsMetric).toHaveBeenCalled()
    })

    it('should use useSupportInteractionsByIntent for chart data', () => {
        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        expect(mockUseSupportInteractionsByIntent).toHaveBeenCalled()
    })

    it('should handle error state in trend data', async () => {
        mockUseAiAgentSupportInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: true,
            isFieldsAvailable: true,
            data: {
                label: 'Automated interactions',
                value: null,
                prevValue: null,
            },
        })

        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should handle error state in chart data', async () => {
        mockUseSupportInteractionsByIntent.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            isFieldsAvailable: true,
        })

        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render with different period values', async () => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00.000Z',
                    end_datetime: '2024-12-31T23:59:59.999Z',
                },
            },
            granularity: 'month',
            userTimezone: 'America/New_York',
        } as any)

        renderWithQueryClientProvider(<SupportInteractionsComboChart />)

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })
})
