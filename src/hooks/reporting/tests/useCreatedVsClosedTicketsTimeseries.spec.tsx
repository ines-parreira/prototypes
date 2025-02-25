import React, { ComponentType } from 'react'

import { UseQueryResult } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
} from 'hooks/reporting/timeSeries'
import { useCreatedVsClosedTicketsTimeSeries } from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { formatTimeSeriesData } from 'pages/stats/common/utils'
import { fromFiltersWithLogicalOperators } from 'state/stats/utils'
import { RootState, StoreDispatch } from 'state/types'
import { periodAndAggregationWindowToReportingGranularity } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
const mockedUseTicketsClosedTimeSeries = assumeMock(useTicketsClosedTimeSeries)
const mockedUseTicketsCreatedTimeSeries = assumeMock(
    useTicketsCreatedTimeSeries,
)

jest.mock('pages/stats/common/utils')
const mockedFormatTimeSeriesData = assumeMock(formatTimeSeriesData)

jest.mock('utils/reporting')
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
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()

        mockedUseTicketsClosedTimeSeries.mockReturnValue({
            data: mockClosedData,
            isLoading: false,
            isError: false,
        } as UseQueryResult<TimeSeriesDataItem[][]>)
        mockedUseTicketsCreatedTimeSeries.mockReturnValue({
            data: mockCreatedData,
            isLoading: false,
            isError: false,
        } as UseQueryResult<TimeSeriesDataItem[][]>)
        mockedFormatTimeSeriesData.mockReturnValue(mockTimeSeriesData)
        mockedPeriodAndAggregationWindowToReportingGranularity.mockReturnValue(
            mockGranularity,
        )
        mockFlags({ [FeatureFlagKey.AnalyticsNewFilters]: false })
    })

    it('should return formatted time series for closed and created tickets', () => {
        const { result } = renderHook(
            () => useCreatedVsClosedTicketsTimeSeries(),
            {
                wrapper: (({ children }) => (
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
            fromFiltersWithLogicalOperators(filters),
            mockTimezone,
            mockGranularity,
        )
        expect(mockedUseTicketsCreatedTimeSeries).toHaveBeenCalledWith(
            fromFiltersWithLogicalOperators(filters),
            mockTimezone,
            mockGranularity,
        )
    })

    it('should pass stats filters with logical operators', () => {
        mockFlags({ [FeatureFlagKey.AnalyticsNewFilters]: true })

        renderHook(() => useCreatedVsClosedTicketsTimeSeries(), {
            wrapper: (({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            )) as ComponentType,
        })

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
