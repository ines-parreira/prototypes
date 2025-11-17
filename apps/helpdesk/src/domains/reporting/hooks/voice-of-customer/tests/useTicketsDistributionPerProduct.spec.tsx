import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    getProductName,
    useTicketsPerProductDistribution,
} from 'domains/reporting/hooks/voice-of-customer/useTicketsDistributionPerProduct'
import { useTicketsPerProductTrend } from 'domains/reporting/hooks/voice-of-customer/useTicketsPerProductTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { PRODUCTS_PER_TICKET_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import {
    initialState,
    PRODUCT_ID_FIELD,
    PRODUCT_NAME_FIELD,
    ProductsPerTicketColumn,
    TICKET_COUNT_FIELD,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { OrderDirection } from 'models/api/types'
import { mockStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/voice-of-customer/useTicketsPerProductTrend')
const useTicketsPerProductTrendMock = assumeMock(useTicketsPerProductTrend)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('useTicketsDistributionPerProduct', () => {
    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: '',
            end_datetime: '',
        },
    }
    const userTimezone = 'UTC'
    const defaultState = {
        ui: {
            stats: {
                statsTables: {
                    [PRODUCTS_PER_TICKET_SLICE_NAME]: initialState,
                },
            },
        },
    }
    const exampleData = {
        value: [
            {
                [PRODUCT_ID_FIELD]: '1',
                [PRODUCT_NAME_FIELD]: 'Some name',
                [TICKET_COUNT_FIELD]: '10',
            },
            {
                [PRODUCT_ID_FIELD]: '2',
                [PRODUCT_NAME_FIELD]: 'Some other name',
                [TICKET_COUNT_FIELD]: '40',
            },
        ],
        prevValue: [
            {
                [PRODUCT_ID_FIELD]: '1',
                [TICKET_COUNT_FIELD]: '1',
            },
            {
                [PRODUCT_ID_FIELD]: '2',
                [TICKET_COUNT_FIELD]: '10',
            },
        ],
    }

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        useTicketsPerProductTrendMock.mockReturnValue({
            data: exampleData,
            isError: false,
            isFetching: false,
        })
    })

    it('should return top products per Ticket volume', () => {
        const { result } = renderHook(
            () => useTicketsPerProductDistribution(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            data: [
                {
                    productId: '2',
                    value: 40,
                    prevValue: 10,
                    gaugePercentage: 100,
                    name: getProductName('2', 'Some other name'),
                    previousValueInPercentage: 20,
                    valueInPercentage: 80,
                },
                {
                    productId: '1',
                    value: 10,
                    prevValue: 1,
                    gaugePercentage: 25,
                    name: getProductName('1', 'Some name'),
                    previousValueInPercentage: 2,
                    valueInPercentage: 20,
                },
            ],
            isFetching: false,
        })
    })

    it('should return top products per Delta', () => {
        const state = {
            ...defaultState,
            ui: {
                ...defaultState.ui,
                stats: {
                    ...defaultState.ui.stats,
                    statsTables: {
                        ...defaultState.ui.stats.statsTables,
                        [PRODUCTS_PER_TICKET_SLICE_NAME]: {
                            ...initialState,
                            sorting: {
                                ...initialState.sorting,
                                field: ProductsPerTicketColumn.Delta,
                            },
                        },
                    },
                },
            },
        }
        const { result } = renderHook(
            () => useTicketsPerProductDistribution(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            data: [
                {
                    productId: '2',
                    value: 40,
                    prevValue: 10,
                    gaugePercentage: 100,
                    name: getProductName('2', 'Some other name'),
                    previousValueInPercentage: 20,
                    valueInPercentage: 80,
                },
                {
                    productId: '1',
                    value: 10,
                    prevValue: 1,
                    gaugePercentage: 25,
                    name: getProductName('1', 'Some name'),
                    previousValueInPercentage: 2,
                    valueInPercentage: 20,
                },
            ],
            isFetching: false,
        })
    })

    it('should return top products per Product name', () => {
        const state = {
            ...defaultState,
            ui: {
                ...defaultState.ui,
                stats: {
                    ...defaultState.ui.stats,
                    statsTables: {
                        ...defaultState.ui.stats.statsTables,
                        [PRODUCTS_PER_TICKET_SLICE_NAME]: {
                            ...initialState,
                            sorting: {
                                ...initialState.sorting,
                                field: ProductsPerTicketColumn.Product,
                            },
                        },
                    },
                },
            },
        }
        const { result } = renderHook(
            () => useTicketsPerProductDistribution(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            data: [
                {
                    productId: '2',
                    value: 40,
                    prevValue: 10,
                    gaugePercentage: 100,
                    name: getProductName('2', 'Some other name'),
                    previousValueInPercentage: 20,
                    valueInPercentage: 80,
                },
                {
                    productId: '1',
                    value: 10,
                    prevValue: 1,
                    gaugePercentage: 25,
                    name: getProductName('1', 'Some name'),
                    previousValueInPercentage: 2,
                    valueInPercentage: 20,
                },
            ],
            isFetching: false,
        })
    })

    it('should return top products per Product name in reverse order', () => {
        const state = {
            ...defaultState,
            ui: {
                ...defaultState.ui,
                stats: {
                    ...defaultState.ui.stats,
                    statsTables: {
                        ...defaultState.ui.stats.statsTables,
                        [PRODUCTS_PER_TICKET_SLICE_NAME]: {
                            ...initialState,
                            sorting: {
                                direction: OrderDirection.Asc,
                                field: ProductsPerTicketColumn.Product,
                            },
                        },
                    },
                },
            },
        }
        const { result } = renderHook(
            () => useTicketsPerProductDistribution(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            data: [
                {
                    productId: '1',
                    value: 10,
                    prevValue: 1,
                    gaugePercentage: 25,
                    name: getProductName('1', 'Some name'),
                    previousValueInPercentage: 2,
                    valueInPercentage: 20,
                },
                {
                    productId: '2',
                    value: 40,
                    prevValue: 10,
                    gaugePercentage: 100,
                    name: getProductName('2', 'Some other name'),
                    previousValueInPercentage: 20,
                    valueInPercentage: 80,
                },
            ],
            isFetching: false,
        })
    })

    it('should render missing data as 0', () => {
        const data = {
            value: [
                {
                    [PRODUCT_ID_FIELD]: '1',
                    [PRODUCT_NAME_FIELD]: 'Some name',
                    [TICKET_COUNT_FIELD]: null,
                },
                {
                    [PRODUCT_ID_FIELD]: '2',
                    [PRODUCT_NAME_FIELD]: null,
                    [TICKET_COUNT_FIELD]: null,
                },
            ],
            prevValue: [
                {
                    [PRODUCT_ID_FIELD]: '1',
                    [TICKET_COUNT_FIELD]: null,
                },
                {
                    [PRODUCT_ID_FIELD]: '2',
                    [TICKET_COUNT_FIELD]: null,
                },
            ],
        }
        useTicketsPerProductTrendMock.mockReturnValue({
            data,
            isError: false,
            isFetching: false,
        })

        const { result } = renderHook(
            () => useTicketsPerProductDistribution(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            data: [
                {
                    productId: '2',
                    value: 0,
                    prevValue: 0,
                    gaugePercentage: 0,
                    name: getProductName('2', null),
                    previousValueInPercentage: 0,
                    valueInPercentage: 0,
                },
                {
                    productId: '1',
                    value: 0,
                    prevValue: 0,
                    gaugePercentage: 0,
                    name: getProductName('1', 'Some name'),
                    previousValueInPercentage: 0,
                    valueInPercentage: 0,
                },
            ],
            isFetching: false,
        })
    })

    it('should return empty array when no data', () => {
        useTicketsPerProductTrendMock.mockReturnValue({
            data: { value: [], prevValue: [] },
            isError: false,
            isFetching: false,
        })

        const { result } = renderHook(
            () => useTicketsPerProductDistribution(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            data: [],
            isFetching: false,
        })
    })
})
