import { PRODUCTS_PER_TICKET_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import {
    getSorting,
    initialState,
    ProductsPerTicketColumn,
    productsPerTicketSlice,
    sortingSet,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

describe('productsPerTicketSlice', () => {
    it('should keep sorting field, direction and loading state', () => {
        const newField = ProductsPerTicketColumn.Delta
        const newDirection = OrderDirection.Asc

        const newState = productsPerTicketSlice.reducer(
            initialState,
            sortingSet({
                field: newField,
                direction: newDirection,
            }),
        )

        expect(newState.sorting).toEqual({
            field: newField,
            direction: newDirection,
        })
    })

    describe('getSorting', () => {
        it('should return the current sorting', () => {
            const state = {
                ui: {
                    stats: {
                        statsTables: {
                            [PRODUCTS_PER_TICKET_SLICE_NAME]: initialState,
                        },
                    },
                },
            } as RootState

            expect(getSorting(state)).toEqual(initialState.sorting)
        })
    })
})
