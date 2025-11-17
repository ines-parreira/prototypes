import type { PayloadAction } from '@reduxjs/toolkit'
import { createSelector, createSlice } from '@reduxjs/toolkit'

import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { PRODUCTS_PER_TICKET_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import type { ColumnSorting } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

export const PRODUCT_ID_FIELD = TicketProductsEnrichedDimension.ProductId
export const TICKET_COUNT_FIELD = TicketProductsEnrichedMeasure.TicketCount
export const PRODUCT_NAME_FIELD = EnrichmentFields.ProductTitle
export const PRODUCT_THUMBNAIL_FIELD = EnrichmentFields.ProductThumbnailUrl

export enum ProductsPerTicketColumn {
    Product = 'product',
    TicketVolume = 'ticket_volume',
    Delta = 'delta',
}

export type ProductsPerTicketState = {
    sorting: ColumnSorting<ProductsPerTicketColumn> & {}
}

export const initialState: ProductsPerTicketState = {
    sorting: {
        field: ProductsPerTicketColumn.TicketVolume,
        direction: OrderDirection.Desc,
    },
}

export const productsPerTicketSlice = createSlice({
    name: PRODUCTS_PER_TICKET_SLICE_NAME,
    initialState,
    reducers: {
        sortingSet(
            state,
            action: PayloadAction<ColumnSorting<ProductsPerTicketColumn>>,
        ) {
            state.sorting.field = action.payload.field
            state.sorting.direction = action.payload.direction
        },
    },
})

export const { sortingSet } = productsPerTicketSlice.actions

const getSliceState = (state: RootState) =>
    state.ui.stats.statsTables[productsPerTicketSlice.name]

export const getSorting = createSelector(
    getSliceState,
    (state) => state.sorting,
)
