import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector, createSlice } from '@reduxjs/toolkit'
import { getSortByName } from '@repo/utils'

import { getActiveViewFromTableSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import type { Product } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import {
    LeadColumn,
    productInsightsTableActiveView,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import { getProductInsightsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import type { RootState } from 'state/types'

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
        productsLoading(state) {
            state.productsLoading = true
        },
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

export const {
    productsLoading,
    setProducts,
    sortingSet,
    sortingLoading,
    sortingLoaded,
} = productInsightsSlice.actions

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
    getProductInsightsTableConfigSettingsJS,
    (state, tableSettings) => {
        const activeViewFromSettings = getActiveViewFromTableSetting<
            ProductInsightsTableColumns,
            never
        >(tableSettings)
        const activeView =
            activeViewFromSettings ?? productInsightsTableActiveView
        const fieldVisible =
            activeView.metrics.find(
                (column) => column.id === state.sorting.field,
            )?.visibility ?? false
        const sortingField = fieldVisible ? state.sorting.field : LeadColumn

        return { ...state.sorting, field: sortingField }
    },
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
