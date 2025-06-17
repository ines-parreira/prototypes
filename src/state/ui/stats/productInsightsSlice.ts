import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { OrderDirection } from 'models/api/types'
import { Product } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { RootState } from 'state/types'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'state/ui/stats/constants'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'
import { getSortByName } from 'utils/getSortByName'

export type ProductInsightsSliceState = {
    products: Product[]
    productsLoading: boolean
    sorting: {
        field: ProductInsightsTableColumns
        direction: OrderDirection
        isLoading: boolean
        lastSorting: string[]
    }
}

export const initialState: ProductInsightsSliceState = {
    products: [],
    productsLoading: true,
    sorting: {
        direction: OrderDirection.Desc,
        field: ProductInsightsTableColumns.TicketsVolume,
        isLoading: true,
        lastSorting: [],
    },
}

export const productInsightsSlice = createSlice({
    name: PRODUCT_INSIGHTS_SLICE_NAME,
    initialState,
    reducers: {
        setProducts(state, action: PayloadAction<Product[]>) {
            state.products = action.payload
            state.productsLoading = false
        },
        sortingSet(
            state,
            action: PayloadAction<{
                direction: OrderDirection
                field: ProductInsightsTableColumns
            }>,
        ) {
            state.sorting.field = action.payload.field
            state.sorting.direction = action.payload.direction
            state.sorting.isLoading = true
        },
        sortingLoading(state) {
            state.sorting.isLoading = true
        },
        sortingLoaded(state, action: PayloadAction<string[]>) {
            state.sorting.isLoading = false
            state.sorting.lastSorting = action.payload
        },
    },
})

export const { setProducts, sortingSet, sortingLoading, sortingLoaded } =
    productInsightsSlice.actions

export const getSliceState = (state: RootState) =>
    state.ui.stats.statsTables[productInsightsSlice.name]

export const getProducts = createSelector(
    getSliceState,
    (state) => state.products,
)

export const getProductsLoading = createSelector(
    getSliceState,
    (state) => state.productsLoading,
)

export const getSorting = createSelector(
    getSliceState,
    (state) => state.sorting,
)

export const getSortedProducts = createSelector(
    getProducts,
    getSorting,
    (products, sorting) => {
        const { field, direction, lastSorting } = sorting

        if (field === ProductInsightsTableColumns.Product) {
            const sortedProducts = [...products].sort(getSortByName)
            return direction === OrderDirection.Asc
                ? sortedProducts
                : [...sortedProducts].reverse()
        }

        let indexedProducts: Product[] = []
        const noDataProducts: Product[] = []

        products.forEach((product) => {
            const productIndex = lastSorting.findIndex(
                (productId) => productId === product.id,
            )
            if (productIndex >= 0) {
                indexedProducts[productIndex] = product
            } else {
                noDataProducts.push(product)
            }
        })
        const sortedProducts = indexedProducts.filter(Boolean)

        return [...sortedProducts, ...noDataProducts]
    },
)
