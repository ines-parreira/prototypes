import { Provider } from 'react-redux'

import { MergedRecordWithEnrichment } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    PRODUCT_ENRICHMENT_ENTITY_ID,
    useTicketCountPerProductWithEnrichment,
} from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import {
    useProductsSorting,
    useSortedProducts,
} from 'domains/reporting/hooks/voice-of-customer/useSortedProducts'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import { PRODUCT_ID_DIMENSION } from 'domains/reporting/models/queryFactories/voice-of-customer/sentimentPerProduct'
import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import {
    initialState,
    productsLoading,
    setProducts,
    sortingLoaded,
    sortingLoading,
} from 'domains/reporting/state/ui/stats/productInsightsSlice'
import {
    PRODUCT_ID_FIELD,
    PRODUCT_NAME_FIELD,
    PRODUCT_THUMBNAIL_FIELD,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { RootState } from 'state/types'
import { assetsUrl } from 'utils'
import { assumeMock, mockStore } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/voice-of-customer/metricsPerProduct')
const useTicketCountPerProductWithEnrichmentMock = assumeMock(
    useTicketCountPerProductWithEnrichment,
)

describe('useSortedProducts', () => {
    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: '',
            end_datetime: '',
        },
    }
    const defaultState = {
        stats: {
            filters: statsFilters,
        },
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: statsFilters,
                },
                statsTables: {
                    [PRODUCT_INSIGHTS_SLICE_NAME]: initialState,
                },
            },
        },
    }
    const productId = 123
    const anotherProductId = 456
    const exampleData = [
        {
            [TicketProductsEnrichedMeasure.TicketCount]: String(50),
            [PRODUCT_ID_DIMENSION]: String(productId),
            [TicketProductsEnrichedDimension.StoreId]: String(33),
            [PRODUCT_ENRICHMENT_ENTITY_ID]: productId,
            [PRODUCT_NAME_FIELD]: 'Some name',
            [EnrichmentFields.ProductThumbnailUrl]: assetsUrl(
                '/img/stats/voc-preview/product_01.png',
            ),
        },
        {
            [TicketProductsEnrichedMeasure.TicketCount]: String(30),
            [PRODUCT_ID_DIMENSION]: String(anotherProductId),
            [TicketProductsEnrichedDimension.StoreId]: String(24),
            [PRODUCT_ENRICHMENT_ENTITY_ID]: anotherProductId,
            [PRODUCT_NAME_FIELD]: 'Some other name',
            [EnrichmentFields.ProductThumbnailUrl]: assetsUrl(
                '/img/stats/voc-preview/product_02.png',
            ),
        },
    ] as MergedRecordWithEnrichment[]

    beforeEach(() => {
        useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
            data: {
                value: null,
                allData: exampleData,
            },
            isFetching: false,
            isError: false,
        })
    })

    describe('useSortedProducts', () => {
        it('returns products array', () => {
            const { result } = renderHook(() => useSortedProducts(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

            expect(Array.isArray(result.current.products)).toBeTruthy()
        })

        it('returns isLoading', () => {
            const isFetching = true
            useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
                data: null,
                isFetching,
                isError: false,
            })

            const { result } = renderHook(() => useSortedProducts(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

            expect(result.current.isLoading).toBe(isFetching)
        })
    })

    describe('useProductsSorting', () => {
        const dataWithEnrichment = {
            value: 123,
            allData: exampleData,
        }

        it('should store loaded products in state', () => {
            const column = ProductInsightsTableColumns.Product
            const isFetching = false
            const state = {
                stats: {
                    filters: statsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters: statsFilters,
                        },
                        statsTables: {
                            [PRODUCT_INSIGHTS_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: column,
                                },
                            },
                        },
                    },
                },
            } as RootState
            const store = mockStore(state)

            renderHook(
                () =>
                    useProductsSorting(column, dataWithEnrichment, isFetching),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            expect(store.getActions()).toContainEqual(
                setProducts(
                    dataWithEnrichment.allData.map((i) => ({
                        id: i[PRODUCT_ID_FIELD],
                        name: i[PRODUCT_NAME_FIELD],
                        thumbnail_url: i[PRODUCT_THUMBNAIL_FIELD],
                    })),
                ),
            )
        })

        it('should trigger products loading state', () => {
            const column = ProductInsightsTableColumns.Product
            const isFetching = true
            const state = {
                stats: {
                    filters: statsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters: statsFilters,
                        },
                        statsTables: {
                            [PRODUCT_INSIGHTS_SLICE_NAME]: {
                                ...initialState,
                                productsLoading: false,
                                sorting: {
                                    ...initialState.sorting,
                                    field: column,
                                },
                            },
                        },
                    },
                },
            } as RootState
            const store = mockStore(state)

            renderHook(
                () =>
                    useProductsSorting(column, dataWithEnrichment, isFetching),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            expect(store.getActions()).toContainEqual(productsLoading())
        })

        it('should store empty array of loaded products in state', () => {
            const column = ProductInsightsTableColumns.Product
            const isFetching = false
            const state = {
                stats: {
                    filters: statsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters: statsFilters,
                        },
                        statsTables: {
                            [PRODUCT_INSIGHTS_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: column,
                                },
                            },
                        },
                    },
                },
            } as RootState
            const store = mockStore(state)

            renderHook(() => useProductsSorting(column, null, isFetching), {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            })

            expect(store.getActions()).toContainEqual(setProducts([]))
        })

        it('should store applicable product sorting in state', () => {
            const column = ProductInsightsTableColumns.PositiveSentiment
            const isFetching = false
            const state = {
                stats: {
                    filters: statsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters: statsFilters,
                        },
                        statsTables: {
                            [PRODUCT_INSIGHTS_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    field: column,
                                },
                            },
                        },
                    },
                },
            } as RootState
            const store = mockStore(state)

            renderHook(
                () =>
                    useProductsSorting(column, dataWithEnrichment, isFetching),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            expect(store.getActions()).toContainEqual(
                sortingLoaded(
                    dataWithEnrichment.allData.map((i) => i[PRODUCT_ID_FIELD]),
                ),
            )
        })

        it('should trigger loading state when sorting field loading', () => {
            const column = ProductInsightsTableColumns.NegativeSentiment
            const isFetching = true
            const state = {
                stats: {
                    filters: statsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters: statsFilters,
                        },
                        statsTables: {
                            [PRODUCT_INSIGHTS_SLICE_NAME]: {
                                ...initialState,
                                sorting: {
                                    ...initialState.sorting,
                                    isLoading: false,
                                    field: column,
                                },
                            },
                        },
                    },
                },
            } as RootState
            const store = mockStore(state)

            renderHook(
                () =>
                    useProductsSorting(column, dataWithEnrichment, isFetching),
                {
                    wrapper: ({ children }) => (
                        <Provider store={store}>{children}</Provider>
                    ),
                },
            )

            expect(store.getActions()).toContainEqual(sortingLoading())
        })
    })
})
