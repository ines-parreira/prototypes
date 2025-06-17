import { opposite, OrderDirection } from 'models/api/types'
import { Product } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { RootState } from 'state/types'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'state/ui/stats/constants'
import {
    getProducts,
    getProductsLoading,
    getSliceState,
    getSortedProducts,
    initialState,
    productInsightsSlice,
    ProductInsightsSliceState,
    setProducts,
    sortingLoaded,
    sortingLoading,
    sortingSet,
} from 'state/ui/stats/productInsightsSlice'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'
import { getSortByName } from 'utils/getSortByName'

describe('productInsightsSlice', () => {
    const products: Product[] = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
        { id: '3', name: 'Product 3' },
    ]

    describe('reducers', () => {
        it('should have the correct initial state', () => {
            const state = productInsightsSlice.reducer(undefined, {
                type: 'unknown',
            })

            expect(state).toEqual(initialState)
        })

        it('should set products and update loading state', () => {
            const newState = productInsightsSlice.reducer(
                initialState,
                setProducts(products),
            )

            expect(newState.products).toEqual(products)
            expect(newState.productsLoading).toBe(false)
        })

        it('should set sorting enable the loading state and clear previous sorting', () => {
            const direction = opposite(initialState.sorting.direction)
            const field = ProductInsightsTableColumns.ReturnMentions

            const newState = productInsightsSlice.reducer(
                initialState,
                sortingSet({ direction, field }),
            )

            expect(newState.sorting).toEqual({
                direction,
                field,
                isLoading: true,
                lastSorting: [],
            })
        })

        it('should set sorting loading', () => {
            const newState = productInsightsSlice.reducer(
                initialState,
                sortingLoading(),
            )

            expect(newState.sorting).toEqual({
                ...initialState.sorting,
                isLoading: true,
                lastSorting: [],
            })
        })

        it('should set ordered product ids and disable loading', () => {
            const sortedProductIds = ['ads', 'qwe']
            const newState = productInsightsSlice.reducer(
                initialState,
                sortingLoaded(sortedProductIds),
            )

            expect(newState.sorting).toEqual({
                ...initialState.sorting,
                isLoading: false,
                lastSorting: sortedProductIds,
            })
        })
    })

    describe('selectors', () => {
        const sorting = {
            field: ProductInsightsTableColumns.TicketsVolume,
            direction: OrderDirection.Desc,
            isLoading: false,
            lastSorting: ['2', '1'],
        }
        const sliceState: ProductInsightsSliceState = {
            products: products,
            sorting,
            productsLoading: false,
        }
        const state = {
            ui: {
                stats: {
                    statsTables: {
                        [PRODUCT_INSIGHTS_SLICE_NAME]: sliceState,
                    },
                },
            },
        } as RootState

        it('getSliceState should return the slice state', () => {
            const selectedSliceState = getSliceState(state)

            expect(selectedSliceState).toEqual(sliceState)
        })

        it('should return the products from state', () => {
            const products = getProducts(state)

            expect(products).toEqual(sliceState.products)
        })

        it('should return the products loading state', () => {
            const productsLoading = getProductsLoading(state)

            expect(productsLoading).toEqual(sliceState.productsLoading)
        })

        it('should return products sorted according to the sorting state with unsorted products last', () => {
            const sortedProducts = getSortedProducts(state)

            expect(sortedProducts).toEqual([
                ...sliceState.sorting.lastSorting.map((id) =>
                    products.find((product) => product.id === id),
                ),
                products[2],
            ])
        })

        it('should return products sorted by product name in ascending order', () => {
            const sliceStateWithProductNameField: ProductInsightsSliceState = {
                products: products,
                sorting: {
                    field: ProductInsightsTableColumns.Product,
                    direction: OrderDirection.Asc,
                    isLoading: false,
                    lastSorting: [],
                },
                productsLoading: false,
            }
            const sortedByProductNameState = {
                ui: {
                    stats: {
                        statsTables: {
                            [PRODUCT_INSIGHTS_SLICE_NAME]:
                                sliceStateWithProductNameField,
                        },
                    },
                },
            } as RootState

            const sortedProducts = getSortedProducts(sortedByProductNameState)

            expect(sortedProducts).toEqual([...products].sort(getSortByName))
        })

        it('should return products sorted by product name in descending order', () => {
            const sliceStateWithProductNameField: ProductInsightsSliceState = {
                products: products,
                sorting: {
                    field: ProductInsightsTableColumns.Product,
                    direction: OrderDirection.Desc,
                    isLoading: false,
                    lastSorting: [],
                },
                productsLoading: false,
            }
            const sortedByProductNameState = {
                ui: {
                    stats: {
                        statsTables: {
                            [PRODUCT_INSIGHTS_SLICE_NAME]:
                                sliceStateWithProductNameField,
                        },
                    },
                },
            } as RootState

            const sortedProducts = getSortedProducts(sortedByProductNameState)

            expect(sortedProducts).toEqual(
                [...products].sort(getSortByName).reverse(),
            )
        })
    })
})
