import { Product } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { RootState } from 'state/types'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'state/ui/stats/constants'
import {
    getProducts,
    getSliceState,
    initialState,
    productInsightsSlice,
    setProducts,
} from 'state/ui/stats/productInsightsSlice'

describe('productInsightsSlice', () => {
    const products: Product[] = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
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
            expect(newState.isLoading).toBe(false)
        })
    })

    describe('selectors', () => {
        const state = {
            ui: {
                stats: {
                    statsTables: {
                        [PRODUCT_INSIGHTS_SLICE_NAME]: {
                            products: products,
                            isLoading: false,
                        },
                    },
                },
            },
        } as RootState

        it('getSliceState should return the slice state', () => {
            const sliceState = getSliceState(state)

            expect(sliceState).toEqual({
                products: products,
                isLoading: false,
            })
        })

        it('getProducts should return the products from state', () => {
            const products = getProducts(state)

            expect(products).toEqual(products)
        })
    })
})
