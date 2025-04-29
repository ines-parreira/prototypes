import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useTicketsFieldTimeSeries } from 'hooks/reporting/ticket-insights/useTicketsFieldTimeSeries'
import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { TicketTimeReference } from 'models/stat/types'
import { initialState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { ticketInsightsSlice } from 'state/ui/stats/ticketInsightsSlice'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/useCustomFieldsTimeSeries')
const useCustomFieldsTrendMock = assumeMock(useCustomFieldsTimeSeries)

describe('useTicketsFieldTimeSeries', () => {
    const response: ReturnType<typeof useCustomFieldsTimeSeries> = {
        isFetching: false,
        data: [],
        granularity: ReportingGranularity.Hour,
        legendInfo: {
            labels: ['Subcategory'],
            tooltips: ['Category > Subcategory'],
        },
        legendDatasetVisibility: { 0: true },
    }
    const defaultState = {
        stats: initialState,
        ui: {
            stats: {
                filters: uiStatsInitialState,
                [ticketInsightsSlice.name]: {
                    selectedCustomField: { id: 2 },
                },
            },
        },
    } as RootState

    useCustomFieldsTrendMock.mockReturnValue(response)

    it('should return tickets trend', () => {
        const { result } = renderHook(() => useTicketsFieldTimeSeries(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(useCustomFieldsTrendMock).toHaveBeenCalledWith({
            selectedCustomFieldId: 2,
            ticketFieldsTicketTimeReference: TicketTimeReference.TaggedAt,
        })
        expect(result.current).toEqual(response)
    })
})
