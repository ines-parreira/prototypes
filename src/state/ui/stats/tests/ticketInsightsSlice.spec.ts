import {OrderDirection} from 'models/api/types'
import {RootState} from 'state/types'
import {
    getSelectedCustomField,
    initialState,
    setSelectedCustomField,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'

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
                })
            )

            expect(newState.selectedCustomField.id).toEqual(fieldId)
            expect(newState.selectedCustomField.label).toEqual(fieldLabel)
        })
    })

    describe('getSelectedCustomField selector', () => {
        const state = {
            ui: {
                [ticketInsightsSlice.name]: {
                    selectedCustomField: {
                        id: fieldId,
                        label: fieldLabel,
                        isLoading: false,
                    },
                    order: OrderDirection.Asc,
                },
            },
        } as unknown as RootState

        it('getSelectedCustomField', () => {
            expect(getSelectedCustomField(state)).toEqual(field)
            expect(getSelectedCustomField(state).id).toEqual(fieldId)
            expect(getSelectedCustomField(state).label).toEqual(fieldLabel)
        })
    })
})
