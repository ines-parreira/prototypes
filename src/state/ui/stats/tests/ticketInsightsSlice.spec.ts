import {RootState} from 'state/types'
import {
    getSelectedCustomField,
    initialState,
    setSelectedCustomField,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'

describe('ticketInsightsSlice', () => {
    const field = {
        id: 123,
        isLoading: false,
    }

    describe('reducers', () => {
        it('should store the selected custom field id', () => {
            const newState = ticketInsightsSlice.reducer(
                initialState,
                setSelectedCustomField(field)
            )

            expect(newState.selectedCustomField).toEqual(field)
        })
    })

    describe('getSelectedCustomField selector', () => {
        const state = {
            ui: {
                [ticketInsightsSlice.name]: {
                    selectedCustomField: field,
                },
            },
        } as RootState

        expect(getSelectedCustomField(state)).toEqual(field)
    })
})
