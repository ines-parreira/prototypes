import { assumeMock } from '@repo/testing'
import {
    QueryClient,
    QueryClientProvider,
    UseQueryResult,
} from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    useAverageCSATPerAssigneeTimeseries,
    useAverageCSATPerChannelTimeseries,
    useAverageCSATPerIntegrationTimeseries,
} from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AverageScorePerDimensionTrendChart } from 'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerDimensionTrendChart'

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries',
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
        Skeleton: () => <div data-testid="skeleton" />,
    } as Record<string, unknown>
})

jest.mock('domains/reporting/hooks/metricsPerPeriod')
jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
    () => ({
        LineChart: ({
            isLoading,
            data,
            renderYTickLabel,
        }: {
            isLoading: boolean
            data: Array<{ label: string }>
            renderYTickLabel?: (value: number) => string
        }) => {
            if (isLoading) {
                return <div data-testid="skeleton" />
            }

            return (
                <div data-testid="chart">
                    {data?.map((dataset: { label: string }, index: number) => (
                        <div key={index} data-testid="dataset">
                            {dataset.label}
                        </div>
                    ))}
                    {renderYTickLabel && (
                        <div data-testid="y-tick-labels">
                            <span data-testid="y-tick-0">
                                {renderYTickLabel(0)}
                            </span>
                            <span data-testid="y-tick-5">
                                {renderYTickLabel(5)}
                            </span>
                        </div>
                    )}
                </div>
            )
        },
    }),
)

const mockStore = configureMockStore([thunk])

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const useAverageCSATPerChannelTimeseriesMock = assumeMock(
    useAverageCSATPerChannelTimeseries,
)
const useAverageCSATPerAssigneeTimeseriesMock = assumeMock(
    useAverageCSATPerAssigneeTimeseries,
)
const useAverageCSATPerIntegrationTimeseriesMock = assumeMock(
    useAverageCSATPerIntegrationTimeseries,
)
const useStatsFiltersMock = assumeMock(useStatsFilters)

const renderComponent = (state: any) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>
                <AverageScorePerDimensionTrendChart />
            </Provider>
        </QueryClientProvider>,
    )
}

const getSuccessResponse = (data: any) =>
    ({
        data,
        isFetching: false,
        isError: false,
        isSuccess: true,
        error: null,
    }) as UseQueryResult<any>

const getErrorResponse = (error: Error) =>
    ({
        data: undefined,
        isFetching: false,
        isError: true,
        isSuccess: false,
        error,
    }) as UseQueryResult<any>

describe('<AverageScorePerDimensionTrendChart>', () => {
    const defaultFilters = {
        period: { start_datetime: '2023-04-07', end_datetime: '2023-04-09' },
    }

    const mockStoreState = {
        agents: fromJS({
            all: [
                {
                    id: 1,
                    name: 'agent1',
                },
                {
                    id: 2,
                    name: 'agent2',
                },
            ],
        }),
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    name: 'email',
                    type: 'integration',
                },
                {
                    id: 2,
                    name: 'gmail',
                    type: 'integration',
                },
            ],
            authentication: {},
            state: {
                loading: {},
                error: {},
            },
        }),
    }

    const mockTimeseriesData = {
        email: [
            [
                {
                    dateTime: '2023-04-07T00:00:00.000',
                    value: 4.4,
                    label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                },
                {
                    dateTime: '2023-04-08T00:00:00.000',
                    value: 4.5,
                    label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                },
            ],
            [
                {
                    dateTime: '2023-04-07T00:00:00.000',
                    value: 10,
                    label: TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
                },
                {
                    dateTime: '2023-04-08T00:00:00.000',
                    value: 15,
                    label: TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
                },
            ],
        ],
        chat: [
            [
                {
                    dateTime: '2023-04-07T00:00:00.000',
                    value: 3.1,
                    label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                },
                {
                    dateTime: '2023-04-08T00:00:00.000',
                    value: 3.2,
                    label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                },
            ],
            [
                {
                    dateTime: '2023-04-07T00:00:00.000',
                    value: 5,
                    label: TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
                },
                {
                    dateTime: '2023-04-08T00:00:00.000',
                    value: 8,
                    label: TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
                },
            ],
        ],
    }

    const mockAssigneeData = {
        agent1: [
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 4.2 },
                { dateTime: '2023-04-08T00:00:00.000', value: 4.3 },
            ],
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 8 },
                { dateTime: '2023-04-08T00:00:00.000', value: 12 },
            ],
        ],
        agent2: [
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 3.8 },
                { dateTime: '2023-04-08T00:00:00.000', value: 3.9 },
            ],
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 6 },
                { dateTime: '2023-04-08T00:00:00.000', value: 9 },
            ],
        ],
    }

    const mockIntegrationData = {
        email: [
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 4.1 },
                { dateTime: '2023-04-08T00:00:00.000', value: 4.2 },
            ],
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 7 },
                { dateTime: '2023-04-08T00:00:00.000', value: 11 },
            ],
        ],
        gmail: [
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 3.5 },
                { dateTime: '2023-04-08T00:00:00.000', value: 3.6 },
            ],
            [
                { dateTime: '2023-04-07T00:00:00.000', value: 4 },
                { dateTime: '2023-04-08T00:00:00.000', value: 7 },
            ],
        ],
    }

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            granularity: ReportingGranularity.Hour,
            cleanStatsFilters: defaultFilters,
            userTimezone: 'UTC',
        })

        useAverageCSATPerChannelTimeseriesMock.mockReturnValue(
            getSuccessResponse(mockTimeseriesData),
        )
        useAverageCSATPerAssigneeTimeseriesMock.mockReturnValue(
            getSuccessResponse(mockAssigneeData),
        )
        useAverageCSATPerIntegrationTimeseriesMock.mockReturnValue(
            getSuccessResponse(mockIntegrationData),
        )
    })

    it('should render channel trend chart by default', () => {
        renderComponent(mockStoreState)

        expect(screen.getByTestId('chart')).toBeInTheDocument()
        expect(screen.getAllByTestId('dataset')).toHaveLength(3)
        expect(screen.getByText('email')).toBeInTheDocument()
        expect(screen.getByText('chat')).toBeInTheDocument()
    })

    it('should render assignee trend chart when switched', async () => {
        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')
        await userEvent.click(selectBox)
        const assigneeOption = screen.getByText('Per assignee')
        await userEvent.click(assigneeOption)

        expect(screen.getByText('agent1')).toBeInTheDocument()
        expect(screen.getByText('agent2')).toBeInTheDocument()
    })

    it('should render integration trend chart when switched', async () => {
        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')
        await userEvent.click(selectBox)
        const integrationOption = screen.getByText('Per integration')
        await userEvent.click(integrationOption)

        expect(screen.getByText('email')).toBeInTheDocument()
        expect(screen.getByText('gmail')).toBeInTheDocument()
    })

    it('should show loading state', () => {
        useAverageCSATPerChannelTimeseriesMock.mockReturnValue({
            data: [],
            isFetching: true,
        } as UseQueryResult<any>)

        renderComponent(mockStoreState)

        expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should show error state', async () => {
        useAverageCSATPerChannelTimeseriesMock.mockReturnValue({
            data: [],
            isError: true,
            error: new Error('Failed to load data'),
        } as UseQueryResult<any>)

        renderComponent(mockStoreState)

        expect(screen.getByText(/failed to load data/i)).toBeInTheDocument()
    })

    it('should show error state for assignee metric', async () => {
        useAverageCSATPerAssigneeTimeseriesMock.mockReturnValue(
            getErrorResponse(new Error('Failed to load data')),
        )
        useAverageCSATPerChannelTimeseriesMock.mockReturnValue(
            getSuccessResponse(mockTimeseriesData),
        )
        useAverageCSATPerIntegrationTimeseriesMock.mockReturnValue(
            getSuccessResponse(mockIntegrationData),
        )

        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')
        await userEvent.click(selectBox)
        const assigneeOption = screen.getByText('Per assignee')
        await userEvent.click(assigneeOption)

        expect(screen.getByText(/failed to load data/i)).toBeInTheDocument()
    })

    it('should show error state for integration metric', async () => {
        useAverageCSATPerIntegrationTimeseriesMock.mockReturnValue(
            getErrorResponse(new Error('Failed to load data')),
        )
        useAverageCSATPerChannelTimeseriesMock.mockReturnValue(
            getSuccessResponse(mockTimeseriesData),
        )
        useAverageCSATPerAssigneeTimeseriesMock.mockReturnValue(
            getSuccessResponse(mockAssigneeData),
        )

        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')
        await userEvent.click(selectBox)
        const assigneeOption = screen.getByText('Per integration')
        await userEvent.click(assigneeOption)

        expect(screen.getByText(/failed to load data/i)).toBeInTheDocument()
    })

    it('should open dimension selector dropdown when clicked', async () => {
        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')
        await userEvent.click(selectBox)

        expect(screen.getByText('Per assignee')).toBeInTheDocument()
        expect(screen.getByText('Per integration')).toBeInTheDocument()
    })

    it('should close dimension selector dropdown when option is selected', async () => {
        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')

        await userEvent.click(selectBox)

        const assigneeOption = screen.getByText('Per assignee')
        await userEvent.click(assigneeOption)

        expect(screen.queryByText('Per integration')).not.toBeInTheDocument()
    })

    it('should render N/A for zero values in channel view', async () => {
        renderComponent(mockStoreState)
        expect(screen.getByTestId('y-tick-0')).toHaveTextContent('N/A')
        expect(screen.getByTestId('y-tick-5')).toHaveTextContent('5')
    })

    it('should render N/A for zero values in assignee view', async () => {
        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')
        await userEvent.click(selectBox)
        await userEvent.click(screen.getByText('Per assignee'))
        expect(screen.getByTestId('y-tick-0')).toHaveTextContent('N/A')
        expect(screen.getByTestId('y-tick-5')).toHaveTextContent('5')
    })

    it('should render N/A for zero values in integration view', async () => {
        renderComponent(mockStoreState)
        const selectBox = screen.getByRole('combobox')
        await userEvent.click(selectBox)
        await userEvent.click(screen.getByText('Per integration'))
        expect(screen.getByTestId('y-tick-0')).toHaveTextContent('N/A')
        expect(screen.getByTestId('y-tick-5')).toHaveTextContent('5')
    })

    it('should handle invalid timeseries data length', () => {
        const invalidTimeseriesData = {
            email: [
                [
                    {
                        dateTime: '2023-04-07T00:00:00.000',
                        value: 4.4,
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                    },
                    {
                        dateTime: '2023-04-08T00:00:00.000',
                        value: 4.5,
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                    },
                ],
            ],
            chat: [
                [
                    {
                        dateTime: '2023-04-07T00:00:00.000',
                        value: 5.4,
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                    },
                    {
                        dateTime: '2023-04-08T00:00:00.000',
                        value: 5.5,
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                    },
                ],
            ],
        }

        useAverageCSATPerChannelTimeseriesMock.mockReturnValue(
            getSuccessResponse(invalidTimeseriesData),
        )

        renderComponent(mockStoreState)
        const labels = screen.getAllByTestId('dataset')
        expect(labels).toHaveLength(2)
        expect(labels[0]).toHaveTextContent('email')
        expect(labels[1]).toHaveTextContent('chat')
    })
})
