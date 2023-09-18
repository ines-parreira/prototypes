import {RootState} from 'state/types'
import {
    getSelectedCustomFieldId,
    initialState,
    setSelectedCustomFieldId,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'

describe('ticketInsightsSlice', () => {
    const fieldId = 123

    describe('reducers', () => {
        it('should store the selected custom field id', () => {
            const newState = ticketInsightsSlice.reducer(
                initialState,
                setSelectedCustomFieldId(fieldId)
            )

            expect(newState.selectedCustomFieldId).toEqual(fieldId)
        })
    })

    describe('getSelectedCustomFieldId selector', () => {
        const state = {
            ui: {
                [ticketInsightsSlice.name]: {
                    selectedCustomFieldId: fieldId,
                },
            },
        } as RootState

        expect(getSelectedCustomFieldId(state)).toEqual(fieldId)
    })
})
