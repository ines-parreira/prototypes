import React from 'react'

import { renderHook } from '@repo/testing'
import { UseQueryResult } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    fetchAverageCSATPerAssigneeTable,
    fetchAverageCSATPerChannelTable,
    fetchAverageCSATPerIntegrationTable,
    useAverageCSATPerAssigneeTimeseries,
    useAverageCSATPerChannelTimeseries,
    useAverageCSATPerIntegrationTimeseries,
} from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TagSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesDimension } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { averageCSATScorePerDimensionTimeSeriesFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { createTimeSeriesPerDimensionReport } from 'domains/reporting/services/SLAsReportingService'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { ticketInsightsSlice } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { OrderDirection } from 'models/api/types'
import { RootState } from 'state/types'

const mockStore = configureMockStore([thunk])

jest.mock('domains/reporting/hooks/timeSeries')
jest.mock('domains/reporting/hooks/metricsPerPeriod')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useTimeSeries')

jest.mock('domains/reporting/services/SLAsReportingService', () => ({
    createTimeSeriesPerDimensionReport: jest.fn(),
}))

const useTimeSeriesPerDimensionMock = jest.mocked(useTimeSeriesPerDimension)
const useNewStatsFiltersMock = jest.mocked(useStatsFilters)

describe('useAverageScorePerDimensionTimeSeries', () => {
    const mockFilters = {
        period: { start_datetime: '2023-04-07', end_datetime: '2023-04-09' },
    }
    const mockTimezone = 'UTC'

    const defaultState = {
        stats: initialState,
        ui: {
            stats: {
                [ticketInsightsSlice.name]: {
                    selectedCustomField: { id: 2 },
                },
                filters: uiStatsInitialState,
            },
        },
        entities: {},
    } as RootState

    const mockChannelData = {
        data: [
            { dateTime: '2023-04-07T00:00:00.000', value: 3.1 },
            { dateTime: '2023-04-08T00:00:00.000', value: 3.2 },
            { dateTime: '2023-04-09T00:00:00.000', value: 3.3 },
        ],
        isFetching: false,
    }

    const mockAssigneeData = {
        data: [
            { dateTime: '2023-04-07T00:00:00.000', value: 4.1 },
            { dateTime: '2023-04-08T00:00:00.000', value: 4.2 },
            { dateTime: '2023-04-09T00:00:00.000', value: 4.3 },
        ],
        isFetching: false,
    }

    const mockIntegrationData = {
        data: [
            { dateTime: '2023-04-07T00:00:00.000', value: 2.1 },
            { dateTime: '2023-04-08T00:00:00.000', value: 2.2 },
            { dateTime: '2023-04-09T00:00:00.000', value: 2.3 },
        ],
        isFetching: false,
    }

    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            granularity: ReportingGranularity.Hour,
            cleanStatsFilters: mockFilters,
            userTimezone: 'UTC',
        })

        useTimeSeriesPerDimensionMock.mockImplementation(
            (queryConfig: { dimensions: string[] }) => {
                if (queryConfig.dimensions?.includes(TicketDimension.Channel)) {
                    return mockChannelData as UseQueryResult<any>
                }
                if (
                    queryConfig.dimensions?.includes(
                        TicketDimension.AssigneeUserId,
                    )
                ) {
                    return mockAssigneeData as UseQueryResult<any>
                }
                if (
                    queryConfig.dimensions?.includes(
                        TicketMessagesDimension.Integration,
                    )
                ) {
                    return mockIntegrationData as UseQueryResult<any>
                }
                return {
                    data: undefined,
                    isFetching: false,
                } as UseQueryResult<any>
            },
        )
    })

    it('should return average csat score per channel trend', () => {
        const { result } = renderHook(
            () => useAverageCSATPerChannelTimeseries(mockFilters, mockTimezone),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledTimes(1)
        const queryConfig = useTimeSeriesPerDimensionMock.mock.calls[0][0]
        expect(queryConfig).toMatchObject(
            averageCSATScorePerDimensionTimeSeriesFactory(
                TicketDimension.Channel,
                mockFilters,
                mockTimezone,
                ReportingGranularity.Hour,
                OrderDirection.Desc,
            ),
        )
        expect(result.current).toEqual(mockChannelData)
    })

    it('should return average csat score per assignee trend', () => {
        const { result } = renderHook(
            () =>
                useAverageCSATPerAssigneeTimeseries(mockFilters, mockTimezone),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledTimes(1)
        const queryConfig = useTimeSeriesPerDimensionMock.mock.calls[0][0]
        expect(queryConfig).toMatchObject(
            averageCSATScorePerDimensionTimeSeriesFactory(
                TicketDimension.AssigneeUserId,
                mockFilters,
                mockTimezone,
                ReportingGranularity.Hour,
                OrderDirection.Desc,
            ),
        )
        expect(result.current).toEqual(mockAssigneeData)
    })

    it('should return average csat score per integration trend', () => {
        const { result } = renderHook(
            () =>
                useAverageCSATPerIntegrationTimeseries(
                    mockFilters,
                    mockTimezone,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledTimes(1)
        const queryConfig = useTimeSeriesPerDimensionMock.mock.calls[0][0]
        expect(queryConfig).toMatchObject(
            averageCSATScorePerDimensionTimeSeriesFactory(
                TicketMessagesDimension.Integration,
                mockFilters,
                mockTimezone,
                ReportingGranularity.Hour,
                OrderDirection.Desc,
            ),
        )
        expect(result.current).toEqual(mockIntegrationData)
    })

    it('should handle errors correctly', () => {
        useTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: true,
            error: new Error('Failed to fetch'),
        } as UseQueryResult<any>)

        const { result } = renderHook(
            () => useAverageCSATPerChannelTimeseries(mockFilters, mockTimezone),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should handle loading state', () => {
        useTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: true,
        } as UseQueryResult<any>)

        const { result } = renderHook(
            () => useAverageCSATPerChannelTimeseries(mockFilters, mockTimezone),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current.isFetching).toBe(true)
    })
})

describe('fetch download methods', () => {
    const mockFilters = {
        period: { start_datetime: '2023-04-07', end_datetime: '2023-04-09' },
    }
    const mockTimezone = 'UTC'
    const mockGranularity = ReportingGranularity.Day
    const mockContext = {
        getAgentDetails: (id: number) => ({ id, name: `Agent ${id}` }),
        integrations: [{ id: 1, name: 'Integration 1' }],
        tagResultsSelection: TagSelection.includeTags,
    } as any

    const mockTimeSeriesData = {
        value1: [
            [
                {
                    dateTime: '2025-02-05T00:00:00.000',
                    value: 1,
                    label: 'metric1',
                },
                {
                    dateTime: '2025-02-06T00:00:00.000',
                    value: 2,
                    label: 'metric1',
                },
            ],
            [
                {
                    dateTime: '2025-02-05T00:00:00.000',
                    value: 3,
                    label: 'metric2',
                },
                {
                    dateTime: '2025-02-06T00:00:00.000',
                    value: 4,
                    label: 'metric2',
                },
            ],
        ],
        value2: [
            [
                {
                    dateTime: '2025-02-05T00:00:00.000',
                    value: 5,
                    label: 'metric1',
                },
                {
                    dateTime: '2025-02-06T00:00:00.000',
                    value: 6,
                    label: 'metric1',
                },
            ],
            [
                {
                    dateTime: '2025-02-05T00:00:00.000',
                    value: 7,
                    label: 'metric2',
                },
                {
                    dateTime: '2025-02-06T00:00:00.000',
                    value: 8,
                    label: 'metric2',
                },
            ],
        ],
    }

    const mockReportFiles = {
        files: {
            'report.csv': 'test data',
        },
    }

    beforeEach(() => {
        jest.mocked(fetchTimeSeriesPerDimension).mockResolvedValue(
            mockTimeSeriesData,
        )
        jest.mocked(createTimeSeriesPerDimensionReport).mockReturnValue(
            mockReportFiles,
        )
    })

    describe('fetchAverageCSATPerAssigneeTable', () => {
        it('should fetch and format assignee CSAT data correctly', async () => {
            const result = await fetchAverageCSATPerAssigneeTable(
                mockFilters,
                mockTimezone,
                mockGranularity,
                mockContext,
            )

            expect(fetchTimeSeriesPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    dimensions: [TicketDimension.AssigneeUserId],
                }),
            )
            expect(createTimeSeriesPerDimensionReport).toHaveBeenCalled()
            expect(result).toEqual({
                isLoading: false,
                fileName: 'satisfaction_average_csat_per_assignee-over-time',
                files: mockReportFiles.files,
            })
        })

        it('should handle errors gracefully', async () => {
            jest.mocked(fetchTimeSeriesPerDimension).mockRejectedValue(
                new Error('API Error'),
            )

            await expect(
                fetchAverageCSATPerAssigneeTable(
                    mockFilters,
                    mockTimezone,
                    mockGranularity,
                    mockContext,
                ),
            ).rejects.toThrow('API Error')
        })
    })

    describe('fetchAverageCSATPerChannelTable', () => {
        it('should fetch and format channel CSAT data correctly', async () => {
            const result = await fetchAverageCSATPerChannelTable(
                mockFilters,
                mockTimezone,
                mockGranularity,
                mockContext,
            )

            expect(fetchTimeSeriesPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    dimensions: [TicketDimension.Channel],
                }),
            )
            expect(createTimeSeriesPerDimensionReport).toHaveBeenCalled()
            expect(result).toEqual({
                isLoading: false,
                fileName: 'satisfaction_average_csat_per_channel-over-time',
                files: mockReportFiles.files,
            })
        })

        it('should handle empty data', async () => {
            jest.mocked(fetchTimeSeriesPerDimension).mockResolvedValue({})

            const result = await fetchAverageCSATPerChannelTable(
                mockFilters,
                mockTimezone,
                mockGranularity,
                mockContext,
            )

            expect(result.files).toBeDefined()
            expect(createTimeSeriesPerDimensionReport).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        data: expect.any(Array),
                        label: 'satisfaction_average_csat_per_channel-over-time',
                    }),
                ]),
                mockFilters.period,
            )
        })
    })

    describe('fetchAverageCSATPerIntegrationTable', () => {
        it('should fetch and format integration CSAT data correctly', async () => {
            const result = await fetchAverageCSATPerIntegrationTable(
                mockFilters,
                mockTimezone,
                mockGranularity,
                mockContext,
            )

            expect(fetchTimeSeriesPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    dimensions: [TicketMessagesDimension.Integration],
                }),
            )
            expect(createTimeSeriesPerDimensionReport).toHaveBeenCalled()
            expect(result).toEqual({
                isLoading: false,
                fileName: 'satisfaction_average_csat_per_integration-over-time',
                files: mockReportFiles.files,
            })
        })

        it('should handle context with no integrations', async () => {
            const contextWithoutIntegrations = {
                ...mockContext,
                integrations: [],
            }

            jest.mocked(fetchTimeSeriesPerDimension).mockResolvedValue({})

            const result = await fetchAverageCSATPerIntegrationTable(
                mockFilters,
                mockTimezone,
                mockGranularity,
                contextWithoutIntegrations,
            )

            expect(result).toBeDefined()
            expect(result.isLoading).toBe(false)
            expect(result.fileName).toBe(
                'satisfaction_average_csat_per_integration-over-time',
            )
        })
    })
})
