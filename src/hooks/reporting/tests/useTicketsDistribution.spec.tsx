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
import {useTicketsDistribution} from 'hooks/reporting/useTicketsDistribution'
import {useCustomFieldsTicketCount} from 'hooks/reporting/metricsPerAgent'
import {ticketInsightsSlice} from 'state/ui/stats/ticketInsightsSlice'
import {RootState} from 'state/types'
import {initialState} from 'state/stats/statsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {ReportingMetricItem} from 'hooks/reporting/useMetricPerDimension'
import {Cubes} from 'models/reporting/cubes'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/reporting/metricsPerAgent')
const useCustomFieldsTicketCountMock = assumeMock(useCustomFieldsTicketCount)

const transformData = (
    data: ReportingMetricItem<Cubes>,
    totalValue: number,
    maxValue: number,
    ticketCountField: string = TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
    customFieldDimension: string = TicketCustomFieldsDimension.TicketCustomFieldsValueString
) => ({
    category: data[customFieldDimension],
    value: Number(data[ticketCountField]),
    valueInPercentage: (100 * Number(data[ticketCountField])) / totalValue,
    gaugePercentage: (100 * Number(data[ticketCountField])) / maxValue,
})

describe('useTicketsDistribution', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            stats: {
                [ticketInsightsSlice.name]: {
                    selectedCustomField: {id: 2},
                },
                filters: uiStatsInitialState,
            },
        },
    } as RootState

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

    beforeEach(() => {
        useCustomFieldsTicketCountMock.mockReturnValue({
            data: {allData},
            isFetching: false,
        } as any)
    })

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
            outsideTopTotalGaugePercentage: 0,
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
            outsideTopTotalPercentage:
                (100 * maxTicketCount) / ticketsCountTotal,
            outsideTopTotalGaugePercentage: 100,
            ticketsCountTotal: ticketsCountTotal,
            topData: allData
                .slice(0, 10)
                .map((item) =>
                    transformData(item, ticketsCountTotal, maxTicketCount)
                ),
        })
    })
})
