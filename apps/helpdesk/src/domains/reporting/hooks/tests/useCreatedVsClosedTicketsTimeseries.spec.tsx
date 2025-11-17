import type { ComponentType } from 'react'
import type React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import { useCreatedVsClosedTicketsTimeSeries } from 'domains/reporting/hooks/useCreatedVsClosedTicketsTimeSeries'
import type { TimeSeriesResult } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { formatTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { periodAndAggregationWindowToReportingGranularity } from 'domains/reporting/utils/reporting'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('domains/reporting/hooks/timeSeries')
const mockedUseTicketsClosedTimeSeries = assumeMock(useTicketsClosedTimeSeries)
const mockedUseTicketsCreatedTimeSeries = assumeMock(
    useTicketsCreatedTimeSeries,
)

jest.mock('domains/reporting/pages/common/utils')
const mockedFormatTimeSeriesData = assumeMock(formatTimeSeriesData)

jest.mock('domains/reporting/utils/reporting')
const mockedPeriodAndAggregationWindowToReportingGranularity = assumeMock(
    periodAndAggregationWindowToReportingGranularity,
)

const mockStore = configureMockStore<RootState, StoreDispatch>()

describe('useCreatedVsClosedTicketsTimeSeries', () => {
    const mockGranularity = ReportingGranularity.Month

    const mockTimezone = 'UTC'
    const filters = {
        period: { start_datetime: '2023-01-01', end_datetime: '2023-02-01' },
        agents: { values: [1, 2], operator: LogicalOperatorEnum.ALL_OF },
    }
    const defaultState = {
        stats: {
            filters,
        },
        ui: {
            stats: {
                filters: {
                    isFilterDirty: false,
                    cleanStatsFilters: filters,
                    savedFilterDraft: null,
                    appliedSavedFilterId: null,
                },
            },
        },
    } as RootState

    const mockClosedData = [
        [{ dateTime: '2023-01-01', value: 10, label: 'closed' }],
    ]
    const mockCreatedData = [
        [{ dateTime: '2023-01-01', value: 15, label: 'created' }],
    ]
    const mockTimeSeriesData = [
        {
            label: 'exampleLabel',
            values: [{ x: 'exampleX', y: 123 }],
            isDisabled: false,
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()

        mockedUseTicketsClosedTimeSeries.mockReturnValue({
            data: mockClosedData,
            isLoading: false,
            isError: false,
        } as TimeSeriesResult)
        mockedUseTicketsCreatedTimeSeries.mockReturnValue({
            data: mockCreatedData,
            isLoading: false,
            isError: false,
        } as TimeSeriesResult)
        mockedFormatTimeSeriesData.mockReturnValue(mockTimeSeriesData)
        mockedPeriodAndAggregationWindowToReportingGranularity.mockReturnValue(
            mockGranularity,
        )
    })

    it('should return formatted time series for closed and created tickets', () => {
        const { result } = renderHook(
            () => useCreatedVsClosedTicketsTimeSeries(),
            {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                )) as ComponentType,
            },
        )

        expect(result.current).toEqual(
            expect.objectContaining({
                timeSeries: [...mockTimeSeriesData, ...mockTimeSeriesData],
                isLoading: false,
            }),
        )
        expect(mockedFormatTimeSeriesData).toHaveBeenCalledTimes(2)
        expect(mockedUseTicketsClosedTimeSeries).toHaveBeenCalledWith(
            filters,
            mockTimezone,
            mockGranularity,
        )
        expect(mockedUseTicketsCreatedTimeSeries).toHaveBeenCalledWith(
            filters,
            mockTimezone,
            mockGranularity,
        )
    })
})
