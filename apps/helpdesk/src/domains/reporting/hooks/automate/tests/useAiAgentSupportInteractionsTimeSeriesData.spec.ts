import { renderHook } from '@testing-library/react'

import {
    fetchAiAgentSupportInteractionsTimeSeriesData,
    useAiAgentSupportInteractionsTimeSeriesData,
} from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import type { TimeSeriesResult } from 'domains/reporting/hooks/useTimeSeries'
import * as useTimeSeriesModule from 'domains/reporting/hooks/useTimeSeries'
import {
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentSkills,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

const mockTimezone = 'America/New_York'
const mockGranularity = ReportingGranularity.Day

const mockTimeSeriesData = [
    [
        {
            dateTime: '2024-01-01T00:00:00Z',
            value: 100,
            label: 'Automated interactions',
        },
        {
            dateTime: '2024-01-02T00:00:00Z',
            value: 150,
            label: 'Automated interactions',
        },
    ],
]

describe('useAiAgentSupportInteractionsTimeSeriesData', () => {
    let useTimeSeriesSpy: jest.SpyInstance

    beforeEach(() => {
        useTimeSeriesSpy = jest.spyOn(useTimeSeriesModule, 'useTimeSeries')
    })

    afterEach(() => {
        useTimeSeriesSpy.mockRestore()
    })

    it('should call useTimeSeries with correct parameters including AIAgentSupport filter', () => {
        const mockReturnValue = {
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as unknown as TimeSeriesResult

        useTimeSeriesSpy.mockReturnValue(mockReturnValue)

        renderHook(() =>
            useAiAgentSupportInteractionsTimeSeriesData(
                mockFilters,
                mockTimezone,
                mockGranularity,
            ),
        )

        expect(useTimeSeriesSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    {
                        member: AIAgentInteractionsBySkillDatasetDimension.BillableType,
                        operator: ReportingFilterOperator.Equals,
                        values: [AIAgentSkills.AIAgentSupport],
                    },
                ]),
            }),
        )
    })

    it('should return the data from useTimeSeries', () => {
        const mockReturnValue = {
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as unknown as TimeSeriesResult

        useTimeSeriesSpy.mockReturnValue(mockReturnValue)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsTimeSeriesData(
                mockFilters,
                mockTimezone,
                mockGranularity,
            ),
        )

        expect(result.current).toEqual({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        })
    })

    it('should return loading state when isFetching is true', () => {
        const mockReturnValue = {
            data: [[]],
            isFetching: true,
            isError: false,
        } as unknown as TimeSeriesResult

        useTimeSeriesSpy.mockReturnValue(mockReturnValue)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsTimeSeriesData(
                mockFilters,
                mockTimezone,
                mockGranularity,
            ),
        )

        expect(result.current).toEqual({
            data: [[]],
            isFetching: true,
            isError: false,
        })
    })

    it('should return error state when isError is true', () => {
        const mockReturnValue = {
            data: [[]],
            isFetching: false,
            isError: true,
        } as unknown as TimeSeriesResult

        useTimeSeriesSpy.mockReturnValue(mockReturnValue)

        const { result } = renderHook(() =>
            useAiAgentSupportInteractionsTimeSeriesData(
                mockFilters,
                mockTimezone,
                mockGranularity,
            ),
        )

        expect(result.current).toEqual({
            data: [[]],
            isFetching: false,
            isError: true,
        })
    })
})

describe('fetchAiAgentSupportInteractionsTimeSeriesData', () => {
    let fetchTimeSeriesSpy: jest.SpyInstance

    beforeEach(() => {
        fetchTimeSeriesSpy = jest.spyOn(useTimeSeriesModule, 'fetchTimeSeries')
    })

    afterEach(() => {
        fetchTimeSeriesSpy.mockRestore()
    })

    it('should call fetchTimeSeries with correct parameters including AIAgentSupport filter', async () => {
        fetchTimeSeriesSpy.mockResolvedValue(mockTimeSeriesData)

        await fetchAiAgentSupportInteractionsTimeSeriesData(
            mockFilters,
            mockTimezone,
            mockGranularity,
        )

        expect(fetchTimeSeriesSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    {
                        member: AIAgentInteractionsBySkillDatasetDimension.BillableType,
                        operator: ReportingFilterOperator.Equals,
                        values: [AIAgentSkills.AIAgentSupport],
                    },
                ]),
            }),
        )
    })

    it('should return the data from fetchTimeSeries', async () => {
        fetchTimeSeriesSpy.mockResolvedValue(mockTimeSeriesData)

        const result = await fetchAiAgentSupportInteractionsTimeSeriesData(
            mockFilters,
            mockTimezone,
            mockGranularity,
        )

        expect(result).toBe(mockTimeSeriesData)
    })

    it('should handle empty data', async () => {
        const emptyData = [[]]
        fetchTimeSeriesSpy.mockResolvedValue(emptyData)

        const result = await fetchAiAgentSupportInteractionsTimeSeriesData(
            mockFilters,
            mockTimezone,
            mockGranularity,
        )

        expect(result).toEqual(emptyData)
    })
})
