import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {assumeMock} from 'utils/testing'
import {useTicketsDistribution} from 'pages/stats/useTicketsDistribution'
import {useCustomFieldsTicketCount} from 'hooks/reporting/metricsPerDimension'
import {ticketInsightsSlice} from 'state/ui/stats/ticketInsightsSlice'
import {RootState} from 'state/types'
import {initialState} from 'state/stats/reducers'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {ReportingMetricItem} from 'hooks/reporting/useMetricPerDimension'
import {Cubes} from 'models/reporting/cubes'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/metricsPerDimension')
const useCustomFieldsTicketCountMock = assumeMock(useCustomFieldsTicketCount)

const transformData = (
    data: ReportingMetricItem<Cubes>,
    totalValue: number,
    maxValue: number
) => ({
    category: data[TicketCustomFieldsDimension.TicketCustomFieldsValueString],
    value: Number(
        data[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
    ),
    valueInPercentage:
        (100 *
            Number(
                data[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
            )) /
        totalValue,
    gaugePercentage:
        (100 *
            Number(
                data[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
            )) /
        maxValue,
})

describe('useTicketsDistribution', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            [ticketInsightsSlice.name]: {
                selectedCustomField: {id: 2},
            },
            stats: uiStatsInitialState,
        },
    } as unknown as RootState

    const maxTicketCount = 16
    const ticketsCountTotal = 20
    const allData = [
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '4',
        },
        {
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                'Level 0::Level 1',
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                String(maxTicketCount),
        },
    ]

    useCustomFieldsTicketCountMock.mockReturnValue({
        data: {allData},
        isFetching: false,
    } as any)

    it('should return tickets distribution', () => {
        const {result} = renderHook(() => useTicketsDistribution(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: 0,
            outsideTopTotalPercentage: 0,
            ticketsCountTotal,
            topData: allData.map((item) =>
                transformData(item, ticketsCountTotal, maxTicketCount)
            ),
        })
    })

    it('should return calculate outside data', () => {
        const maxTicketCount = 145
        const ticketsCountTotal = 190
        const allData = new Array(20).fill(null).map((_, index) => ({
            [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `Level ${index}`,
            [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: `${index}`,
        }))

        useCustomFieldsTicketCountMock.mockReturnValue({
            data: {allData},
            isFetching: false,
        } as any)
        const {result} = renderHook(() => useTicketsDistribution(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: maxTicketCount,
            outsideTopTotalPercentage: 100,
            ticketsCountTotal: ticketsCountTotal,
            topData: allData
                .slice(0, 10)
                .map((item) =>
                    transformData(item, ticketsCountTotal, maxTicketCount)
                ),
        })
    })
})
