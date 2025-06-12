import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Product } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { RootState } from 'state/types'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'state/ui/stats/constants'

export type ProductInsightsSliceState = {
    products: Product[]
    isLoading: boolean
}

export const initialState: ProductInsightsSliceState = {
    products: [],
    isLoading: true,
}

export const productInsightsSlice = createSlice({
    name: PRODUCT_INSIGHTS_SLICE_NAME,
    initialState,
    reducers: {
        setProducts(state, action: PayloadAction<Product[]>) {
            state.products = action.payload
            state.isLoading = false
        },
    },
})

export const { setProducts } = productInsightsSlice.actions

export const getSliceState = (state: RootState) =>
    state.ui.stats.statsTables[productInsightsSlice.name]

export const getProducts = createSelector(
    getSliceState,
    (state) => state.products,
)
