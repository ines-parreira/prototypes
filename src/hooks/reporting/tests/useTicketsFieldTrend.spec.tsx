import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {assumeMock} from 'utils/testing'
import {ReportingGranularity} from 'models/reporting/types'
import {useTicketsFieldTrend} from 'hooks/reporting/useTicketsFieldTrend'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {ticketInsightsSlice} from 'state/ui/stats/ticketInsightsSlice'
import {RootState} from 'state/types'
import {initialState} from 'state/stats/reducers'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/timeSeries')
const useCustomFieldsTicketCountTimeSeriesMock = assumeMock(
    useCustomFieldsTicketCountTimeSeries
)

describe('useTicketsFieldTrend', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            [ticketInsightsSlice.name]: {
                selectedCustomField: {id: 2},
            },
            stats: uiStatsInitialState,
        },
    } as unknown as RootState

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
