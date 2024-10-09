import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {assumeMock} from 'utils/testing'
import {ReportingGranularity} from 'models/reporting/types'
import {useTagsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {useTagsTicketCount} from 'hooks/reporting/metricsPerAgent'
import {ticketInsightsSlice} from 'state/ui/stats/ticketInsightsSlice'
import {RootState} from 'state/types'
import {initialState} from 'state/stats/statsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {useTagsTrend} from 'pages/stats/ticket-insights/hooks/useTagsChartTrend'
import {
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'models/reporting/cubes/TicketTagsEnrichedCube'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/timeSeries')
const useTagsTicketCountTimeSeriesMock = assumeMock(
    useTagsTicketCountTimeSeries
)
jest.mock('hooks/reporting/metricsPerAgent')
const useTagsTicketCountMock = assumeMock(useTagsTicketCount)

describe('useTagsTrend', () => {
    const fakeTagName = 'fake-tag-name'
    const defaultState = {
        stats: initialState,
        ui: {
            [ticketInsightsSlice.name]: {
                selectedCustomField: {id: 2},
            },
            stats: uiStatsInitialState,
        },
        entities: {
            tags: {
                '1010': {
                    created_datetime: '2022-01-01T12:00:00.000000+00:00',
                    decoration: {
                        color: '#FF0000',
                    },
                    deleted_datetime: null,
                    description: 'This is a fake tag',
                    id: 1010,
                    name: fakeTagName,
                    uri: '/api/tags/123/',
                    usage: 80,
                },
            },
        },
    } as unknown as RootState

    useTagsTicketCountTimeSeriesMock.mockReturnValue({
        data: {
            '1010': [
                [
                    {dateTime: '2023-04-07T00:00:00.000', value: 10},
                    {dateTime: '2023-04-08T00:00:00.000', value: 15},
                    {dateTime: '2023-04-09T00:00:00.000', value: 20},
                ],
            ],
        },
        isFetching: false,
    } as any)

    useTagsTicketCountMock.mockReturnValue({
        data: {
            allData: [
                {
                    [TicketTagsEnrichedDimension.TagId]: '1010',
                    [TicketTagsEnrichedMeasure.TicketCount]: '45',
                },
            ],
            value: 45,
            decile: null,
        },
        isError: false,
        isFetching: false,
    })

    it('should return tags trend', () => {
        const {result} = renderHook(() => useTagsTrend(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            data: [
                [
                    {dateTime: '2023-04-07T00:00:00.000', value: 10},
                    {dateTime: '2023-04-08T00:00:00.000', value: 15},
                    {dateTime: '2023-04-09T00:00:00.000', value: 20},
                ],
            ],
            granularity: ReportingGranularity.Hour,
            legendInfo: {
                labels: [fakeTagName],
                tooltips: [fakeTagName],
            },
            legendDatasetVisibility: {0: true},
        })
    })

    it('should return tags trend with tag id instead of name', () => {
        const tagId = '1010'
        const state = {
            ...defaultState,
            entities: {
                tags: {
                    '1616': {
                        created_datetime: '2022-01-01T12:00:00.000000+00:00',
                        decoration: {
                            color: '#FF0000',
                        },
                        deleted_datetime: null,
                        description: 'This is a fake tag',
                        id: 1616,
                        name: fakeTagName,
                        uri: '/api/tags/123/',
                        usage: 80,
                    },
                },
            },
        } as unknown as RootState

        const {result} = renderHook(() => useTagsTrend(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            data: [
                [
                    {dateTime: '2023-04-07T00:00:00.000', value: 10},
                    {dateTime: '2023-04-08T00:00:00.000', value: 15},
                    {dateTime: '2023-04-09T00:00:00.000', value: 20},
                ],
            ],
            granularity: ReportingGranularity.Hour,
            legendInfo: {
                labels: [tagId],
                tooltips: [tagId],
            },
            legendDatasetVisibility: {0: true},
        })
    })

    it('should return no data if no time series were returned', () => {
        useTagsTicketCountTimeSeriesMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        const {result} = renderHook(() => useTagsTrend(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            data: [],
            granularity: ReportingGranularity.Hour,
            legendInfo: {
                labels: [],
                tooltips: [],
            },
            legendDatasetVisibility: {},
        })
    })
})
