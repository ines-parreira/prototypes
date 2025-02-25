import {
    fetchingMapSlice,
    fetchStatEnded,
    fetchStatStarted,
    initialState,
} from 'state/ui/stats/fetchingMapSlice'

describe('fetchingMapSlice', () => {
    describe('fetchStatStarted action', () => {
        it('should set the stat fetching status to true', () => {
            const newState = fetchingMapSlice.reducer(
                initialState,
                fetchStatStarted({
                    statName: 'overview',
                    resourceName: 'total-tickets-replied',
                }),
            )

            expect(newState).toEqual({
                'overview/total-tickets-replied': true,
            })
        })
    })

    describe('fetchStatEnded action', () => {
        it('should set the stat fetching status to false', () => {
            const newState = fetchingMapSlice.reducer(
                initialState,
                fetchStatEnded({
                    statName: 'overview',
                    resourceName: 'total-tickets-replied',
                }),
            )

            expect(newState).toEqual({
                'overview/total-tickets-replied': false,
            })
        })
    })
})
