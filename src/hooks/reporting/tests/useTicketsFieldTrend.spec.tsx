import {renderHook} from '@testing-library/react-hooks'

import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useCustomFieldsTicketCount} from 'hooks/reporting/metricsPerCustomField'

import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {useTicketsFieldTrend} from 'hooks/reporting/useTicketsFieldTrend'
import {
    TicketCustomFieldsMeasure,
    TicketCustomFieldsDimension,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {ReportingGranularity} from 'models/reporting/types'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {ticketInsightsSlice} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries
)
jest.mock('hooks/reporting/metricsPerCustomField')
const useCustomFieldsTicketCountMock = assumeMock(useCustomFieldsTicketCount)

describe('useTicketsFieldTrend', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            stats: {
                filters: uiStatsInitialState,
                [ticketInsightsSlice.name]: {
                    selectedCustomField: {id: 2},
                },
            },
        },
    } as RootState

    useCustomFieldsTicketCountTimeSeriesMock.mockReturnValue({
        data: {
            'Category::Subcategory': [
                [
                    {dateTime: '2023-04-07T00:00:00.000', value: 10},
                    {dateTime: '2023-04-08T00:00:00.000', value: 15},
                    {dateTime: '2023-04-09T00:00:00.000', value: 20},
                ],
            ],
        },
        isFetching: false,
    } as any)

    useCustomFieldsTicketCountMock.mockReturnValue({
        data: {
            allData: [
                {
                    [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                        'Category::Subcategory',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '45',
                },
            ],
            value: 45,
            decile: null,
        },
        isError: false,
        isFetching: false,
    })

    it('should return tickets trend', () => {
        const {result} = renderHook(() => useTicketsFieldTrend(), {
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
                labels: ['Subcategory'],
                tooltips: ['Category > Subcategory'],
            },
            legendDatasetVisibility: {0: true},
        })
    })
})
