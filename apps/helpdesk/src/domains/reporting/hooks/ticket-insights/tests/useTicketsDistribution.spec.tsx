import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { useCustomFieldsTicketCount } from 'domains/reporting/hooks/metricsPerCustomField'
import { useTicketsDistribution } from 'domains/reporting/hooks/ticket-insights/useTicketsDistribution'
import type { ReportingMetricItem } from 'domains/reporting/hooks/types'
import {
    BREAKDOWN_FIELD,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import type { RootState } from 'state/types'

const mockStore = configureMockStore([thunk])

jest.mock('domains/reporting/hooks/metricsPerCustomField')
const useCustomFieldsTicketCountMock = assumeMock(useCustomFieldsTicketCount)

const transformData = (
    data: ReportingMetricItem,
    totalValue: number,
    maxValue: number,
    ticketCountField: string = VALUE_FIELD,
    customFieldDimension: string = BREAKDOWN_FIELD,
) => ({
    category: data[String(stripEscapedQuotes(customFieldDimension))],
    value: Number(data[ticketCountField]),
    valueInPercentage: (100 * Number(data[ticketCountField])) / totalValue,
    gaugePercentage: (100 * Number(data[ticketCountField])) / maxValue,
})

describe('useTicketsDistribution', () => {
    const selectedCustomFieldId = 2
    const defaultState = {
        stats: initialState,
        ui: {
            stats: {
                filters: uiStatsInitialState,
            },
        },
    } as RootState

    const maxTicketCount = 16
    const ticketsCountTotal = 26
    const allData = [
        {
            [BREAKDOWN_FIELD]: 'Level 0',
            [VALUE_FIELD]: '4',
        },
        {
            [BREAKDOWN_FIELD]: 'Level 0::Level 1',
            [VALUE_FIELD]: String(maxTicketCount),
        },
        {
            [BREAKDOWN_FIELD]: '\"Level 0::Level 1\"',
            [VALUE_FIELD]: '6',
        },
    ]

    beforeEach(() => {
        useCustomFieldsTicketCountMock.mockReturnValue({
            data: { allData },
            isFetching: false,
        } as any)
    })

    it('should return placeholder for missing dimension value', () => {
        const data = [
            {
                [BREAKDOWN_FIELD]: null,
                [VALUE_FIELD]: '4',
            },
        ]

        useCustomFieldsTicketCountMock.mockReturnValue({
            data: { allData: data },
            isFetching: false,
        } as any)

        const { result } = renderHook(
            () => useTicketsDistribution(selectedCustomFieldId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: 0,
            outsideTopTotalPercentage: 0,
            outsideTopTotalGaugePercentage: 0,
            ticketsCountTotal: 4,
            topData: data.map((item) =>
                transformData(
                    {
                        ...item,
                        [BREAKDOWN_FIELD]: NOT_AVAILABLE_PLACEHOLDER,
                    },
                    4,
                    4,
                ),
            ),
        })
    })

    it('should return 0 when no data', () => {
        useCustomFieldsTicketCountMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        const { result } = renderHook(
            () => useTicketsDistribution(selectedCustomFieldId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: 0,
            outsideTopTotalPercentage: 0,
            outsideTopTotalGaugePercentage: 100,
            ticketsCountTotal: 0,
            topData: [],
        })
    })

    it('should return tickets distribution', () => {
        const { result } = renderHook(
            () => useTicketsDistribution(selectedCustomFieldId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: 0,
            outsideTopTotalPercentage: 0,
            outsideTopTotalGaugePercentage: 0,
            ticketsCountTotal,
            topData: allData.map((item) =>
                transformData(
                    {
                        ...item,
                        [BREAKDOWN_FIELD]: stripEscapedQuotes(
                            item[BREAKDOWN_FIELD],
                        ),
                    },
                    ticketsCountTotal,
                    maxTicketCount,
                ),
            ),
        })
    })

    it('should return calculate outside data', () => {
        const maxTicketCount = 145
        const ticketsCountTotal = 190
        const allData = Array.from({ length: 20 }, (_, index) => ({
            [BREAKDOWN_FIELD]: `Level ${index}`,
            [VALUE_FIELD]: `${index}`,
        }))

        useCustomFieldsTicketCountMock.mockReturnValue({
            data: { allData },
            isFetching: false,
        } as any)
        const { result } = renderHook(
            () => useTicketsDistribution(selectedCustomFieldId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: maxTicketCount,
            outsideTopTotalPercentage: calculatePercentage(
                maxTicketCount,
                ticketsCountTotal,
            ),
            outsideTopTotalGaugePercentage: 100,
            ticketsCountTotal: ticketsCountTotal,
            topData: allData
                .slice(0, 10)
                .map((item) =>
                    transformData(item, ticketsCountTotal, maxTicketCount),
                ),
        })
    })

    it('should use fallback field name "ticketCount" when VALUE_FIELD is not found in measures', () => {
        const dataWithFallback = [
            {
                ticketCount: '10',
                [BREAKDOWN_FIELD]: 'Level 0',
            },
            {
                ticketCount: '20',
                [BREAKDOWN_FIELD]: 'Level 1',
            },
        ]

        useCustomFieldsTicketCountMock.mockReturnValue({
            data: {
                measures: ['ticketCount'],
                dimensions: [BREAKDOWN_FIELD],
                allData: dataWithFallback,
            },
            isFetching: false,
        } as any)

        const { result } = renderHook(
            () => useTicketsDistribution(selectedCustomFieldId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: 0,
            outsideTopTotalPercentage: 0,
            outsideTopTotalGaugePercentage: 0,
            ticketsCountTotal: 30,
            topData: dataWithFallback.map((item) =>
                transformData(item, 30, 20, 'ticketCount'),
            ),
        })
    })

    it('should use fallback field name "customFieldValue" when BREAKDOWN_FIELD is not found in dimensions', () => {
        const dataWithFallback = [
            {
                [VALUE_FIELD]: '10',
                customFieldValue: 'Level 0',
            },
            {
                [VALUE_FIELD]: '20',
                customFieldValue: 'Level 1',
            },
        ]

        useCustomFieldsTicketCountMock.mockReturnValue({
            data: {
                measures: [VALUE_FIELD],
                dimensions: ['customFieldValue'],
                allData: dataWithFallback,
            },
            isFetching: false,
        } as any)

        const { result } = renderHook(
            () => useTicketsDistribution(selectedCustomFieldId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: 0,
            outsideTopTotalPercentage: 0,
            outsideTopTotalGaugePercentage: 0,
            ticketsCountTotal: 30,
            topData: dataWithFallback.map((item) =>
                transformData(item, 30, 20, VALUE_FIELD, 'customFieldValue'),
            ),
        })
    })

    it('should use both fallback field names when neither constant is found in measures or dimensions', () => {
        const dataWithBothFallbacks = [
            {
                ticketCount: '10',
                customFieldValue: 'Level 0',
            },
            {
                ticketCount: '20',
                customFieldValue: 'Level 1',
            },
        ]

        useCustomFieldsTicketCountMock.mockReturnValue({
            data: {
                measures: ['ticketCount'],
                dimensions: ['customFieldValue'],
                allData: dataWithBothFallbacks,
            },
            isFetching: false,
        } as any)

        const { result } = renderHook(
            () => useTicketsDistribution(selectedCustomFieldId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isFetching: false,
            outsideTopTotal: 0,
            outsideTopTotalPercentage: 0,
            outsideTopTotalGaugePercentage: 0,
            ticketsCountTotal: 30,
            topData: dataWithBothFallbacks.map((item) =>
                transformData(item, 30, 20, 'ticketCount', 'customFieldValue'),
            ),
        })
    })
})
