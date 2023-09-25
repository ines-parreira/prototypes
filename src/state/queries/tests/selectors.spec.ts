import {RootState} from 'state/types'
import {getQueriesState, getQueryTimestamp} from '../selectors'

describe('queries selectors', () => {
    const state = {
        queries: {
            timestamp: {
                '["QK"]': 123,
            },
        },
    } as unknown as RootState

    it('should return queries state', () => {
        expect(getQueriesState(state)).toEqual(state.queries)
    })

    it('should return query timestamp', () => {
        expect(getQueryTimestamp(['QK'])(state)).toEqual(123)
    })
})
