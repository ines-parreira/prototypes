import type { TicketInsightsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import {
    getCustomFieldsOrder,
    getHeatmapMode,
    getSelectedCustomField,
    getValueMode,
    initialState,
    setOrder,
    setSelectedCustomField,
    ticketInsightsSlice,
    toggleHeatmapMode,
    toggleValueMode,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { ValueMode } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

describe('ticketInsightsSlice', () => {
    const fieldId = 123
    const fieldLabel = 'someLabel'
    const field = {
        id: fieldId,
        label: fieldLabel,
        isLoading: false,
    }

    describe('reducers', () => {
        it('should store the selected custom field id and label', () => {
            const newState = ticketInsightsSlice.reducer(
                initialState,
                setSelectedCustomField({
                    id: fieldId,
                    label: fieldLabel,
                    isLoading: false,
                }),
            )

            expect(newState.selectedCustomField.id).toEqual(fieldId)
            expect(newState.selectedCustomField.label).toEqual(fieldLabel)
        })

        it('should set order', () => {
            const sortingColumn: TicketInsightsOrder['column'] = 'total'
            const newState = ticketInsightsSlice.reducer(
                initialState,
                setOrder({ column: sortingColumn }),
            )

            expect(newState.order).toEqual({
                direction: OrderDirection.Desc,
                column: sortingColumn,
            })
        })

        it('should toggle value mode', () => {
            const newState = ticketInsightsSlice.reducer(
                initialState,
                toggleValueMode(),
            )

            expect(newState.valueMode).not.toEqual(initialState.valueMode)
            expect(newState.valueMode).toEqual(ValueMode.Percentage)
        })

        it('should toggle heatmap mode', () => {
            const newState = ticketInsightsSlice.reducer(
                initialState,
                toggleHeatmapMode(),
            )

            expect(newState.heatmapMode).toEqual(!initialState.heatmapMode)
        })
    })

    describe('selectors', () => {
        const order = { column: 'label', direction: OrderDirection.Asc }
        const valueMode = ValueMode.TotalCount
        const isHeatmapMode = true
        const state = {
            ui: {
                stats: {
                    [ticketInsightsSlice.name]: {
                        selectedCustomField: {
                            id: fieldId,
                            label: fieldLabel,
                            isLoading: false,
                        },
                        order,
                        valueMode,
                        heatmapMode: isHeatmapMode,
                    },
                },
            },
        } as RootState

        it('should return selected custom field', () => {
            expect(getSelectedCustomField(state)).toEqual(field)
            expect(getSelectedCustomField(state).id).toEqual(fieldId)
            expect(getSelectedCustomField(state).label).toEqual(fieldLabel)
        })

        it('should return ordering', () => {
            expect(getCustomFieldsOrder(state)).toEqual(order)
        })

        it('should return heatmapMode', () => {
            expect(getHeatmapMode(state)).toEqual(isHeatmapMode)
        })

        it('should return valueMode', () => {
            expect(getValueMode(state)).toEqual(valueMode)
        })
    })
})
