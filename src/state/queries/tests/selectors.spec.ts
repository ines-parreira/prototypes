import {RootState} from 'state/types'
import {getQueriesState, getQueryTimestamp} from '../selectors'
import {QueryKey} from '../types'

describe('queries selectors', () => {
    const state = {
        queries: {
            timestamp: {
                [QueryKey.TicketVoiceCalls]: 123,
            },
        },
    } as RootState

    it('should return queries state', () => {
        expect(getQueriesState(state)).toEqual(state.queries)
    })

    it('should return query timestamp', () => {
        expect(getQueryTimestamp(QueryKey.TicketVoiceCalls)(state)).toEqual(123)
    })
})
