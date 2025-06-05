import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { EnrichmentFields } from 'models/reporting/types'
import { RootState } from 'state/types'
import { PRODUCTS_PER_TICKET_SLICE_NAME } from 'state/ui/stats/constants'
import { ColumnSorting } from 'state/ui/stats/types'

export const PRODUCT_ID_FIELD = TicketProductsEnrichedDimension.ProductId
export const TICKET_COUNT_FIELD = TicketProductsEnrichedMeasure.TicketCount
export const PRODUCT_NAME_FIELD = EnrichmentFields.ProductTitle

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
